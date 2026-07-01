/**
 * paymentControllerV2.js
 *
 * Endpoints:
 *   POST /api/v2/payment        — record a payment
 *   GET  /api/v2/payment        — list all payments
 *   GET  /api/v2/payment/:sid   — payment history for one student
 */

import PaymentV2 from '../../models/v2/paymentModelV2.js';
import { recordPaymentV2, deletePaymentServiceV2 } from '../../services/v2/paymentServiceV2.js';
import { daysFromAmount, deriveAccountFromDays } from '../../services/v2/billingServiceV2.js';
import StudentV2 from '../../models/v2/studentModelV2.js';

export const makePaymentV2 = async (req, res) => {
    try {
        const sid = Number(req.body.sid);
        const amount = Number(req.body.amountPaid ?? req.body.amount ?? 0);

        if (!sid) return res.status(400).json({ message: 'sid is required.' });
        if (amount <= 0) return res.status(400).json({ message: 'amountPaid must be > 0.' });

        const result = await recordPaymentV2({
            sid,
            amountPaid: amount,
            discountReason: req.body.discountReason,
            paymentDate: req.body.paymentDate || req.body.payment_date || new Date(),
            method: req.body.method || req.body.payment_method || 'cash',
            note: req.body.note,
            createdBy: req.body.createdBy
        });

        return res.status(200).json({
            message: 'Payment recorded',
            payment: result.payment,
            invoice: result.invoice,
            student: result.student
        });
    } catch (error) {
        console.error('makePaymentV2:', error);
        return res.status(400).json({ message: error.message || 'Payment failed.' });
    }
};

/**
 * Preview how many days a given amount would purchase for a student,
 * before actually recording the payment.
 * GET /api/v2/payment/preview?sid=123&amount=500
 */
export const previewPaymentV2 = async (req, res) => {
    try {
        const sid = Number(req.query.sid);
        const amount = Number(req.query.amount || 0);
        if (!sid) return res.status(400).json({ message: 'sid is required.' });

        const student = await StudentV2.findOne({ sid });
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        const { getLiveStudentAccount, applyPayment, startOfDay } = await import('../../services/v2/billingServiceV2.js');
        const today = startOfDay(new Date());
        const live = getLiveStudentAccount(student, today);
        const result = applyPayment({
            currentRemainingDays: live.remainingDays,
            currentValidTill: live.validTill,
            amountPaid: amount,
            dailyRate: student.billing.dailyRate,
            asOfDate: today,
            dueFromDate: live.dueFrom
        });

        return res.json({
            sid,
            amount,
            dailyRate: student.billing.dailyRate,
            purchasedDays: result.purchasedDays,
            currentRemainingDays: live.remainingDays,
            newRemainingDays: result.newRemainingDays,
            newValidTill: result.validTill,
            newPaymentStatus: result.paymentStatus
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getAllPaymentsV2 = async (req, res) => {
    try {
        const payments = await PaymentV2.find({ isReversed: { $ne: true } })
            .sort({ paymentDate: -1, createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPaymentBySidV2 = async (req, res) => {
    try {
        const payments = await PaymentV2.find({
            sid: Number(req.params.sid),
            isReversed: { $ne: true }
        }).sort({ paymentDate: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deletePaymentV2 = async (req, res) => {
    try {

        if (!req.params.paymentId) {
            return res.status(400).json({
                success: false,
                message: "Payment ID is required."
            });
        }

        if (!req.body.reason?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Delete reason is required."
            });
        }

        const result = await deletePaymentServiceV2({
            paymentId: req.params.paymentId,
            reason: req.body.reason.trim(),
            deletedBy: req.body.deletedBy
        });

        return res.status(200).json({
            success: true,
            message: "Payment deleted successfully.",
            data: result
        });

    } catch (error) {

        console.error("deletePaymentV2:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};
export const getPaymentHistoryV2 = getPaymentBySidV2;