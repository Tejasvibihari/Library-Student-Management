import express from 'express';
import { createPayment, getAllPayments, getPaymentBySid } from '../controllers/paymentController.js'
const router = express.Router();

router.post('/makepayment', createPayment);
router.get('/getallpayment', getAllPayments);
router.get('/getpaymentsid', getPaymentBySid);

export default router;