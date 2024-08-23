import express from 'express';
import { createPayment, getAllPayments, getPaymentBySid, deletePayment } from '../controllers/paymentController.js'
const router = express.Router();

router.post('/makepayment', createPayment);
router.get('/getallpayment', getAllPayments);
// router.get('/getpaymentsid', getPaymentBySid);
router.get('/getpaymentsid/:sid', getPaymentBySid);
router.delete('/deletePayment/:id', deletePayment);
export default router;