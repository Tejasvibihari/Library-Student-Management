import mongoose from 'mongoose';

const { Schema } = mongoose;

export const INVOICE_STATUS_V2 = ['paid', 'partial', 'due', 'advance', 'cancelled'];

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
        enum: ['fee', 'fixed_discount', 'one_time_discount', 'previous_due', 'payment', 'advance'],
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
    validTillAfter: { type: Date },
    dueFromAfter: { type: Date },

    items: { type: [invoiceItemSchemaV2], default: [] },
    grossCycleAmount: { type: Number, required: true },
    fixedDiscountAmount: { type: Number, default: 0 },
    oneTimeDiscountAmount: { type: Number, default: 0 },
    netCycleAmount: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    dueAmountAfter: { type: Number, default: 0 },
    advanceAmountAfter: { type: Number, default: 0 },
    dueDaysAfter: { type: Number, default: 0 },
    creditDaysAfter: { type: Number, default: 0 },

    status: { type: String, enum: INVOICE_STATUS_V2, required: true, index: true },
    pdfUrl: { type: String }
}, {
    collection: 'invoices_v2',
    timestamps: true
});

const InvoiceCounterV2 = mongoose.models.InvoiceCounterV2 || mongoose.model('InvoiceCounterV2', invoiceCounterSchemaV2);

// No DB transaction/session here (single mongod, no replica set). This is a
// single atomic findOneAndUpdate with $inc + upsert, which Mongo guarantees
// is atomic on its own even without a multi-document transaction, so it's
// still safe to call concurrently without a session.
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