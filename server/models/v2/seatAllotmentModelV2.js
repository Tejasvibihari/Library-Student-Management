import mongoose from 'mongoose';
import SeatV2, { ShiftV2 } from './seatModelV2.js';
const { Schema } = mongoose;

export const ALLOTMENT_STATUS = ['booked', 'vacated', 'cancelled', 'expired'];

/**
 * SeatAllotmentV2 — the "PNR". One document = one student holding one
 * seat for one shift for one validity window (their fee cycle).
 *
 * To renew a stay, NEVER mutate validTo on an existing doc — create a
 * NEW allotment for the new cycle. This keeps full seat history,
 * auditable exactly like IRCTC ticket history.
 *
 * Seat availability is ALWAYS derived by querying this collection for
 * overlapping booked allotments — never stored as a boolean on the seat.
 */
const seatAllotmentSchema = new Schema({
    seat: { type: Schema.Types.ObjectId, ref: 'SeatV2', required: true, index: true },
    seatNumber: { type: String, required: true, index: true }, // denormalized for fast display/printing

    student: { type: Schema.Types.ObjectId, ref: 'StudentV2', required: true, index: true },
    sid: { type: Number, required: true, index: true },

    shiftRef: { type: Schema.Types.ObjectId, ref: 'ShiftV2', required: true },
    // frozen snapshot — editing a shift later never rewrites past allotment history
    shift: {
        code: { type: String, required: true },
        label: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        displayTime: { type: String, required: true },
        occupiedSlots: { type: [String], required: true }
    },

    validFrom: { type: Date, required: true, index: true },
    validTo: { type: Date, required: true, index: true },

    status: { type: String, enum: ALLOTMENT_STATUS, default: 'booked', index: true },

    linkedPayment: { type: Schema.Types.ObjectId, ref: 'PaymentV2' }, // which cycle payment funded this
    cancelledReason: { type: String },
    cancelledAt: { type: Date }
}, { collection: 'seat_allotments_v2', timestamps: true });

seatAllotmentSchema.index({ seat: 1, status: 1, validFrom: 1, validTo: 1 });
seatAllotmentSchema.index({ student: 1, status: 1, validTo: 1 });

// ---- Conflict detection: works for ANY dynamic shift, compares occupiedSlots ----
seatAllotmentSchema.statics.findConflict = function ({
    seat, occupiedSlots, validFrom, validTo, excludeAllotmentId = null, session = null
}) {
    const query = {
        seat,
        status: 'booked',
        'shift.occupiedSlots': { $in: occupiedSlots },
        validFrom: { $lte: validTo },
        validTo: { $gte: validFrom }
    };
    if (excludeAllotmentId) query._id = { $ne: excludeAllotmentId };
    let q = this.findOne(query);
    if (session) q = q.session(session);
    return q;
};

seatAllotmentSchema.statics.isSeatAvailable = async function (params) {
    const conflict = await this.findConflict(params).lean();
    return !conflict;
};

// ---- Find every free seat for a given shift + date range (booking UI) ----
seatAllotmentSchema.statics.findAvailableSeats = async function ({ shiftId, validFrom, validTo }) {
    const shift = await ShiftV2.findById(shiftId).lean();
    if (!shift) throw new Error('Invalid shift');

    const allSeats = await SeatV2.find({ isActive: true }).lean();

    const clashingAllotments = await this.find({
        status: 'booked',
        'shift.occupiedSlots': { $in: shift.occupiedSlots },
        validFrom: { $lte: validTo },
        validTo: { $gte: validFrom }
    }).select('seat').lean();

    const occupiedSeatIds = new Set(clashingAllotments.map(a => String(a.seat)));
    return allSeats.filter(s => !occupiedSeatIds.has(String(s._id)));
};

// ---- Book a seat: validates + snapshots shift, single entry point so ----
// ---- no controller can accidentally skip the conflict check.        ----
seatAllotmentSchema.statics.allot = async function ({
    seatId, studentId, sid, shiftId, validFrom, validTo, linkedPayment = null, session = null
}) {
    const shiftDoc = await ShiftV2.findById(shiftId).session(session);
    if (!shiftDoc || !shiftDoc.isActive) throw new Error('Invalid or inactive shift');

    const seatDoc = await SeatV2.findById(seatId).session(session);
    if (!seatDoc || !seatDoc.isActive) throw new Error('Invalid or inactive seat');

    const conflict = await this.findConflict({
        seat: seatId,
        occupiedSlots: shiftDoc.occupiedSlots,
        validFrom, validTo,
        session
    });
    if (conflict) {
        throw new Error(`Seat ${seatDoc.seatNumber} already allotted for an overlapping slot (allotment ${conflict._id})`);
    }

    const [allotment] = await this.create([{
        seat: seatId,
        seatNumber: seatDoc.seatNumber,
        student: studentId,
        sid,
        shiftRef: shiftDoc._id,
        shift: {
            code: shiftDoc.code,
            label: shiftDoc.label,
            startTime: shiftDoc.startTime,
            endTime: shiftDoc.endTime,
            displayTime: shiftDoc.displayTime,
            occupiedSlots: shiftDoc.occupiedSlots
        },
        validFrom, validTo,
        status: 'booked',
        linkedPayment
    }], { session });

    return allotment;
};

// ---- Release a seat (student left / transferred) ----
seatAllotmentSchema.statics.vacate = async function (allotmentId, { reason = '', session = null } = {}) {
    return this.findByIdAndUpdate(
        allotmentId,
        { status: 'vacated', cancelledReason: reason, cancelledAt: new Date() },
        { new: true, session }
    );
};

const SeatAllotmentV2 = mongoose.models.SeatAllotmentV2 || mongoose.model('SeatAllotmentV2', seatAllotmentSchema);

export default SeatAllotmentV2;