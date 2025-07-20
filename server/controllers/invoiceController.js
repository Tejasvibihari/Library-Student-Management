// controllers/invoiceController.js

import Invoice from '../models/invoiceModel.js';

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
// Get a specific payment by ID
export const getInvoiceBySid = async (req, res) => {
    const { sid } = req.params;

    try {
        const invoices = await Invoice.find({ sid });

        if (!invoices || invoices.length === 0) {
            return res.status(404).json({ message: 'No invoices found for this SID' });
        }

        return res.status(200).json(invoices);
    } catch (error) {
        console.error('Error fetching invoices by SID:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
