// controllers/invoiceController.js

import Invoice from '../models/invoiceModel.js';
import Student from '../models/studentModel.js';

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

export const deleteInvoiceById = async (req, res) => {
    const { id, sid } = req.params;
    console.log('Deleting invoice with ID:', id, 'for SID:', sid);

    try {
        // First, get the invoice details before deleting
        const invoiceToDelete = await Invoice.findById(id);

        if (!invoiceToDelete) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Get the student details
        const student = await Student.findOne({ sid: parseInt(sid) });


        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Step 1: Reverse the payment cycle
        // Set nextPayment back to the cycleStart of the deleted invoice
        student.nextPayment = invoiceToDelete.cycleStart;

        // Step 2: Find the previous payment date
        // Get the most recent invoice before this one to set lastPayment
        const previousInvoice = await Invoice.findOne({
            sid: student.sid,
            paymentDate: { $lt: invoiceToDelete.paymentDate }
        }).sort({ paymentDate: -1 });

        if (previousInvoice) {
            student.lastPayment = previousInvoice.paymentDate;
        } else {
            // If no previous invoice, set lastPayment to null or admission date
            student.lastPayment = null;
        }

        // Step 3: Reverse the paymentDue calculation
        // Subtract the cycle amount that was added during payment
        const cycleAmount = invoiceToDelete.amountPaid;
        student.paymentDue = (student.paymentDue || 0) - cycleAmount;

        // Step 4: Reverse extra payment if any
        if (invoiceToDelete.extraAmountPaid > 0) {
            student.extraPaymentDue = (student.extraPaymentDue || 0) - invoiceToDelete.extraAmountPaid;
        }

        // Step 5: Update status based on new paymentDue
        student.status = student.paymentDue >= 0 ? 'Active' : 'Pending';

        // Save the updated student
        await student.save();

        // Step 6: Finally delete the invoice
        await Invoice.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Invoice deleted successfully and student payment cycle updated',
            updatedStudent: {
                sid: student.sid,
                nextPayment: student.nextPayment,
                lastPayment: student.lastPayment,
                paymentDue: student.paymentDue,
                extraPaymentDue: student.extraPaymentDue,
                status: student.status
            }
        });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ message: 'Failed to delete invoice' });
    }
};
