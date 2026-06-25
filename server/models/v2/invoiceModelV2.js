import mongoose from 'mongoose';

const { Schema } = mongoose;

export const INVOICE_STATUS_V2 = ['paid', 'due', 'cancelled'];

const invoiceCounterSchemaV2 = new Schema({
    name: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 }
}, {
    collection: 'counters_v2',
    timestamps: true
});

const invoiceItemSchemaV2 = new Schema({
    label: { type: String, required: true },
    amount: { type: Number, required: true },
    kind: {
        type: String,
        enum: [
            'fee',              // shift cycle charge
            'fixed_discount',  // recurring shift discount
            'due_settlement',  // overdue days cleared by this payment
            'payment'          // cash received
        ],
        required: true
    }
}, { _id: false });

const invoiceSchemaV2 = new Schema({
    legacyInvoice: { type: Schema.Types.ObjectId, ref: 'Invoice', index: true },
    invoiceNumber: { type: Number, required: true, unique: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'StudentV2', required: true, index: true },
    sid: { type: Number, required: true, index: true },
    payment: { type: Schema.Types.ObjectId, ref: 'PaymentV2', required: true, unique: true },

    issuedAt: { type: Date, default: Date.now },
    cycleStart: { type: Date, required: true },
    cycleEnd: { type: Date, required: true },

    // ── Line items ────────────────────────────────────────────────────────────
    items: { type: [invoiceItemSchemaV2], default: [] },

    // ── Billing snapshot ──────────────────────────────────────────────────────
    grossCycleAmount: { type: Number, required: true },
    fixedDiscountAmount: { type: Number, default: 0 },
    netCycleAmount: { type: Number, required: true },
    amountPaid: { type: Number, required: true },

    // ── Day summary (what the student actually got) ───────────────────────────
    purchasedDays: { type: Number, required: true }, // days bought by this payment
    remainingDaysAfter: { type: Number, required: true }, // total days left after payment (can be negative)

    // ── Resulting dates ───────────────────────────────────────────────────────
    validTillAfter: { type: Date },   // new coverage end date
    dueFromAfter: { type: Date },   // null if now paid

    status: { type: String, enum: INVOICE_STATUS_V2, required: true, index: true },
    pdfUrl: { type: String }
}, {
    collection: 'invoices_v2',
    timestamps: true
});

const InvoiceCounterV2 = mongoose.models.InvoiceCounterV2
    || mongoose.model('InvoiceCounterV2', invoiceCounterSchemaV2);

// Atomic counter — safe without a transaction on single mongod
invoiceSchemaV2.statics.getNextInvoiceNumber = async function () {
    const counter = await InvoiceCounterV2.findOneAndUpdate(
        { name: 'invoiceNumber' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );
    return counter.value;
};

const InvoiceV2 = mongoose.models.InvoiceV2 || mongoose.model('InvoiceV2', invoiceSchemaV2);

export default InvoiceV2;
export { InvoiceCounterV2 };