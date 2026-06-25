/**
 * studentModelV2.js
 *
 * Day-based billing model. Key changes from old model:
 *   - account.remainingDays  = single source of truth for coverage
 *   - account.validTill      = derived (today + remainingDays) and stored as cache
 *   - No advanceAmount / advanceDays fields (removed)
 *   - Payment status: only "paid" | "due"
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

export const STUDENT_STATUS_V2 = ['active', 'pending', 'inactive', 'left', 'trash'];
export const PAYMENT_STATUS_V2 = ['paid', 'due'];
export const SEAT_STATUS_V2 = ['allotted', 'not_allotted', 'expired', 'vacated', 'cancelled'];
export const RENEWAL_STATUS_V2 = ['safe', 'warning', 'urgent', 'expired'];

const studentSchemaV2 = new Schema({
    legacyStudent: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    sid: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    father: { type: String, required: true },
    guardian: { type: String },
    gender: { type: String, required: true },
    admissionDate: { type: Date, required: true },
    address: { type: String, required: true },
    image: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    youtube: { type: String },
    isOnline: { type: Boolean, default: false },

    shift: {
        shift: { type: Schema.Types.ObjectId, ref: 'ShiftV2', required: true },
        code: { type: String, required: true, lowercase: true },
        label: { type: String, required: true },
        displayTime: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 }
    },

    billing: {
        cycleAnchorDate: { type: Date, required: true },
        cycleDays: { type: Number, default: 30, min: 1 },
        fixedDiscountAmount: { type: Number, default: 0, min: 0 },
        fixedDiscountReason: { type: String },
        netCycleAmount: { type: Number, default: 0, min: 0 },
        dailyRate: { type: Number, default: 0, min: 0 }
    },

    seat: {
        seat: { type: Schema.Types.ObjectId, ref: 'SeatV2' },
        seatNumber: { type: String, default: 'Other' },
        activeAllotment: { type: Schema.Types.ObjectId, ref: 'SeatBookingV2' },
        status: { type: String, enum: SEAT_STATUS_V2, default: 'not_allotted' }
    },

    statuses: {
        student: {
            type: String,
            enum: STUDENT_STATUS_V2,
            default: 'pending'
        },
        payment: {
            type: String,
            enum: PAYMENT_STATUS_V2,   // ONLY "paid" | "due"
            default: 'due'
        },
        seat: {
            type: String,
            enum: SEAT_STATUS_V2,
            default: 'not_allotted'
        },
        renewal: {
            type: String,
            enum: RENEWAL_STATUS_V2,
            default: 'expired'
        }
    },

    account: {
        // ── PRIMARY FIELD ────────────────────────────────────────────────────
        // remainingDays is the ONLY field you ever manually update.
        // All other account fields are derived from it + dailyRate.
        remainingDays: { type: Number, default: 0 },

        // ── DERIVED CACHE FIELDS (synced on every payment / cron) ───────────
        validTill: { type: Date },   // today + remainingDays  (when coverage ends)
        dueFrom: { type: Date },   // when coverage expired  (null if paid)
        dueDays: { type: Number, default: 0 },
        dueAmount: { type: Number, default: 0 },

        // ── AUDIT / HISTORY FIELDS ───────────────────────────────────────────
        lastPaymentAt: { type: Date },
        lastInvoiceNumber: { type: Number },

        // ── CYCLE REFERENCE (cosmetic) ───────────────────────────────────────
        currentCycleStart: { type: Date },
        currentCycleEnd: { type: Date }
    }
}, {
    collection: 'students_v2',
    timestamps: true
});

studentSchemaV2.index({ 'statuses.student': 1, 'statuses.payment': 1, 'statuses.seat': 1 });
studentSchemaV2.index({ 'account.validTill': 1 });
studentSchemaV2.index({ 'account.remainingDays': 1 });

const StudentV2 = mongoose.models.StudentV2 || mongoose.model('StudentV2', studentSchemaV2);

export default StudentV2;