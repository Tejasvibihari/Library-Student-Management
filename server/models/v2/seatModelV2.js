import mongoose from 'mongoose';
import { timeRangesOverlap } from '../../utils/v2/timeRangeOverlapV2.js';

const { Schema } = mongoose;

export const SEAT_RESERVED_FOR_V2 = ['any', 'boy', 'girl'];
export const BOOKING_STATUS_V2 = ['allotted', 'vacated', 'cancelled', 'expired'];

const seatSchemaV2 = new Schema({
    seatNumber: { type: String, required: true, unique: true, trim: true, index: true },
    reservedFor: { type: String, enum: SEAT_RESERVED_FOR_V2, default: 'any', index: true },
    row: { type: String, trim: true },
    label: { type: String, trim: true },
    floor: { type: String, trim: true },
    section: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null, index: true }
}, {
    collection: 'seats_v2',
    timestamps: true
});

seatSchemaV2.index({ isActive: 1, deletedAt: 1, reservedFor: 1, row: 1 });

const seatBookingSchemaV2 = new Schema({
    seat: { type: Schema.Types.ObjectId, ref: 'SeatV2', required: true, index: true },
    seatNumber: { type: String, required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'StudentV2', required: true, index: true },
    sid: { type: Number, required: true, index: true },
    shift: {
        code: { type: String, required: true, lowercase: true },
        label: { type: String, required: true },
        displayTime: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
    },
    // Kept for invoicing/cycle reporting (e.g. "this enrollment cycle runs
    // June 1 - June 30, renew/charge again after that"). NOT used for seat
    // availability/conflict checks - a seat is occupied for as long as its
    // booking stays status:'allotted', independent of these dates. See
    // findConflict below.
    validFrom: { type: Date, required: true, index: true },
    validTo: { type: Date, required: true, index: true },
    status: { type: String, enum: BOOKING_STATUS_V2, default: 'allotted', index: true },
    linkedPayment: { type: Schema.Types.ObjectId, ref: 'PaymentV2' },
    cancelledReason: { type: String }
}, {
    collection: 'seatbookings_v2',
    timestamps: true
});

seatBookingSchemaV2.index({ seat: 1, status: 1 });
seatBookingSchemaV2.index({ student: 1, status: 1 });

/**
 * Finds an existing booking on this seat that conflicts with the candidate
 * shift's time-of-day window.
 *
 * Availability is purely status-driven: ANY booking with status:'allotted'
 * on this seat occupies it for its shift's time range INDEFINITELY, no
 * matter what validFrom/validTo it was created with. It stops blocking
 * only when explicitly vacated/cancelled/expired (status changes away from
 * 'allotted'). There is intentionally no date-range filtering here.
 */
seatBookingSchemaV2.statics.findConflict = async function ({ seat, startTime, endTime, excludeBookingId = null, session = null }) {
    const query = { seat, status: 'allotted' };
    if (excludeBookingId) query._id = { $ne: excludeBookingId };

    const candidates = await this.find(query).session(session);

    return candidates.find((candidate) =>
        timeRangesOverlap(startTime, endTime, candidate.shift.startTime, candidate.shift.endTime)
    ) || null;
};

seatBookingSchemaV2.statics.isSeatAvailable = async function (params) {
    const conflict = await this.findConflict(params);
    return !conflict;
};

const SeatV2 = mongoose.models.SeatV2 || mongoose.model('SeatV2', seatSchemaV2);
const SeatBookingV2 = mongoose.models.SeatBookingV2 || mongoose.model('SeatBookingV2', seatBookingSchemaV2);

export default SeatV2;
export { SeatBookingV2 };