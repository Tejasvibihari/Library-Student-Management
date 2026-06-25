/**
 * paymentServiceV2.js
 *
 * Records a payment, creates an invoice, and syncs the student's account.
 *
 * Day-based flow:
 *   1. Look up student + get live account state
 *   2. Convert amountPaid → purchasedDays
 *   3. Apply to currentRemainingDays (settling overdue first)
 *   4. Derive new validTill, paymentStatus, renewal
 *   5. Create Payment → Invoice → Update Student (with rollback on failure)
 */

import PaymentV2 from '../../models/v2/paymentModelV2.js';
import InvoiceV2 from '../../models/v2/invoiceModelV2.js';
import StudentV2 from '../../models/v2/studentModelV2.js';
import {
    applyPayment,
    classifyPayment,
    daysFromAmount,
    getCycleForDate,
    getLiveStudentAccount,
    startOfDay
} from './billingServiceV2.js';

// ─── Invoice item builder ─────────────────────────────────────────────────────

function buildInvoiceItems({ student, amountPaid, purchasedDays, dueDaysSettled, newDaysAdded }) {
    const items = [
        {
            label: `${student.shift.label} – ${student.billing.cycleDays}-day cycle`,
            amount: student.shift.amount,
            kind: 'fee'
        }
    ];

    if (student.billing.fixedDiscountAmount > 0) {
        items.push({
            label: `Fixed discount${student.billing.fixedDiscountReason ? ` (${student.billing.fixedDiscountReason})` : ''}`,
            amount: -student.billing.fixedDiscountAmount,
            kind: 'fixed_discount'
        });
    }

    if (dueDaysSettled > 0) {
        items.push({
            label: `Overdue days settled (${dueDaysSettled} days)`,
            amount: -(dueDaysSettled * student.billing.dailyRate),
            kind: 'due_settlement'
        });
    }

    if (amountPaid > 0) {
        items.push({
            label: `Payment received – ${purchasedDays} days purchased`,
            amount: -amountPaid,
            kind: 'payment'
        });
    }

    return items;
}

// ─── Main payment recorder ────────────────────────────────────────────────────

export async function recordPaymentV2({
    sid,
    amountPaid = 0,
    discountReason,
    paymentDate = new Date(),
    method = 'cash',
    note,
    createdBy
}) {
    const student = await StudentV2.findOne({ sid });
    if (!student) throw new Error('Student not found.');

    const paid = Number(amountPaid || 0);
    const asOfDate = startOfDay(paymentDate);

    // ── 1. Get current live state ────────────────────────────────────────────
    const liveBefore = getLiveStudentAccount(student, asOfDate);

    // ── 2. Apply the payment ─────────────────────────────────────────────────
    const result = applyPayment({
        currentRemainingDays: liveBefore.remainingDays,
        currentValidTill: liveBefore.validTill,
        amountPaid: paid,
        dailyRate: student.billing.dailyRate,
        asOfDate,
        dueFromDate: liveBefore.dueFrom
    });

    const { purchasedDays, effectiveCurrentDays, newRemainingDays } = result;

    // How many of the purchased days went to settling overdue
    const previousDueDays = liveBefore.dueDays || 0;
    const dueDaysSettled = effectiveCurrentDays < 0
        ? Math.min(purchasedDays, Math.abs(effectiveCurrentDays))
        : 0;
    const newDaysAdded = purchasedDays - dueDaysSettled;

    const classification = classifyPayment({
        newRemainingDays,
        previousRemainingDays: liveBefore.remainingDays,
        amountPaid: paid
    });

    const { cycleStart, cycleEnd } = getCycleForDate(student.billing.cycleAnchorDate, result.validTill);

    // ── 3. Create Payment record ─────────────────────────────────────────────
    const payment = await PaymentV2.create({
        student: student._id,
        sid: student.sid,
        paymentDate: asOfDate,
        cycleStart,
        cycleEnd,

        shiftSnapshot: {
            code: student.shift.code,
            label: student.shift.label,
            displayTime: student.shift.displayTime,
            amount: student.shift.amount
        },

        // ── Billing snapshot ──
        grossCycleAmount: student.shift.amount,      // ✅ ADD THIS LINE
        fixedDiscountAmount: student.billing.fixedDiscountAmount,
        netCycleAmount: student.billing.netCycleAmount,
        dailyRate: student.billing.dailyRate,

        amountPaid: paid,

        // Day tracking
        purchasedDays,
        dueDaysSettled,
        newDaysAdded,
        remainingDaysBefore: liveBefore.remainingDays,
        remainingDaysAfter: newRemainingDays,

        // Audit trail
        validTillBefore: liveBefore.validTill,
        validTillAfter: result.validTill,
        dueFromBefore: liveBefore.dueFrom,
        dueFromAfter: result.dueFrom,

        paymentType: classification.paymentType,
        status: classification.status,
        discountReason,
        method,
        note,
        createdBy
    });

    // ── 4. Create Invoice ────────────────────────────────────────────────────
    let invoice;
    try {
        const invoiceNumber = await InvoiceV2.getNextInvoiceNumber();
        invoice = await InvoiceV2.create({
            invoiceNumber,
            student: student._id,
            sid: student.sid,
            payment: payment._id,
            issuedAt: asOfDate,
            cycleStart,
            cycleEnd,

            items: buildInvoiceItems({
                student,
                amountPaid: paid,
                purchasedDays,
                dueDaysSettled,
                newDaysAdded
            }),

            grossCycleAmount: student.shift.amount,
            fixedDiscountAmount: student.billing.fixedDiscountAmount,
            netCycleAmount: student.billing.netCycleAmount,
            amountPaid: paid,
            purchasedDays,
            remainingDaysAfter: newRemainingDays,
            validTillAfter: result.validTill,
            dueFromAfter: result.dueFrom,
            status: classification.status
        });
    } catch (invoiceError) {
        await PaymentV2.deleteOne({ _id: payment._id });
        throw invoiceError;
    }

    payment.invoice = invoice._id;
    await payment.save();

    // ── 5. Sync student account ──────────────────────────────────────────────
    let syncedStudent;
    try {
        syncedStudent = await StudentV2.findByIdAndUpdate(
            student._id,
            {
                $set: {
                    'statuses.student': result.studentStatus,
                    'statuses.payment': result.paymentStatus,
                    'statuses.renewal': result.renewal,

                    'account.remainingDays': newRemainingDays,
                    'account.dueDays': result.dueDays,
                    'account.dueAmount': result.dueAmount,
                    'account.validTill': result.validTill,
                    'account.dueFrom': result.dueFrom,
                    'account.lastPaymentAt': asOfDate,
                    'account.lastInvoiceNumber': invoice.invoiceNumber,
                    'account.currentCycleStart': cycleStart,
                    'account.currentCycleEnd': cycleEnd
                }
            },
            { new: true }
        );
    } catch (syncError) {
        await InvoiceV2.deleteOne({ _id: invoice._id });
        await PaymentV2.deleteOne({ _id: payment._id });
        throw syncError;
    }

    return { payment, invoice, student: syncedStudent };
}

// ─── Summary helper (for payment screen pre-fill) ─────────────────────────────

export async function getStudentPaymentSummaryV2(student, asOfDate = new Date()) {
    const live = getLiveStudentAccount(student, asOfDate);
    const { cycleStart, cycleEnd } = getCycleForDate(student.billing.cycleAnchorDate, asOfDate);

    return {
        cycleStart,
        cycleEnd,
        shiftAmount: student.shift.amount,
        fixedDiscountAmount: student.billing.fixedDiscountAmount,
        netCycleAmount: student.billing.netCycleAmount,
        dailyRate: student.billing.dailyRate,
        cycleDays: student.billing.cycleDays,
        ...live
    };
}