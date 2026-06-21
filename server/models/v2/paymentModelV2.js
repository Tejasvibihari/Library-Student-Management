import mongoose from 'mongoose';

const { Schema } = mongoose;

export const PAYMENT_STATUS_V2 = ['paid', 'partial', 'due', 'advance'];
export const PAYMENT_TYPE_V2 = ['normal', 'partial', 'advance', 'due_clearance', 'discount_adjustment'];

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

    grossCycleAmount: { type: Number, required: true, min: 0 },
    fixedDiscountAmount: { type: Number, default: 0, min: 0 },
    oneTimeDiscountAmount: { type: Number, default: 0, min: 0 },
    discountReason: { type: String },
    netCycleAmount: { type: Number, required: true, min: 0 },
    dailyRate: { type: Number, required: true, min: 0 },

    amountPaid: { type: Number, required: true, min: 0 },
    effectiveCreditAmount: { type: Number, required: true, min: 0 },

    balanceBefore: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: 0 },
    dueAmountBefore: { type: Number, default: 0 },
    dueAmountAfter: { type: Number, default: 0 },
    advanceAmountBefore: { type: Number, default: 0 },
    advanceAmountAfter: { type: Number, default: 0 },
    dueDaysBefore: { type: Number, default: 0 },
    dueDaysAfter: { type: Number, default: 0 },
    creditDaysBefore: { type: Number, default: 0 },
    creditDaysAfter: { type: Number, default: 0 },
    validTillBefore: { type: Date },
    validTillAfter: { type: Date },
    dueFromBefore: { type: Date },
    dueFromAfter: { type: Date },

    amountUsedForDue: { type: Number, default: 0 },
    amountUsedForSubscription: { type: Number, default: 0 },
    amountMovedToAdvance: { type: Number, default: 0 },

    paymentType: { type: String, enum: PAYMENT_TYPE_V2, required: true, index: true },
    status: { type: String, enum: PAYMENT_STATUS_V2, required: true, index: true },
    method: { type: String, default: 'cash' },
    note: { type: String },
    invoice: { type: Schema.Types.ObjectId, ref: 'InvoiceV2' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
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
