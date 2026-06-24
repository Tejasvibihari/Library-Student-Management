import PaymentV2 from '../../models/v2/paymentModelV2.js';
import InvoiceV2 from '../../models/v2/invoiceModelV2.js';
import StudentV2 from '../../models/v2/studentModelV2.js';
import {
    classifyPayment,
    deriveAccountFromBalance,
    getCycleForDate,
    getLiveStudentAccount,
    startOfDay
} from './billingServiceV2.js';

function buildInvoiceItems({ student, oneTimeDiscountAmount, amountPaid, dueAmountBefore, advanceAmountAfter }) {
    const items = [
        { label: `${student.shift.label} cycle amount`, amount: student.shift.amount, kind: 'fee' }
    ];

    if (student.billing.fixedDiscountAmount > 0) {
        items.push({
            label: `Fixed shift discount${student.billing.fixedDiscountReason ? ` - ${student.billing.fixedDiscountReason}` : ''}`,
            amount: -student.billing.fixedDiscountAmount,
            kind: 'fixed_discount'
        });
    }

    if (oneTimeDiscountAmount > 0) {
        items.push({ label: 'One-time payment discount', amount: -oneTimeDiscountAmount, kind: 'one_time_discount' });
    }

    if (dueAmountBefore > 0) {
        items.push({ label: 'Previous due', amount: dueAmountBefore, kind: 'previous_due' });
    }

    if (amountPaid > 0) {
        items.push({ label: 'Payment received', amount: -amountPaid, kind: 'payment' });
    }

    if (advanceAmountAfter > 0) {
        items.push({ label: 'Advance balance carried forward', amount: advanceAmountAfter, kind: 'advance' });
    }

    return items;
}

export async function recordPaymentV2({
    sid,
    amountPaid = 0,
    oneTimeDiscountAmount = 0,
    discountReason,
    paymentDate = new Date(),
    method = 'cash',
    note,
    createdBy
}) {
    const student = await StudentV2.findOne({ sid });
    if (!student) throw new Error('Student not found in v2 collection.');

    const paid = Number(amountPaid || 0);
    const oneTimeDiscount = Number(oneTimeDiscountAmount || 0);
    const asOfDate = startOfDay(paymentDate);
    const liveBefore = getLiveStudentAccount(student, asOfDate);
    const effectiveCreditAmount = paid + oneTimeDiscount;
    const balanceAfter = liveBefore.balanceAmount + effectiveCreditAmount;
    const liveAfter = deriveAccountFromBalance({
        balanceAmount: balanceAfter,
        dailyRate: student.billing.dailyRate,
        asOfDate
    });
    const { cycleStart, cycleEnd } = getCycleForDate(student.billing.cycleAnchorDate, asOfDate);
    const classification = classifyPayment({
        amountPaid: paid,
        oneTimeDiscountAmount: oneTimeDiscount,
        dueAmountBefore: liveBefore.dueAmount,
        dueAmountAfter: liveAfter.dueAmount,
        advanceAmountAfter: liveAfter.advanceAmount
    });

    const amountUsedForDue = Math.min(effectiveCreditAmount, liveBefore.dueAmount);
    const amountUsedForSubscription = Math.max(Math.min(effectiveCreditAmount - amountUsedForDue, student.billing.netCycleAmount), 0);
    const amountMovedToAdvance = Math.max(liveAfter.advanceAmount, 0);

    // No DB transaction here (single mongod, no replica set). We create the
    // payment first, then the invoice, then sync the student. If a later
    // step fails, the caller is responsible for any compensating cleanup
    // (see createStudentV2, which deletes the student + payment + invoice
    // it just created if anything in the admission flow fails).
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
        grossCycleAmount: student.shift.amount,
        fixedDiscountAmount: student.billing.fixedDiscountAmount,
        oneTimeDiscountAmount: oneTimeDiscount,
        discountReason,
        netCycleAmount: student.billing.netCycleAmount,
        dailyRate: student.billing.dailyRate,
        amountPaid: paid,
        effectiveCreditAmount,
        balanceBefore: liveBefore.balanceAmount,
        balanceAfter,
        dueAmountBefore: liveBefore.dueAmount,
        dueAmountAfter: liveAfter.dueAmount,
        advanceAmountBefore: liveBefore.advanceAmount,
        advanceAmountAfter: liveAfter.advanceAmount,
        dueDaysBefore: liveBefore.dueDays,
        dueDaysAfter: liveAfter.dueDays,
        advanceDaysBefore: liveBefore.advanceDays,
        advanceDaysAfter: liveAfter.advanceDays,
        validTillBefore: student.account?.validTill || student.admissionDate,

        dueFromBefore: liveBefore.dueFrom,
        dueFromAfter: liveAfter.dueFrom,
        amountUsedForDue,
        amountUsedForSubscription,
        amountMovedToAdvance,
        paymentType: classification.paymentType,
        status: classification.status,
        method,
        note,
        createdBy
    });

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
            validTillAfter: liveAfter.validTill,
            dueFromAfter: liveAfter.dueFrom,
            items: buildInvoiceItems({
                student,
                oneTimeDiscountAmount: oneTimeDiscount,
                amountPaid: paid,
                dueAmountBefore: liveBefore.dueAmount,
                advanceAmountAfter: liveAfter.advanceAmount
            }),
            grossCycleAmount: student.shift.amount,
            fixedDiscountAmount: student.billing.fixedDiscountAmount,
            oneTimeDiscountAmount: oneTimeDiscount,
            netCycleAmount: student.billing.netCycleAmount,
            amountPaid: paid,
            dueAmountAfter: liveAfter.dueAmount,
            advanceAmountAfter: liveAfter.advanceAmount,
            dueDaysAfter: liveAfter.dueDays,
            creditDaysAfter: liveAfter.creditDays,
            status: classification.status
        });
    } catch (invoiceError) {
        // Roll back the payment we just created so a failed invoice step
        // never leaves a payment ledger entry without its invoice.
        await PaymentV2.deleteOne({ _id: payment._id });
        throw invoiceError;
    }

    payment.invoice = invoice._id;
    await payment.save();

    let syncedStudent;
    try {
        syncedStudent = await StudentV2.findByIdAndUpdate(
            student._id,
            {
                $set: {
                    'statuses.student': liveAfter.studentStatus,
                    'statuses.payment': liveAfter.paymentStatus,
                    'account.balanceAmount': balanceAfter,
                    'account.advanceAmount': liveAfter.advanceAmount,
                    'account.dueAmount': liveAfter.dueAmount,
                    'account.remainingDays': liveAfter.remainingDays,
                    'account.advanceDays': liveAfter.advanceDays,
                    'account.dueDays': liveAfter.dueDays,
                    'account.validTill': cycleEnd,
                    'account.dueFrom': liveAfter.dueFrom,
                    'account.currentCycleStart': cycleStart,
                    'account.currentCycleEnd': cycleEnd,
                    'account.lastPaymentAt': asOfDate,
                    'account.lastInvoiceNumber': invoice.invoiceNumber
                }
            },
            { new: true }
        );
    } catch (syncError) {
        // Roll back payment + invoice if we couldn't sync the student's
        // account fields, since a payment must never exist unless the
        // student record actually reflects it.
        await InvoiceV2.deleteOne({ _id: invoice._id });
        await PaymentV2.deleteOne({ _id: payment._id });
        throw syncError;
    }

    return { payment, invoice, student: syncedStudent };
}

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
        ...live
    };
}