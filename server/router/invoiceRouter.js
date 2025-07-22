import express from 'express';
import { deleteInvoiceById, getAllInvoices, getInvoiceBySid } from '../controllers/invoiceController.js';


const router = express.Router();

// Define the route for updating payment status
router.get('/getallinvoice', getAllInvoices);

router.get('/getinvoicebysid/:sid', getInvoiceBySid);
router.delete('/deleteinvoice/:id/:sid', deleteInvoiceById);

export default router;