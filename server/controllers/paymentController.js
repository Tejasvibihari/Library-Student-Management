import Payment from '../models/paymentModel.js'; // Adjust the path as necessary
import Student from '../models/studentModel.js'; // Adjust the path as necessary
// import { addMonths } from 'date-fns';
// Create a new payment
export const createPayment = async (req, res) => {
    const { sid, payment_date, amount, months_paid_for, admissionDate } = req.body;
    try {
        // Check if the student exists
        const student = await Student.findOne({ sid });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        let nextPaymentDate;

        if (student.nextPayment) {
            // If nextPayment is not null, use it as the base date
            nextPaymentDate = new Date(student.nextPayment);
        } else {
            // If nextPayment is null, use the admissionDate as the base date
            nextPaymentDate = new Date(admissionDate);
        }

        // Extract the current year and month
        let year = nextPaymentDate.getFullYear();
        let month = nextPaymentDate.getMonth() + Number(months_paid_for);

        // Calculate the new year and month, considering overflow
        year += Math.floor(month / 12);
        month = month % 12;

        // Set the new year and month to the nextPaymentDate
        nextPaymentDate.setFullYear(year);
        nextPaymentDate.setMonth(month);

        student.nextPayment = nextPaymentDate;
        student.lastPayment = payment_date;

        // Save the updated student
        await student.save();

        // Create a new payment
        const newPayment = new Payment({
            sid,
            payment_date,
            amount,
            months_paid_for,
            admissionDate
        });

        // Save the payment to the database
        const savedPayment = await newPayment.save();

        res.status(201).json({ message: "Payment Success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all payments
export const getAllPayments = async (req, res) => {
    try {
        console.log("hello")
        const payments = await Payment.find().populate('sid');
        res.status(200).json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific payment by ID
export const getPaymentById = async (req, res) => {
    const { id } = req.params;

    try {
        const payment = await Payment.findById(id).populate('student_id');
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a payment
export const updatePayment = async (req, res) => {
    const { id } = req.params;
    const { student_id, payment_date, amount, months_paid_for, payment_method, admissionDate } = req.body;

    try {
        const updatedPayment = await Payment.findByIdAndUpdate(
            id,
            { student_id, payment_date, amount, months_paid_for, payment_method, admissionDate },
            { new: true }
        );

        if (!updatedPayment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json(updatedPayment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a payment
export const deletePayment = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPayment = await Payment.findByIdAndDelete(id);

        if (!deletedPayment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};