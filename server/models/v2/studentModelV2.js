import mongoose from 'mongoose';

const { Schema } = mongoose;

export const STUDENT_STATUS_V2 = ['active', 'pending', 'inactive', 'left', 'trash'];
export const PAYMENT_STATUS_V2 = ['paid', 'partial', 'due', 'advance'];
export const SEAT_STATUS_V2 = ['allotted', 'not_allotted', 'expired', 'vacated', 'cancelled'];

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
            enum: [
                "active",
                "pending",
                "inactive",
                "left",
                "trash"
            ]
        },

        payment: {
            type: String,
            enum: [
                "paid",
                "partial",
                "due",
                "advance"
            ]
        },

        seat: {
            type: String,
            enum: [
                "allotted",
                "not_allotted",
                "expired",
                "vacated",
                "cancelled"
            ]
        },

        renewal: {
            type: String,
            enum: [
                "safe",
                "warning",
                "urgent",
                "expired"
            ],
            default: "safe"
        }
    },

    account:
    {
        // SINGLE SOURCE OF TRUTh
        balanceAmount: { type: Number, default: 0 },
        validTill: { type: Date },
        dueFrom: { type: Date },
        lastPaymentAt: { type: Date },
        lastInvoiceNumber: { type: Number },
        // SNAPSHOT FIELDS (cron updates)
        advanceAmount: { type: Number, default: 0 },
        dueAmount: { type: Number, default: 0 },
        remainingDays: { type: Number, default: 0 },
        advanceDays: { type: Number, default: 0 },
        dueDays: {
            type: Number,
            default: 0
        },
        // cycle tracking
        currentCycleStart: { type: Date },
        currentCycleEnd: { type: Date }
    }
}, {
    collection: 'students_v2',
    timestamps: true
});

studentSchemaV2.index({ 'statuses.student': 1, 'statuses.payment': 1, 'statuses.seat': 1 });
studentSchemaV2.index({ 'account.validTill': 1 });

const StudentV2 = mongoose.models.StudentV2 || mongoose.model('StudentV2', studentSchemaV2);

export default StudentV2;
