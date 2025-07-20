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
            student: student._id, // required
            sid: student.sid,
            cycleStart: fromDate, // rename from fromDate
            cycleEnd: toDate,     // rename from toDate
            paymentDate: today,
            amountPaid: cycleAmount,
            extraAmountPaid: extraPaymentAmount || 0,
            remainingDue: student.paymentDue,
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
            body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bihari Library - Invoice</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f8fafc;
            padding: 20px;
            color: #1e293b;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(139, 92, 246, 0.15);
        }
        
        .header {
            background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
            color: white;
            padding: 30px;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
        }
        
        .header-content {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .logo-section {
            text-align: center;
        }
        
        .logo {
            background: white;
            padding: 15px;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 15px;
        }
        
        .company-info h2 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .company-info p {
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.5;
        }
        
        .invoice-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 15px 25px;
            border-radius: 50px;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        
        .invoice-badge h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .invoice-badge p {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .content {
            padding: 40px;
        }
        
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        .detail-section h3 {
            color: #8B5CF6;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .detail-section h3::before {
            content: '';
            width: 4px;
            height: 20px;
            background: #8B5CF6;
            margin-right: 10px;
            border-radius: 2px;
        }
        
        .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-weight: 600;
            color: #64748b;
            font-size: 14px;
        }
        
        .info-value {
            font-weight: 600;
            color: #1e293b;
            font-size: 14px;
        }
        
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
        }
        
        .payment-table thead {
            background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
            color: white;
        }
        
        .payment-table th {
            padding: 20px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .payment-table td {
            padding: 20px 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .payment-table tbody tr:hover {
            background: #f8fafc;
        }
        
        .payment-table tbody tr:last-child td {
            border-bottom: none;
        }
        
        .amount {
            font-weight: 700;
            color: #059669;
            font-size: 16px;
        }
        
        .summary-section {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
        }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .summary-table td {
            padding: 12px 0;
            border-bottom: 1px solid #cbd5e1;
        }
        
        .summary-table tr:last-child td {
            border-bottom: 2px solid #8B5CF6;
            font-weight: 700;
            font-size: 18px;
            color: #8B5CF6;
        }
        
        .summary-label {
            font-weight: 600;
            color: #475569;
        }
        
        .summary-value {
            text-align: right;
            font-weight: 600;
            color: #1e293b;
        }
        
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .seal-section {
            text-align: center;
        }
        
        .seal {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 3px solid #8B5CF6;
            padding: 10px;
            background: white;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
        }
        
        .authority-section {
            text-align: right;
        }
        
        .authority-section h3 {
            color: #8B5CF6;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .authority-section p {
            color: #64748b;
            font-size: 14px;
        }
        
        .payment-status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-paid {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-due {
            background: #fef3c7;
            color: #92400e;
        }
        
        .cycle-info {
            background: linear-gradient(135deg, #ddd6fe 0%, #e879f9 100%);
            color: #581c87;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
            font-weight: 600;
        }
        
        @media (max-width: 768px) {
            .invoice-container {
                margin: 0 10px;
                border-radius: 10px;
            }
            
            .header-content {
                flex-direction: column;
                text-align: center;
            }
            
            .content {
                padding: 20px;
            }
            
            .invoice-details {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .footer {
                flex-direction: column;
                text-align: center;
            }
            
            .authority-section {
                text-align: center;
            }
            
            .payment-table {
                font-size: 14px;
            }
            
            .payment-table th,
            .payment-table td {
                padding: 15px 10px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="header-content">
                <div class="logo-section">
                    <div class="logo">
                        <img src="https://biharilibrary.in/img/biharilogo.png"
                             alt="Bihari Library Logo" width="200" height="66" />
                    </div>
                    <div class="company-info">
                        <h2>Bihari Library</h2>
                        <p>Bihari Traders Near Buddha Chowk Amarpura<br>
                           Lock Naubatpur Patna - 801109<br>
                           📞 9608888400 | 🌐 www.biharilibrary.in</p>
                    </div>
                </div>
                
                <div class="invoice-badge">
                    <h1>INVOICE</h1>
                    <p>Payment Receipt</p>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="invoice-details">
                <div class="detail-section">
                    <h3>📄 Invoice Details</h3>
                    <div class="info-card">
                        <div class="info-row">
                            <span class="info-label">Invoice Number:</span>
                            <span class="info-value">#${invoiceNumber || 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Payment Date:</span>
                            <span class="info-value">${new Date(payment_date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Student ID:</span>
                            <span class="info-value">${sid}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Status:</span>
                            <span class="payment-status ${remainingDue > 0 ? 'status-paid' : 'status-due'}">
                                ${remainingDue > 0 ? 'Paid' : 'Due'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>👤 Student Information</h3>
                    <div class="info-card">
                        <div class="info-row">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${student.name}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Father's Name:</span>
                            <span class="info-value">${student.father}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Shift:</span>
                            <span class="info-value">${student.shift}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Timing:</span>
                            <span class="info-value">${student.time}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Seat Number:</span>
                            <span class="info-value">${student.seatNumber}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Address:</span>
                            <span class="info-value">${student.address}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="cycle-info">
                📅 Payment Cycle: ${new Date(cycleStart).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })} - ${new Date(cycleEnd).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })}
            </div>
            
            <table class="payment-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Shift</th>
                        <th>Duration</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>Library Fee</strong><br>
                            <small style="color: #64748b;">Monthly subscription fee</small>
                        </td>
                        <td>${student.shift}<br><small style="color: #64748b;">${student.time}</small></td>
                        <td>
                            ${new Date(cycleStart).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
            })} - ${new Date(cycleEnd).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })}
                        </td>
                        <td class="amount">₹${amountPaid.toLocaleString('en-IN')}</td>
                    </tr>
                    ${extraAmountPaid > 0 ? `
                    <tr>
                        <td>
                            <strong>Extra Payment</strong><br>
                            <small style="color: #64748b;">Additional amount</small>
                        </td>
                        <td>-</td>
                        <td>-</td>
                        <td class="amount">₹${extraAmountPaid.toLocaleString('en-IN')}</td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>
            
            <div class="summary-section">
                <table class="summary-table">
                    <tr>
                        <td class="summary-label">Subtotal:</td>
                        <td class="summary-value">₹${amountPaid.toLocaleString('en-IN')}</td>
                    </tr>
                    ${extraAmountPaid > 0 ? `
                    <tr>
                        <td class="summary-label">Extra Amount:</td>
                        <td class="summary-value">₹${extraAmountPaid.toLocaleString('en-IN')}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td class="summary-label">Total Paid:</td>
                        <td class="summary-value">₹${(amountPaid + extraAmountPaid).toLocaleString('en-IN')}</td>
                    </tr>
                    ${remainingDue > 0 ? `
                    <tr>
                        <td class="summary-label" style="color: #dc2626;">Remaining Due:</td>
                        <td class="summary-value" style="color: #dc2626;">₹${remainingDue.toLocaleString('en-IN')}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td class="summary-label">Grand Total:</td>
                        <td class="summary-value">₹${(amountPaid + extraAmountPaid).toLocaleString('en-IN')}</td>
                    </tr>
                </table>
            </div>
            
            <div class="footer">
                <div class="seal-section">
                    <img class="seal" src="https://marudhardentalclinic.com/wp-content/uploads/2024/08/sealpng.webp" alt="Official Seal" />
                    <p style="margin-top: 10px; color: #64748b; font-size: 12px;">Official Seal</p>
                </div>
                
                <div class="authority-section">
                    <h3>Library Authority</h3>
                    <p>Authorized Signatory</p>
                    <p style="margin-top: 15px; font-size: 12px; color: #64748b;">
                        This is a computer-generated invoice.<br>
                        Thank you for your payment!
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
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

