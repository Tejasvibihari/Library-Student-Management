import InvoiceV2 from '../../models/v2/invoiceModelV2.js';

export const getAllInvoicesV2 = async (req, res) => {
    try {
        const invoices = await InvoiceV2.find().sort({ issuedAt: -1, createdAt: -1 });
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInvoiceBySidV2 = async (req, res) => {
    try {
        const invoices = await InvoiceV2.find({ sid: Number(req.params.sid) }).sort({ issuedAt: -1 });
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
