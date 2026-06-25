import mongoose from 'mongoose';

const { Schema } = mongoose;

export const PAYMENT_STATUS_V2 = ['paid', 'due'];
export const PAYMENT_TYPE_V2 = ['renewal', 'due_clearance', 'partial_due', 'adjustment'];

const paymentSchemaV2 = new Schema({
    legacyPayment: { type: Schema.Types.ObjectId, ref: 'Payment', index: true },
    student: { type: Schema.Types.ObjectId, ref: 'StudentV2', required: true, index: true },
    sid: { type: Number, required: true, index: true },

    paymentDate: { type: Date, default: Date.now, index: true },
    cycleStart: { type: Date, required: true },
    cycleEnd: { type: Date, required: true },

    shiftSnapshot: {
        code: { type: String, required: true },
        label: { type: String, required: true },
        displayTime: { type: String, required: true },
        amount: { type: Number, required: true }
    },

    // ── Billing rates at time of payment (snapshot) ───────────────────────────
    grossCycleAmount: { type: Number, required: true, min: 0 },
    fixedDiscountAmount: { type: Number, default: 0, min: 0 },
    netCycleAmount: { type: Number, required: true, min: 0 },
    dailyRate: { type: Number, required: true, min: 0 },

    // ── Payment amount ────────────────────────────────────────────────────────
    amountPaid: { type: Number, required: true, min: 0 },

    // ── Day tracking (core of the new architecture) ───────────────────────────
    purchasedDays: { type: Number, required: true, min: 0 }, // floor(amountPaid / dailyRate)
    dueDaysSettled: { type: Number, default: 0, min: 0 }, // how many overdue days this cleared
    newDaysAdded: { type: Number, default: 0 }, // net days added beyond clearing due

    remainingDaysBefore: { type: Number, default: 0 }, // can be negative (overdue)
    remainingDaysAfter: { type: Number, default: 0 }, // can be negative (still partially overdue)

    // ── Date snapshots (for audit / display) ─────────────────────────────────
    validTillBefore: { type: Date },
    validTillAfter: { type: Date },
    dueFromBefore: { type: Date },
    dueFromAfter: { type: Date },

    // ── Classification ────────────────────────────────────────────────────────
    paymentType: { type: String, enum: PAYMENT_TYPE_V2, required: true, index: true },
    status: { type: String, enum: PAYMENT_STATUS_V2, required: true, index: true },

    discountReason: { type: String },
    method: { type: String, default: 'cash' },
    note: { type: String },
    invoice: { type: Schema.Types.ObjectId, ref: 'InvoiceV2' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },

    // ── Reversal ──────────────────────────────────────────────────────────────
    isReversed: { type: Boolean, default: false, index: true },
    reversedAt: { type: Date },
    reversedReason: { type: String }
}, {
    collection: 'payments_v2',
    timestamps: true
});

paymentSchemaV2.index({ sid: 1, paymentDate: -1, createdAt: -1 });
paymentSchemaV2.index({ sid: 1, cycleStart: 1, cycleEnd: 1 });

paymentSchemaV2.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function () {
    throw new Error('PaymentV2 is an append-only ledger. Create a reversal entry instead of updating.');
});

const PaymentV2 = mongoose.models.PaymentV2 || mongoose.model('PaymentV2', paymentSchemaV2);

export default PaymentV2;