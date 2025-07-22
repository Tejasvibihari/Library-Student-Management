import Student from "../../models/studentModel.js";
import Seat from "../../models/seatModel.js";
import cron from 'node-cron';
import { sendMail } from "../mailer.js";



// Helper function to calculate full month cycles between two dates
function calculateMonthCycles(fromDate, toDate) {
    let months =
        (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
        (toDate.getMonth() - fromDate.getMonth());

    // If day of 'toDate' is >= day of 'fromDate', count the extra month
    if (toDate.getDate() >= fromDate.getDate()) {
        months += 1;
    }

    return months > 0 ? months : 0;
}


export const cronUpdateDeactivePendingPayments = async (req, res) => {
    try {
        const today = new Date();

        const students = await Student.find({
            status: { $in: ['Active', 'Pending', 'Deactive'] }
        });

        const updatedStudents = [];

        for (let student of students) {
            if (!student.nextPayment || !student.paymentAmount) continue;

            const nextPayDate = new Date(student.nextPayment);
            if (nextPayDate > today) continue;

            const monthsMissed = calculateMonthCycles(nextPayDate, today);

            if (monthsMissed > 0) {
                const missedAmount = monthsMissed * student.paymentAmount;

                student.paymentDue = -missedAmount;
                student.status = 'Pending';
                student.nextPayment.setMonth(student.nextPayment.getMonth() + monthsMissed);

                await student.save();

                // Prepare email content with template

                // Send email with the template
                sendMail({
                    to: student.email,
                    subject: "Payment Due Reminder - Bihari Library",
                    body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Due Reminder - Bihari Library</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #8B5CF6 0%, #a78bfa 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: white;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .logo img {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
        
        .header h1 {
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #1f2937;
        }
        
        .alert-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        
        .alert-title {
            color: #92400e;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .alert-icon {
            width: 20px;
            height: 20px;
            background: #f59e0b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        
        .payment-details {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .payment-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .payment-row:last-child {
            border-bottom: none;
            font-weight: 700;
            font-size: 18px;
            color: #8B5CF6;
        }
        
        .payment-label {
            color: #64748b;
            font-weight: 500;
        }
        
        .payment-value {
            font-weight: 600;
            color: #1f2937;
        }
        
        .cta-section {
            text-align: center;
            margin: 30px 0;
        }
        
        .cta-button {
            background: linear-gradient(135deg, #8B5CF6 0%, #a78bfa 100%);
            color: white;
            padding: 15px 35px;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
        }
        
        .important-note {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .important-note h3 {
            color: #dc2626;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .important-note p {
            color: #7f1d1d;
            font-size: 14px;
        }
        
        .contact-info {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
        }
        
        .contact-title {
            color: #8B5CF6;
            font-weight: 700;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            color: #475569;
        }
        
        .contact-item:last-child {
            margin-bottom: 0;
        }
        
        .contact-icon {
            width: 18px;
            height: 18px;
            margin-right: 12px;
            color: #8B5CF6;
        }
        
        .footer {
            background: #1f2937;
            color: white;
            text-align: center;
            padding: 25px;
        }
        
        .footer p {
            margin-bottom: 10px;
            opacity: 0.8;
        }
        
        .footer a {
            color: #8B5CF6;
            text-decoration: none;
        }
        
        .social-links {
            margin-top: 15px;
        }
        
        .social-links a {
            color: #8B5CF6;
            margin: 0 10px;
            text-decoration: none;
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .content {
                padding: 25px 20px;
            }
            
            .header {
                padding: 25px 20px;
            }
            
            .payment-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <img src="https://biharilibrary.in/img/biharilogo.png" alt="Bihari Library Logo">
            </div>
            <h1>BIHARI LIBRARY</h1>
            <p>Excellence in Education</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Dear <strong>${student.name}</strong>,
            </div>
            
            <p>We hope this email finds you well. This is a gentle reminder regarding your pending payment for your library membership.</p>
            
            <!-- Alert Box -->
            <div class="alert-box">
                <div class="alert-title">
                    <div class="alert-icon">!</div>
                    Payment Due Notice
                </div>
                <p>Your payment is currently overdue. Please review the details below and make the payment at your earliest convenience.</p>
            </div>
            
            <!-- Payment Details -->
            <div class="payment-details">
                <div class="payment-row">
                    <span class="payment-label">Student ID:</span>
                    <span class="payment-value">${student.sid}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">Monthly Fee:</span>
                    <span class="payment-value">₹${student.paymentAmount + student.extraPaymentDue}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">Due Date:</span>
                    <span class="payment-value">${student.nextPayment}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">Month Missed:</span>
                    <span class="payment-value">${monthsMissed}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">Total Amount Due:</span>
                    <span class="payment-value">₹${student.paymentAmount + student.extraPaymentDue}</span>
                </div>
            </div>
            
            
            <!-- Important Note -->
            <div class="important-note">
                <h3>⚠️ Important Notice</h3>
                <p>To continue enjoying uninterrupted access to our library services, please clear your dues within the next 7 days. Late payments may result in temporary suspension of library privileges.</p>
            </div>
            
            <!-- Contact Information -->
            <div class="contact-info">
                <div class="contact-title">Need Help? Contact Us:</div>
                <div class="contact-item">
                    <span class="contact-icon">📧</span>
                    <span>biharilibrary@gmail.com</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">📱</span>
                    <span>+91 9608888400</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">🌐</span>
                    <span>https://biharilibrary.in</span>
                </div>
            </div>
            
            <p style="margin-top: 25px; color: #64748b;">
                Thank you for being a valued member of Bihari Library. We appreciate your prompt attention to this matter.
            </p>
            
            <p style="margin-top: 20px;">
                Best regards,<br>
                <strong>Bihari Library Team</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>&copy; 2025 Bihari Library. All rights reserved.</p>
            <p>You are receiving this email because you are a registered student at Bihari Library.</p>
            <div class="social-links">
                <a href="https://biharilibrary.in">Visit Website</a> |
                <a href="mailto:biharilibrary@gmail.com">Email Support</a>
            </div>
        </div>
    </div>
</body>
</html>`
                });

                updatedStudents.push({
                    sid: student.sid,
                    name: student.name,
                    missedAmount: -missedAmount,
                    monthsMissed,
                });
            }
        }

        return res.status(200).json({
            message: 'Updated paymentDue for Deactive and Pending students',
            updatedCount: updatedStudents.length,
            updatedStudents
        });
    } catch (err) {
        console.error('cronUpdateDeactivePendingPayments error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Schedule the task to run every day at 6 AM
// cron.schedule('0 6 * * *', task);
// cron.schedule('*/5 * * * *', cronUpdateDeactivePendingPayments);

cron.schedule('0 5 * * *', cronUpdateDeactivePendingPayments, {
    timezone: "Asia/Kolkata"
});
console.log('Payment reminder cron job scheduled for 5:00 AM daily (IST)');
// From Here Old code Logic
// const getShiftLabel = (time) => {
//     console.log(time)
//     if (time === "07:00AM - 11:00AM") {
//         return "morning";
//     } else if (time === "11:00AM - 03:00PM") {
//         return "afternoon";
//     } else if (time === "03:00PM - 07:00PM") {
//         return "evening";
//     } else if (time === "07:00PM - 11:00PM") {
//         return "night";
//     } else if (time === "07:00PM - 07:00AM") {
//         return "nightLong";
//     } else if (time === "07:00AM - 03:00PM") {
//         return "doubleMorning";
//     } else if (time === "11:00AM - 07:00PM") {
//         return "doubleEvening";
//     } else if (time === "07:00AM - 07:00PM") {
//         return "morningLong";
//     } else {
//         return "fullDay";
//     }
// };



// const task = async () => {
//     try {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

//         const students = await Student.find();

//         for (const student of students) {
//             // Skip students whose status is "Trash"
//             if (student.status === "Trash") {
//                 continue;
//             }
//             const nextPaymentDateString = student.nextPayment ? student.nextPayment : '1970-01-01T00:00:00.000Z';
//             const nextPaymentDate = new Date(nextPaymentDateString);
//             nextPaymentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

//             const fiveDaysAgo = new Date();
//             fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
//             fiveDaysAgo.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

//             const shiftLabel = getShiftLabel(student.time);
//             const seat = await Seat.findOne({ seatNumber: student.seatNumber });
//             if (nextPaymentDate <= today) {
//                 if (nextPaymentDate <= fiveDaysAgo) {
//                     student.status = "Deactive";
//                     if (student.seatNumber !== "Other") {
//                         deleteSeatAvailability(seat, shiftLabel);
//                         await seat.save();
//                     }
//                 } else {
//                     student.status = "Pending";
//                     sendMail({
//                         to: student.email,
//                         subject: "Fee Due Reminder - Bihari Library",
//                         body: `<p>Dear ${student.name},</p>
// <p>&nbsp;</p>
// <p>We hope you're doing well! This is a gentle reminder that your membership fee at <strong>Bihari Library</strong> is due. Please submit the fee by the due date to continue enjoying uninterrupted access to our study and co-working facilities.</p>
// <p>&nbsp;</p>
// <p>Here are your details:</p>
// <ul>
// <li><strong>Student ID (SID):</strong> ${student.sid}</li>
// <li><strong>Shift:</strong> ${student.time}</li>
// <li><strong>Seat Number:</strong> ${student.seatNumber}</li>
// </ul>
// <p>To avoid any disruption to your access, kindly ensure the payment is made on or before the due date. If you&rsquo;ve already made the payment, please disregard this email.</p>
// <p>For payment-related questions or assistance, feel free to contact us at 9608888400.</p>
// <p>Thank you for your attention, and we appreciate your prompt action on this matter.</p>
// <p>Best regards,<br /><br />Bihari Library<br />biharilibrary@mail.com<br />9608888400</p>
// <p><img src="https://biharilibrary.in/img/biharilogo.png" alt="Bihari Logo" width="150" height="" /></p>`})

//                 }
//             } else {
//                 student.status = "Active";
//             }

//             await student.save();

//             console.log(`Status updated to "${student.status}" for student ID: ${student.sid}`);
//         }

//     } catch (error) {
//         console.log(error);
//     }
// };

// export const deleteSeatAvailability = (seat, shiftLabel) => {
//     const shifts = {
//         fullDay: ['morning', 'afternoon', 'evening', 'night', 'doubleMorning', 'doubleEvening', 'nightLong', 'fullDay', 'morningLong'],
//         morning: ['morning'],
//         afternoon: ['afternoon'],
//         evening: ['evening'],
//         night: ['night'],
//         doubleMorning: ['morning', 'afternoon', 'doubleMorning'],
//         doubleEvening: ['afternoon', 'evening', 'doubleEvening'],
//         morningLong: ['morning', 'afternoon', 'evening', 'morningLong'],
//         nightLong: ['night', 'nightLong']
//     };

//     if (!shifts[shiftLabel]) {
//         throw new Error(`Invalid seat shift: ${shiftLabel}`);
//     }

//     shifts[shiftLabel].forEach(shift => seat.availability[shift] = true); // Set availability to true when deleting
// };



