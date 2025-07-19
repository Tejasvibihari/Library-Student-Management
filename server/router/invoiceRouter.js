import express from 'express';
import { getAllInvoices } from '../controllers/invoiceController.js';


const router = express.Router();

// Define the route for updating payment status
router.post('/getAllInvoice', getAllInvoices);



export default router;