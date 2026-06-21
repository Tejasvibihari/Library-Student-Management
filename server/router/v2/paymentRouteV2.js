import express from 'express';
import { getAllPaymentsV2, getPaymentBySidV2, getPaymentHistoryV2, makePaymentV2 } from '../../controllers/v2/paymentControllerV2.js';

const router = express.Router();

router.post('/makepayment', makePaymentV2);
router.get('/getallpayment', getAllPaymentsV2);
router.get('/getpaymentsid/:sid', getPaymentBySidV2);
router.get('/history/:sid', getPaymentHistoryV2);

export default router;
