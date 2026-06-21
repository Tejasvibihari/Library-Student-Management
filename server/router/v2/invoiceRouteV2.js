import express from 'express';
import { getAllInvoicesV2, getInvoiceBySidV2 } from '../../controllers/v2/invoiceControllerV2.js';

const router = express.Router();

router.get('/getallinvoice', getAllInvoicesV2);
router.get('/getinvoicebysid/:sid', getInvoiceBySidV2);

export default router;
