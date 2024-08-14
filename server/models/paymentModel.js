import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    sid: { type: Number, required: true },
    payment_date: { type: Date, required: true },
    amount: { type: Number, required: true },
    months_paid_for: { type: Number, required: true },
    // payment_method: { type: String, required: true },
    admissionDate: { type: Date, required: true },
    invoiceNumber: { type: Number, required: true }
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;