/**
 * studentControllerV2.js
 *
 * All student CRUD endpoints.
 * Account fields are NEVER updated directly — only through recordPaymentV2
 * or updateStudentAccountV2 (which recalculates from validTill).
 */

import bcrypt from 'bcryptjs';
import StudentV2 from '../../models/v2/studentModelV2.js';
import { SeatBookingV2 } from '../../models/v2/seatModelV2.js';
import { resolveShiftV2 } from '../../services/v2/shiftServiceV2.js';
import { bookSeatV2, vacateBookingV2 } from '../../services/v2/seatServiceV2.js';
import { recordPaymentV2 } from '../../services/v2/paymentServiceV2.js';
import {
    calculateStudentBilling,
    deriveAccountFromDays,
    getCycleForDate,
    getLiveStudentAccount,
    daysFromAmount,
    startOfDay,
    diffDays,
    addDays
} from '../../services/v2/billingServiceV2.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeStatus(status) {
    const v = String(status || 'pending').toLowerCase();
    if (v === 'active') return 'active';
    if (v === 'trash') return 'trash';
    if (v === 'deactive' || v === 'inactive') return 'inactive';
    if (v === 'left') return 'left';
    return 'pending';
}

function parseBooleanFlag(value) {
    if (typeof value === 'boolean') return value;
    const n = String(value || '').toLowerCase().trim();
    return n === 'true' || n === 'on' || n === '1' || n === 'yes';
}

function publicStudentPayload(student, liveAccount = null) {
    const obj = student?.toObject ? student.toObject() : student;
    return { ...obj, liveAccount };
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createNewStudentV2 = async (req, res) => {
    try {
        const {
            sid,
            name, email, mobile, father, guardian, gender,
            admissionDate, address,
            seatNumber = 'Other',
            seatShift,
            shiftCode,
            password,
            status,
            fixedDiscountAmount = 0,
            fixedDiscountReason,
            cycleDays = 30,
            feePaid,
            amountPaid,
            paymentMethod,
            paymentNote
        } = req.body;

        const resolvedSid = Number(sid || req.sid);
        if (!resolvedSid) return res.status(400).json({ message: 'SID is required.' });

        const shiftDoc = await resolveShiftV2(shiftCode || seatShift);
        const admission = startOfDay(admissionDate);
        if (Number.isNaN(admission.getTime()))
            return res.status(400).json({ message: 'Valid admissionDate is required.' });

        const existing = await StudentV2.findOne({
            $or: [{ sid: resolvedSid }, { email: String(email || '').toLowerCase() }]
        });
        if (existing) throw new Error('Student with this SID or email already exists.');

        const discount = Number(fixedDiscountAmount || 0);
        const billing = calculateStudentBilling({
            shiftAmount: shiftDoc.price,
            fixedDiscountAmount: discount,
            cycleDays: Number(cycleDays || 30)
        });

        const cycle = getCycleForDate(admission, admission);

        const plainPassword = password || `${String(name || '').slice(0, 4).toUpperCase()}${String(mobile || '').slice(-4)}`;
        const hashedPassword = await bcrypt.hash(plainPassword, 12);
        const imageFilename = req.file?.filename || req.savedFileName || req.body.image || null;

        // New student starts with 0 days (due immediately)
        const initialAccount = deriveAccountFromDays({
            remainingDays: 0,
            dailyRate: billing.dailyRate,
            asOfDate: admission,
            dueFromDate: admission
        });

        const student = await StudentV2.create({
            sid: resolvedSid,
            name, email, mobile, father,
            guardian: guardian || '',
            gender, admissionDate: admission, address,
            image: imageFilename,
            password: hashedPassword,

            shift: {
                shift: shiftDoc._id,
                code: shiftDoc.code,
                label: shiftDoc.label,
                displayTime: shiftDoc.displayTime,
                amount: shiftDoc.price
            },

            billing: {
                cycleAnchorDate: admission,
                cycleDays: Number(cycleDays || 30),
                fixedDiscountAmount: discount,
                fixedDiscountReason,
                netCycleAmount: billing.netCycleAmount,
                dailyRate: billing.dailyRate
            },

            seat: {
                seatNumber,
                status: 'not_allotted'
            },

            statuses: {
                student: normalizeStatus(status),
                payment: 'due',
                seat: 'not_allotted',
                renewal: 'expired'
            },

            account: {
                remainingDays: 0,
                dueDays: 0,
                dueAmount: 0,
                validTill: admission,   // coverage starts at admission, 0 days
                dueFrom: admission,
                currentCycleStart: cycle.cycleStart,
                currentCycleEnd: cycle.cycleEnd
            }
        });

        // ── Seat booking ──────────────────────────────────────────────────────
        let booking = null;
        if (seatNumber && seatNumber !== 'Other') {
            try {
                booking = await bookSeatV2({
                    studentId: student._id,
                    seatNumber,
                    shiftCode: shiftDoc.code,
                    validFrom: admission,
                    validTo: cycle.cycleEnd
                });
            } catch (bookingError) {
                await StudentV2.findByIdAndDelete(student._id);
                throw bookingError;
            }
        }

        // ── Initial payment ───────────────────────────────────────────────────
        let payment = null;
        let invoice = null;
        let updatedStudent = student;

        const isFeePaid = parseBooleanFlag(feePaid);
        const amountToCharge = isFeePaid
            ? billing.netCycleAmount
            : Number(amountPaid || 0);

        if (amountToCharge > 0) {
            try {
                const result = await recordPaymentV2({
                    sid: resolvedSid,
                    amountPaid: amountToCharge,
                    paymentDate: admission,
                    method: paymentMethod || 'cash',
                    note: paymentNote || 'Admission payment'
                });
                payment = result.payment;
                invoice = result.invoice;
                updatedStudent = result.student;
            } catch (paymentError) {
                if (booking) {
                    await vacateBookingV2({ bookingId: booking._id, reason: 'Admission payment failed' }).catch(() => { });
                }
                await StudentV2.findByIdAndDelete(student._id);
                throw paymentError;
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Admission successful',
            studentId: updatedStudent.sid,
            temporaryPassword: plainPassword,
            student: updatedStudent,
            booking, payment, invoice
        });
    } catch (error) {
        console.error('createNewStudentV2:', error);
        return res.status(400).json({ success: false, message: error.message || 'Admission failed.' });
    }
};

// ─── READ ─────────────────────────────────────────────────────────────────────

export const getAllStudentsV2 = async (req, res) => {
    try {
        const { sid, name, status, seatNumber, payment } = req.query;
        const query = { 'statuses.student': { $ne: 'trash' } };

        if (sid) query.sid = Number(sid);
        if (name) query.name = new RegExp(name, 'i');
        if (status) query['statuses.student'] = normalizeStatus(status);
        if (payment) query['statuses.payment'] = payment === 'paid' ? 'paid' : 'due';
        if (seatNumber) query['seat.seatNumber'] = seatNumber;

        const students = await StudentV2.find(query).sort({ sid: -1 });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentV2 = async (req, res) => {
    try {
        const student = await StudentV2.findById(req.query._id);
        if (!student) return res.status(404).json({ message: 'Student not found.' });
        const live = getLiveStudentAccount(student, new Date());
        res.status(200).json(publicStudentPayload(student, live));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentBySidV2 = async (req, res) => {
    try {
        const student = await StudentV2.findOne({ sid: Number(req.query.sid) });
        if (!student) return res.status(404).json({ message: 'Student not found.' });
        const live = getLiveStudentAccount(student, new Date());
        res.status(200).json(publicStudentPayload(student, live));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentAccountV2 = async (req, res) => {
    try {
        const student = await StudentV2.findOne({ sid: Number(req.params.sid) });
        if (!student) return res.status(404).json({ message: 'Student not found.' });
        const asOf = req.query.asOfDate ? new Date(req.query.asOfDate) : new Date();
        const live = getLiveStudentAccount(student, asOf);
        const cycle = getCycleForDate(student.billing.cycleAnchorDate, asOf);
        res.status(200).json({
            sid: student.sid,
            name: student.name,
            statuses: student.statuses,
            shift: student.shift,
            billing: student.billing,
            account: { ...live, currentCycleStart: cycle.cycleStart, currentCycleEnd: cycle.cycleEnd }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── UPDATE — personal info only ──────────────────────────────────────────────

export const updateStudentProfileV2 = async (req, res) => {
    try {
        const { sid } = req.params;
        const allowed = ['name', 'email', 'mobile', 'father', 'guardian', 'gender',
            'address', 'image', 'instagram', 'facebook', 'youtube', 'isOnline'];
        const update = {};
        for (const f of allowed) {
            if (req.body[f] !== undefined) update[f] = req.body[f];
        }

        const student = await StudentV2.findOneAndUpdate(
            { sid: Number(sid) },
            { $set: update },
            { new: true, runValidators: true }
        );
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
        return res.json({ success: true, student });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── UPDATE — billing/shift/account ──────────────────────────────────────────

/**
 * updateStudentAccountV2
 *
 * Allows changing shift, discount, cycleDays, anchorDate, or setting
 * a new validTill directly. Everything is recalculated from the target
 * validTill → remainingDays → all derived fields.
 *
 * This does NOT create a payment ledger entry. For balance adjustments
 * that should appear in the ledger, use POST /api/v2/payment.
 */
export const updateStudentAccountV2 = async (req, res) => {
    try {
        const { sid } = req.params;
        const student = await StudentV2.findOne({ sid: Number(sid) });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

        const {
            shiftCode,
            fixedDiscountAmount,
            fixedDiscountReason,
            cycleDays,
            cycleAnchorDate,
            validTill,       // Admin sets target end-of-coverage date directly
            lastPaymentAt
        } = req.body;

        const update = {};

        // ── Shift ─────────────────────────────────────────────────────────────
        let shiftAmount = student.shift.amount;
        if (shiftCode && shiftCode !== student.shift.code) {
            const shift = await resolveShiftV2(shiftCode);
            shiftAmount = shift.price;
            update['shift.shift'] = shift._id;
            update['shift.code'] = shift.code;
            update['shift.label'] = shift.label;
            update['shift.displayTime'] = shift.displayTime;
            update['shift.amount'] = shift.price;
        }

        // ── Billing parameters ────────────────────────────────────────────────
        const newCycleDays = cycleDays != null ? Number(cycleDays) : student.billing.cycleDays;
        const newDiscount = fixedDiscountAmount != null ? Number(fixedDiscountAmount) : student.billing.fixedDiscountAmount;
        const newAnchor = cycleAnchorDate
            ? startOfDay(new Date(cycleAnchorDate))
            : student.billing.cycleAnchorDate;

        const billing = calculateStudentBilling({ shiftAmount, fixedDiscountAmount: newDiscount, cycleDays: newCycleDays });

        update['billing.fixedDiscountAmount'] = newDiscount;
        update['billing.fixedDiscountReason'] = fixedDiscountReason ?? student.billing.fixedDiscountReason;
        update['billing.cycleDays'] = newCycleDays;
        update['billing.cycleAnchorDate'] = newAnchor;
        update['billing.netCycleAmount'] = billing.netCycleAmount;
        update['billing.dailyRate'] = billing.dailyRate;

        // ── Recalculate remainingDays from target validTill ───────────────────
        const today = startOfDay(new Date());
        const targetValidTill = validTill
            ? startOfDay(new Date(validTill))
            : startOfDay(student.account.validTill || today);

        const newRemainingDays = diffDays(today, targetValidTill);
        const dueFromDate = newRemainingDays <= 0 ? targetValidTill : null;

        const account = deriveAccountFromDays({
            remainingDays: newRemainingDays,
            dailyRate: billing.dailyRate,
            asOfDate: today,
            dueFromDate
        });

        update['account.remainingDays'] = newRemainingDays;
        update['account.validTill'] = account.validTill;
        update['account.dueFrom'] = account.dueFrom;
        update['account.dueDays'] = account.dueDays;
        update['account.dueAmount'] = account.dueAmount;

        if (lastPaymentAt) update['account.lastPaymentAt'] = new Date(lastPaymentAt);

        // ── Cycle boundaries ──────────────────────────────────────────────────
        const { cycleStart, cycleEnd } = getCycleForDate(newAnchor, today);
        update['account.currentCycleStart'] = cycleStart;
        update['account.currentCycleEnd'] = cycleEnd;

        // ── Statuses ──────────────────────────────────────────────────────────
        update['statuses.payment'] = account.paymentStatus;
        update['statuses.student'] = account.studentStatus;
        update['statuses.renewal'] = account.renewal;

        const updated = await StudentV2.findOneAndUpdate(
            { sid: Number(sid) },
            { $set: update },
            { new: true, runValidators: true }
        );

        return res.json({ success: true, student: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── UPDATE — student status only ────────────────────────────────────────────

export const updateStudentStatusV2 = async (req, res) => {
    try {
        const { sid } = req.params;
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'status is required.' });

        const student = await StudentV2.findOne({ sid: Number(sid) });
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        const normalized = normalizeStatus(status);

        // Don't allow manually setting active if student has due days
        if (normalized === 'active' && student.account.dueDays > 0) {
            return res.status(400).json({
                message: `Cannot set student active — they owe ${student.account.dueDays} days (₹${student.account.dueAmount}). Record a payment first.`
            });
        }

        const updated = await StudentV2.findOneAndUpdate(
            { sid: Number(sid) },
            { $set: { 'statuses.student': normalized } },
            { new: true }
        );

        return res.json({ success: true, student: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── SEAT operations ──────────────────────────────────────────────────────────

export const allotSeatToStudentV2 = async (req, res) => {
    try {
        const { sid, seatNumber, shiftCode, validFrom, validTo } = req.body;
        const student = await StudentV2.findOne({ sid: Number(sid) });
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        const booking = await bookSeatV2({
            studentId: student._id,
            seatNumber,
            shiftCode: shiftCode || student.shift.code,
            validFrom: validFrom || new Date(),
            validTo: validTo || student.account.currentCycleEnd
        });

        res.status(201).json({ message: 'Seat allotted.', booking });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateStudentSeatV2 = async (req, res) => {
    try {
        const { sid } = req.params;
        const { seatNumber } = req.body;

        const student = await StudentV2.findOne({ sid: Number(sid) });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

        // Remove seat
        if (!seatNumber || seatNumber === 'Other' || seatNumber === '') {
            if (student.seat.activeAllotment) {
                await vacateBookingV2({ bookingId: student.seat.activeAllotment, reason: 'Seat removed by admin' });
            }
            student.seat = { seat: null, seatNumber: 'Other', activeAllotment: null, status: 'not_allotted' };
            student.statuses.seat = 'not_allotted';
            await student.save();
            return res.json({ success: true, student });
        }

        // Vacate old booking if any
        if (student.seat.activeAllotment) {
            await SeatBookingV2.findByIdAndUpdate(student.seat.activeAllotment, { status: 'vacated' });
        }

        const booking = await bookSeatV2({
            studentId: student._id,
            seatNumber,
            shiftCode: student.shift.code,
            validFrom: new Date(),
            validTo: student.account.currentCycleEnd
        });

        return res.json({ success: true, booking });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const vacateStudentSeatV2 = async (req, res) => {
    try {
        const booking = await vacateBookingV2({
            bookingId: req.params.bookingId,
            reason: req.body.reason
        });
        res.status(200).json({ message: 'Seat vacated.', booking });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ─── DELETE (soft) ────────────────────────────────────────────────────────────

export const trashStudentV2 = async (req, res) => {
    try {
        const student = await StudentV2.findByIdAndUpdate(
            req.query.studentId,
            { $set: { 'statuses.student': 'trash' } },
            { new: true }
        );
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        await SeatBookingV2.updateMany(
            { student: student._id, status: 'allotted' },
            { $set: { status: 'cancelled', cancelledReason: 'Student moved to trash' } }
        );

        res.status(200).json({ message: 'Student trashed.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── ADMIN override (no restrictions) ────────────────────────────────────────

export const adminUpdateStudentV2 = async (req, res) => {
    try {
        const { sid } = req.params;
        const student = await StudentV2.findOneAndUpdate(
            { sid: Number(sid) },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
        return res.json({ success: true, student });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};