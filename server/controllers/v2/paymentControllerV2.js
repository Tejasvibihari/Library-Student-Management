import PaymentV2 from '../../models/v2/paymentModelV2.js';
import { recordPaymentV2 } from '../../services/v2/paymentServiceV2.js';

export const makePaymentV2 = async (req, res) => {
    try {
        const result = await recordPaymentV2({
            sid: Number(req.body.sid),
            amountPaid: Number(req.body.amountPaid ?? req.body.amount ?? 0),
            oneTimeDiscountAmount: Number(req.body.oneTimeDiscountAmount ?? req.body.discountAmount ?? 0),
            discountReason: req.body.discountReason,
            paymentDate: req.body.paymentDate || req.body.payment_date || new Date(),
            method: req.body.method || req.body.payment_method || 'cash',
            note: req.body.note,
            createdBy: req.body.createdBy
        });

        return res.status(200).json({
            message: 'Payment Success',
            payment: result.payment,
            invoice: result.invoice,
            student: result.student,
            booking: result.booking
        });
    } catch (error) {
        console.error('makePaymentV2 error:', error);
        return res.status(400).json({ message: error.message || 'Payment failed.' });
    }
};

export const getAllPaymentsV2 = async (req, res) => {
    try {
        const payments = await PaymentV2.find({ isReversed: false }).sort({ paymentDate: -1, createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPaymentBySidV2 = async (req, res) => {
    try {
        const payments = await PaymentV2.find({ sid: Number(req.params.sid), isReversed: false }).sort({ paymentDate: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPaymentHistoryV2 = getPaymentBySidV2;
