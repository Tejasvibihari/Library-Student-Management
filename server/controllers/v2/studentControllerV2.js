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
    startOfDay,
    diffDays,
    deriveAccount
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

        const isFeePaid = parseBooleanFlag(feePaid);
        const amountToCharge = isFeePaid
            ? billing.netCycleAmount
            : Number(amountPaid || 0);

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
                remainingDays: initialAccount.remainingDays,
                advanceDays: initialAccount.advanceDays,
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
        // Change from req.params.sid to req.query.sid
        const student = await StudentV2.findOne({ sid: Number(req.query.sid) });

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

// FIX (Bug 4 & 5): updateStudentV2 now:
// 1. Blocks direct account.* and statuses.payment overrides
// 2. Handles shift changes by recalculating billing
// 3. Guards against setting 'active' when there is a due amount
export const updateStudentV2 = async (req, res) => {
    try {
        const { sid, status, fixedDiscountAmount, fixedDiscountReason,
            shiftCode, cycleAnchorDate, cycleDays, ...rest } = req.body;

        const student = await StudentV2.findOne({ sid: Number(sid) });
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        const update = {};

        // Safe fields — can be updated directly
        const safeFields = ['name', 'email', 'mobile', 'father', 'guardian',
            'gender', 'address', 'image', 'isOnline',
            'instagram', 'facebook', 'youtube'];
        for (const key of safeFields) {
            if (rest[key] !== undefined) update[key] = rest[key];
        }

        // Student status — only allow manual transitions that make sense
        // FIX (Bug 1): Don't allow manually setting 'active' if there is due amount
        if (status) {
            const normalized = normalizeStatus(status);
            if (normalized === 'active' && student.account.dueAmount > 0) {
                return res.status(400).json({
                    message: `Cannot set student to active while there is a due amount of ₹${student.account.dueAmount}. Record a payment first.`
                });
            }
            update['statuses.student'] = normalized;
        }

        // FIX (Bug 5): Shift change — must recalculate billing
        if (shiftCode && shiftCode !== student.shift.code) {
            const shiftDoc = await resolveShiftV2(shiftCode);
            const discount = fixedDiscountAmount !== undefined
                ? Number(fixedDiscountAmount)
                : student.billing.fixedDiscountAmount;
            const days = cycleDays ? Number(cycleDays) : student.billing.cycleDays;
            const billing = calculateStudentBilling({
                shiftAmount: shiftDoc.price,
                fixedDiscountAmount: discount,
                cycleDays: days
            });
            update['shift.shift'] = shiftDoc._id;
            update['shift.code'] = shiftDoc.code;
            update['shift.label'] = shiftDoc.label;
            update['shift.displayTime'] = shiftDoc.displayTime;
            update['shift.amount'] = shiftDoc.price;
            update['billing.netCycleAmount'] = billing.netCycleAmount;
            update['billing.dailyRate'] = billing.dailyRate;
        }

        // Discount change — recalculate billing
        if (fixedDiscountAmount !== undefined) {
            const shiftAmount = update['shift.amount'] || student.shift.amount;
            const days = cycleDays ? Number(cycleDays) : student.billing.cycleDays;
            const billing = calculateStudentBilling({
                shiftAmount,
                fixedDiscountAmount: Number(fixedDiscountAmount),
                cycleDays: days
            });
            update['billing.fixedDiscountAmount'] = Number(fixedDiscountAmount);
            update['billing.fixedDiscountReason'] = fixedDiscountReason || '';
            update['billing.netCycleAmount'] = billing.netCycleAmount;
            update['billing.dailyRate'] = billing.dailyRate;
        }

        // Cycle days change — recalculate billing
        if (cycleDays) {
            const shiftAmount = update['shift.amount'] || student.shift.amount;
            const discount = update['billing.fixedDiscountAmount'] ?? student.billing.fixedDiscountAmount;
            const billing = calculateStudentBilling({
                shiftAmount,
                fixedDiscountAmount: discount,
                cycleDays: Number(cycleDays)
            });
            update['billing.cycleDays'] = Number(cycleDays);
            update['billing.netCycleAmount'] = billing.netCycleAmount;
            update['billing.dailyRate'] = billing.dailyRate;
        }

        // Cycle anchor — only update the date, don't mess with balance
        if (cycleAnchorDate) {
            update['billing.cycleAnchorDate'] = new Date(cycleAnchorDate);
        }

        // BLOCKED (Bug 4): Do not allow direct account.* or statuses.payment overrides.
        // If an admin needs to adjust balance, they must use POST /api/v2/payment/adjustment
        // with a reason, which goes through recordPaymentV2 and creates a proper ledger entry.

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

// NEW: Manual balance adjustment endpoint — POST /api/v2/payment/adjustment
// Replaces direct account.* editing in the UI. Goes through the full
// recordPaymentV2 flow so every adjustment is in the ledger with a reason.
export const makeAdjustmentV2 = async (req, res) => {
    try {
        const { sid, adjustmentAmount, reason, adminNote } = req.body;

        if (!adjustmentAmount || !reason) {
            return res.status(400).json({ message: 'adjustmentAmount and reason are required.' });
        }

        const amount = Number(adjustmentAmount);
        if (isNaN(amount) || amount === 0) {
            return res.status(400).json({ message: 'adjustmentAmount must be a non-zero number.' });
        }

        const result = await recordPaymentV2({
            sid: Number(sid),
            amountPaid: Math.max(amount, 0),
            oneTimeDiscountAmount: 0,
            discountReason: reason,
            method: 'adjustment',
            note: adminNote || `Manual adjustment: ${reason}`,
            createdBy: req.body.createdBy
        });

        res.status(200).json({
            message: 'Adjustment recorded',
            payment: result.payment,
            student: result.student
        });
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


// Updation Controller 
// Only personal information.
export const updateStudentProfileV2 = async (req, res) => {
    try {
        const { sid } = req.params;

        const allowedFields = [
            "name",
            "email",
            "mobile",
            "father",
            "guardian",
            "gender",
            "address",
            "image",
            "instagram",
            "facebook",
            "youtube",
            "isOnline"
        ];

        const update = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                update[field] = req.body[field];
            }
        }

        const student = await StudentV2.findOneAndUpdate(
            { sid: Number(sid) },
            { $set: update },
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.json({
            success: true,
            student
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Shift Change
// Discount Change
// Cycle Days Change
// Anchor Date Change
// Balance Adjustment
// Shift Change / Discount Change / Cycle Days Change / Anchor Date Change / Balance Adjustment
export const updateStudentAccountV2 = async (req, res) => {
    try {
        const { sid } = req.params;
        const student = await StudentV2.findOne({ sid: Number(sid) });
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const {
            shiftCode,
            fixedDiscountAmount,
            fixedDiscountReason,
            cycleDays,
            cycleAnchorDate,
            validTill,             // ← admin‑provided target coverage end
            lastPaymentAt,         // optional, stored directly for history
        } = req.body;

        const update = {};

        // ── 1. Shift ──────────────────────────────────────
        let shiftAmount = student.shift.amount;
        if (shiftCode) {
            const shift = await resolveShiftV2(shiftCode);
            shiftAmount = shift.price;
            update["shift.shift"] = shift._id;
            update["shift.code"] = shift.code;
            update["shift.label"] = shift.label;
            update["shift.displayTime"] = shift.displayTime;
            update["shift.amount"] = shift.price;
        }

        // ── 2. Billing parameters ─────────────────────────
        const newCycleDays = cycleDays ?? student.billing.cycleDays;
        const newDiscount = fixedDiscountAmount ?? student.billing.fixedDiscountAmount;
        const newAnchor = cycleAnchorDate
            ? new Date(cycleAnchorDate)
            : student.billing.cycleAnchorDate;

        const billing = calculateStudentBilling({
            shiftAmount,
            fixedDiscountAmount: newDiscount,
            cycleDays: newCycleDays,
        });

        update["billing.fixedDiscountAmount"] = newDiscount;
        update["billing.fixedDiscountReason"] = fixedDiscountReason ?? student.billing.fixedDiscountReason;
        update["billing.cycleDays"] = newCycleDays;
        update["billing.cycleAnchorDate"] = newAnchor;
        update["billing.netCycleAmount"] = billing.netCycleAmount;
        update["billing.dailyRate"] = billing.dailyRate;

        // ── 3. Compute balance from today → validTill ────
        const today = startOfDay(new Date());
        const targetValidTill = validTill
            ? startOfDay(new Date(validTill))
            : startOfDay(student.account.validTill);

        const daysDiff = diffDays(today, targetValidTill);   // positive if future, negative if past
        const computedBalance = daysDiff * billing.dailyRate;

        // ── 4. Derive all account fields ─────────────────
        const account = deriveAccount({
            balanceAmount: computedBalance,
            validTill: targetValidTill,
            dailyRate: billing.dailyRate,
            today,
        });

        // store the calculated values
        update["account.balanceAmount"] = computedBalance;
        update["account.validTill"] = targetValidTill;
        update["account.advanceAmount"] = account.advanceAmount;
        update["account.dueAmount"] = account.dueAmount;
        update["account.remainingDays"] = account.remainingDays;
        update["account.advanceDays"] = account.advanceDays;
        update["account.dueDays"] = account.dueDays;
        update["account.dueFrom"] = account.dueFrom;

        // optional: store lastPaymentAt for record‑keeping
        if (lastPaymentAt) {
            update["account.lastPaymentAt"] = new Date(lastPaymentAt);
        }

        // ── 5. Cycle boundaries (for reference) ───────────
        const anchor = startOfDay(newAnchor);
        let cycleStart = new Date(anchor);
        while (addDays(cycleStart, newCycleDays) <= today) {
            cycleStart = addDays(cycleStart, newCycleDays);
        }
        update["account.currentCycleStart"] = cycleStart;
        update["account.currentCycleEnd"] = addDays(cycleStart, newCycleDays);

        // ── 6. Statuses ──────────────────────────────────
        update["statuses.payment"] = account.paymentStatus;
        update["statuses.student"] = account.studentStatus;
        update["statuses.renewal"] = account.renewal;

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


// Assign Seat
// Change Seat
// Remove Seat

export const updateStudentSeatV2 = async (req, res) => {
    try {

        const { sid } = req.params;
        const { seatNumber } = req.body;

        const student =
            await StudentV2.findOne({
                sid: Number(sid)
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        if (
            seatNumber === "Other" ||
            seatNumber === ""
        ) {

            if (student.seat.activeAllotment) {

                await vacateBookingV2({
                    bookingId:
                        student.seat.activeAllotment,
                    reason:
                        "Seat removed by admin"
                });
            }

            student.seat = {
                seat: null,
                seatNumber: "Other",
                activeAllotment: null,
                status: "not_allotted"
            };

            student.statuses.seat =
                "not_allotted";

            await student.save();

            return res.json({
                success: true,
                student
            });
        }

        const seat =
            await SeatV2.findOne({
                seatNumber
            });

        if (!seat) {
            return res.status(404).json({
                success: false,
                message: "Seat not found"
            });
        }

        if (student.seat.activeAllotment) {

            await SeatBookingV2.findByIdAndUpdate(
                student.seat.activeAllotment,
                {
                    status: "vacated"
                }
            );
        }

        const booking = await bookSeatV2({
            studentId: student._id,
            seatNumber,
            shiftCode: student.shift.code,
            validFrom: new Date(),
            validTo:
                student.account.currentCycleEnd
        });

        return res.json({
            success: true,
            booking
        });



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// No restrictions.
export const adminUpdateStudentV2 = async (req, res) => {
    try {

        const { sid } = req.params;

        const student =
            await StudentV2.findOneAndUpdate(
                {
                    sid: Number(sid)
                },
                {
                    $set: req.body
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.json({
            success: true,
            student
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};