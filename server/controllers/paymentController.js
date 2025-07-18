import Payment from '../models/paymentModel.js'; // Adjust the path as necessary
import Student from '../models/studentModel.js'; // Adjust the path as necessary
import { sendMail } from '../utils/mailer.js';
import Invoice from "../models/invoiceModel.js"
// import { addMonths } from 'date-fns';
// Create a new payment


// New Payment Controller

export const payment = async (req, res) => {
    const { sid, extraPaymentAmount = 0 } = req.body;

    if (!sid) {
        return res.status(400).json({ error: 'Student ID (sid) is required.' });
    }

    try {
        const student = await Student.findOne({ sid });

        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        const today = new Date();
        const cycleAmount = student.paymentAmount;

        // Step 1: Get FROM and TO dates for current cycle
        const fromDate = student.nextPayment || student.admissionDate;
        const toDate = new Date(fromDate);
        toDate.setMonth(toDate.getMonth() + 1);

        // Step 2: Update student.nextPayment and student.lastPayment
        student.nextPayment = toDate;
        student.lastPayment = today;

        // Step 3: Add extra payment if any
        if (extraPaymentAmount > 0) {
            student.extraPaymentDue = (student.extraPaymentDue || 0) + extraPaymentAmount;
        }

        // Step 4: Add this cycle's paymentAmount towards paymentDue
        // Eg. if paymentDue = -1000 and cycleAmount = 500 => new paymentDue = -500
        student.paymentDue = (student.paymentDue || 0) + cycleAmount;

        // Step 5: Do NOT cap paymentDue at 0 — allow negative to show dues

        // Step 6: Update status
        student.status = student.paymentDue >= 0 ? 'Active' : 'Pending';

        await student.save();

        // Step 7: Create invoice
        const invoice = new Invoice({
            sid: student.sid,
            name: student.name,
            fromDate,
            toDate,
            paymentDate: today,
            paidAmount: cycleAmount,
            dueAmount: student.paymentDue,
            extraPaymentDue: student.extraPaymentDue || 0,
        });

        await invoice.save();

        return res.status(200).json({
            message: 'Payment processed and invoice created.',
            student: {
                sid: student.sid,
                name: student.name,
                paymentDue: student.paymentDue,
                extraPaymentDue: student.extraPaymentDue,
                nextPayment: student.nextPayment,
                status: student.status
            }
        });

    } catch (err) {
        console.error('Error updating payment cycle:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};



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



        // Get the current invoice number and increment it
        const lastPayment = await Payment.findOne().sort({ invoiceNumber: -1 });
        const invoiceNumber = lastPayment ? lastPayment.invoiceNumber + 1 : 1;


        // Create a new payment
        const newPayment = new Payment({
            sid,
            payment_date,
            amount,
            months_paid_for,
            admissionDate,
            invoiceNumber
        });

        // Save the payment to the database
        const savedPayment = await newPayment.save();

        sendMail({
            to: student.email,
            subject: "Payment Confirmation",
            body: `<div style="width: 80%; margin: 0px auto; padding: 20px; border: 1px solid #dddddd; border-radius: 5px; text-align: right;">
        <h1 style="text-align: center;"><img src="https://marudhardentalclinic.com/wp-content/uploads/2024/08/20240811_173606-scaled.webp" alt="" width="250" height="83" /></h1>
        <h3 style="text-align: center;">Bihari Traders Near Buddha Chowk Amarpura</h3>
        <h3 style="text-align: center;">Lock Naubatpur Patna - 801109</h3>
        <h3 style="text-align: center;">Mobile: 9608888400 | Web: www.biharilibrary.leafinfotech.in</h3>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 10px 0;" />
        <h2 style="text-align: center;">Invoice</h2>
        <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
        <tbody>
        <tr style="height: 13px;">
        <td style="padding: 8px; border: 1px solid #dddddd; height: 13px;"><strong>Invoice Number:</strong></td>
        <td style="padding: 8px; border: 1px solid #dddddd; height: 13px;">${invoiceNumber}</td>
        </tr>
        <tr style="height: 13px;">
        <td style="padding: 8px; border: 1px solid #dddddd; height: 13px;"><strong>Date:</strong></td>
        <td style="padding: 8px; border: 1px solid #dddddd; height: 13px;">${payment_date}</td>
        </tr>
        <tr style="height: 13.8px;">
        <td style="padding: 8px; border: 1px solid #dddddd; height: 13.8px;"><strong>Bill To:</strong></td>
        <td style="padding: 8px; border: 1px solid #dddddd; height: 13.8px;">${student.name}</td>
        </tr>
        </tbody>
        </table>
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
        <thead>
        <tr>
        <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Shift</th>
        <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Month</th>
        <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Amount</th>
        <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Total</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${student.time}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${student.nextPayment}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${amount}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${amount}</td>
        </tr>
        <!-- Add more rows as needed --></tbody>
        </table>
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
        <tbody>
        <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Subtotal:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${amount}</td>
        </tr>
        <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${amount}</td>
        </tr>
        </tbody>
        </table>
        <img style="border-radius: 50%;" src="https://marudhardentalclinic.com/wp-content/uploads/2024/08/sealpng.webp" alt="seal" width="100" height="100" />
        <h3 style="margin-top: 20px; text-align: right;">Library Authority</h3>
        </div>`
        })

        res.status(201).json({ message: "Payment Success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all payments
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('sid');
        res.status(200).json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific payment by ID
export const getPaymentBySid = async (req, res) => {
    const { sid } = req.params;
    console.log(sid);
    console.log(typeof (sid));
    try {
        const payments = await Payment.find({ sid });
        if (!payments || payments.length === 0) {
            return res.status(404).json({ message: 'Payments not found' });
        }
        res.status(200).json(payments);
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

