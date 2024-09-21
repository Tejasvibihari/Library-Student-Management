import express from 'express';
import { updatePaymentStatus } from '../controllers/updateController.js';

const router = express.Router();

// Define the route for updating payment status
router.post('/update-student', updatePaymentStatus);

export default router;