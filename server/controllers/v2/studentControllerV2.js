import bcrypt from 'bcryptjs';
import StudentV2 from '../../models/v2/studentModelV2.js';
import { SeatBookingV2 } from '../../models/v2/seatModelV2.js';
import { resolveShiftV2 } from '../../services/v2/shiftServiceV2.js';
import { bookSeatV2, vacateBookingV2 } from '../../services/v2/seatServiceV2.js';
import { recordPaymentV2 } from '../../services/v2/paymentServiceV2.js';
import {
    calculateStudentBilling,
    deriveAccountFromBalance,
    getCycleForDate,
    getLiveStudentAccount,
    startOfDay
} from '../../services/v2/billingServiceV2.js';

function normalizeStatus(status) {
    const value = String(status || 'pending').toLowerCase();
    if (value === 'active') return 'active';
    if (value === 'trash') return 'trash';
    if (value === 'deactive' || value === 'inactive') return 'inactive';
    if (value === 'left') return 'left';
    return 'pending';
}

function publicStudentPayload(student, summary = null) {
    const object = student?.toObject ? student.toObject() : student;
    return {
        ...object,
        paymentSummary: summary
    };
}

// Accepts boolean-ish values from form fields ("true", "on", "1", true, etc.)
function parseBooleanFlag(value) {
    if (typeof value === 'boolean') return value;
    const normalized = String(value || '').toLowerCase().trim();
    return normalized === 'true' || normalized === 'on' || normalized === '1' || normalized === 'yes';
}

export const createNewStudentV2 = async (req, res) => {
    try {
        const {
            sid,
            name,
            email,
            mobile,
            father,
            guardian,
            gender,
            admissionDate,
            address,
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
        if (Number.isNaN(admission.getTime())) return res.status(400).json({ message: 'Valid admissionDate is required.' });

        // No replica set / transactions available, so we check for an
        // existing student up front instead of relying on a transactional
        // re-check. There's a small race window here under concurrent
        // requests for the same sid/email, but the unique indexes on
        // StudentV2 (sid/email) are the real backstop against duplicates.
        const existing = await StudentV2.findOne({
            $or: [{ sid: resolvedSid }, { email: String(email || '').toLowerCase() }]
        });
        if (existing) throw new Error('Student already exists in v2 collection.');

        const discount = Number(fixedDiscountAmount || 0);
        const billing = calculateStudentBilling({
            shiftAmount: shiftDoc.price,
            fixedDiscountAmount: discount,
            cycleDays: Number(cycleDays || 30)
        });
        const initialAccount = deriveAccountFromBalance({
            balanceAmount: 0,
            dailyRate: billing.dailyRate,
            asOfDate: admission
        });
        const cycle = getCycleForDate(admission, admission);
        const plainPassword = password || `${String(name || '').slice(0, 4).toUpperCase()}${String(mobile || '').slice(-4)}`;
        const hashedPassword = await bcrypt.hash(plainPassword, 12);
        const imageFilename = req.file?.filename || req.savedFileName || req.body.image || null;

        // Fee-paid logic:
        // - feePaid checked   -> pay the full net cycle amount now.
        // - feePaid unchecked -> use whatever amountPaid was entered, or 0
        //   if it was left blank, and the rest becomes due as normal.
        const isFeePaid = parseBooleanFlag(feePaid);
        const amountToCharge = isFeePaid
            ? billing.netCycleAmount
            : Number(amountPaid || 0);

        // No DB transaction here (single mongod, no replica set). We create
        // the student first, then attempt the seat booking and (if any
        // amount was paid) the payment/invoice; if any later step fails we
        // manually roll back everything we created so far, so we never end
        // up with a student stuck in a half-admitted state.
        const student = await StudentV2.create({
            sid: resolvedSid,
            name,
            email,
            password: hashedPassword,
            mobile,
            father,
            guardian: guardian || '',
            gender,
            admissionDate: admission,
            address,
            image: imageFilename,
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
                status: seatNumber && seatNumber !== 'Other' ? 'not_allotted' : 'not_allotted'
            },
            statuses: {
                student: normalizeStatus(status),
                payment: 'due',
                seat: 'not_allotted'
            },
            account: {
                balanceAmount: 0,
                advanceAmount: initialAccount.advanceAmount,
                dueAmount: initialAccount.dueAmount,
                creditDays: initialAccount.creditDays,
                dueDays: initialAccount.dueDays,
                validTill: admission,
                dueFrom: null,
                currentCycleStart: cycle.cycleStart,
                currentCycleEnd: cycle.cycleEnd
            }
        });

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
                // Roll back the student we just created so a failed seat
                // booking never leaves an orphan/half-admitted student doc.
                await StudentV2.findByIdAndDelete(student._id);
                throw bookingError;
            }
        }

        let payment = null;
        let invoice = null;
        let updatedStudent = student;

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
                // Roll back the seat booking and student so a failed
                // admission payment never leaves a half-admitted student.
                if (booking) {
                    await vacateBookingV2({ bookingId: booking._id, reason: 'Admission payment failed' }).catch(() => { });
                }
                await StudentV2.findByIdAndDelete(student._id);
                throw paymentError;
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Admission Success',
            studentId: updatedStudent.sid,
            temporaryPassword: plainPassword,
            student: updatedStudent,
            booking,
            payment,
            invoice
        });
    } catch (error) {
        console.error('createNewStudentV2 error:', error);
        return res.status(400).json({ success: false, message: error.message || 'Admission failed.' });
    }
};

export const getAllStudentsV2 = async (req, res) => {
    try {
        const { sid, name, status, seatNumber } = req.query;
        const query = { 'statuses.student': { $ne: 'trash' } };
        if (sid) query.sid = Number(sid);
        if (name) query.name = new RegExp(name, 'i');
        if (status) query['statuses.student'] = normalizeStatus(status);
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
        const summary = getLiveStudentAccount(student, new Date());
        res.status(200).json(publicStudentPayload(student, summary));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentBySidV2 = async (req, res) => {
    try {
        const student = await StudentV2.findOne({ sid: Number(req.params.sid) });
        if (!student) return res.status(404).json({ message: 'Student not found.' });
        const summary = getLiveStudentAccount(student, new Date());
        res.status(200).json(publicStudentPayload(student, summary));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentAccountV2 = async (req, res) => {
    try {
        const student = await StudentV2.findOne({ sid: Number(req.params.sid) });
        if (!student) return res.status(404).json({ message: 'Student not found.' });
        const summary = getLiveStudentAccount(student, req.query.asOfDate || new Date());
        const cycle = getCycleForDate(student.billing.cycleAnchorDate, req.query.asOfDate || new Date());
        res.status(200).json({
            sid: student.sid,
            name: student.name,
            statuses: student.statuses,
            shift: student.shift,
            billing: student.billing,
            account: {
                ...summary,
                currentCycleStart: cycle.cycleStart,
                currentCycleEnd: cycle.cycleEnd
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStudentV2 = async (req, res) => {
    try {
        const { sid, status, fixedDiscountAmount, fixedDiscountReason, ...rest } = req.body;
        const student = await StudentV2.findOne({ sid: Number(sid) });
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        const update = { ...rest };
        if (status) update['statuses.student'] = normalizeStatus(status);

        if (fixedDiscountAmount !== undefined) {
            const billing = calculateStudentBilling({
                shiftAmount: student.shift.amount,
                fixedDiscountAmount: Number(fixedDiscountAmount || 0),
                cycleDays: student.billing.cycleDays
            });
            update['billing.fixedDiscountAmount'] = Number(fixedDiscountAmount || 0);
            update['billing.fixedDiscountReason'] = fixedDiscountReason;
            update['billing.netCycleAmount'] = billing.netCycleAmount;
            update['billing.dailyRate'] = billing.dailyRate;
        }

        const updatedStudent = await StudentV2.findOneAndUpdate(
            { sid: Number(sid) },
            { $set: update },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Student details updated successfully', student: updatedStudent });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

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

        res.status(201).json({ message: 'Seat allotted successfully.', booking });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const vacateStudentSeatV2 = async (req, res) => {
    try {
        const booking = await vacateBookingV2({ bookingId: req.params.bookingId, reason: req.body.reason });
        res.status(200).json({ message: 'Seat vacated successfully.', booking });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

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

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};