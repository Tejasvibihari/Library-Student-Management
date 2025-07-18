// controllers/invoiceController.js

import Invoice from '../models/Invoice.js';

// GET: Get all invoices
export const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 }); // latest first
        res.status(200).json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Failed to retrieve invoices' });
    }
};

