import express from 'express';
import { cronUpdateDeactivePendingPayments, updatePaymentStatus } from '../controllers/updateController.js';

const router = express.Router();

// Define the route for updating payment status
router.post('/update-student', updatePaymentStatus);

router.get('/updatecorn', cronUpdateDeactivePendingPayments);

export default router;