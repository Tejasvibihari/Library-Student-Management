import express from 'express';
import { getAllInvoices, getInvoiceBySid } from '../controllers/invoiceController.js';


const router = express.Router();

// Define the route for updating payment status
router.get('/getallinvoice', getAllInvoices);
router.get('/getinvoicebysid/:sid', getInvoiceBySid);


export default router;