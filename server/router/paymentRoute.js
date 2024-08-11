import express from 'express';
import { createPayment, getAllPayments } from '../controllers/paymentController.js'
const router = express.Router();

router.post('/makepayment', createPayment);
router.get('/getallpayment', getAllPayments);

export default router;