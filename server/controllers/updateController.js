import Student from '../models/studentModel.js';
import Seat from '../models/seatModel.js';
import { sendMail } from '../utils/mailer.js';


const getShiftLabel = (time) => {
    // console.log(time)
    if (time === "07:00AM - 11:00AM") {
        return "morning";
    } else if (time === "11:00AM - 03:00PM") {
        return "afternoon";
    } else if (time === "03:00PM - 07:00PM") {
        return "evening";
    } else if (time === "07:00PM - 11:00PM") {
        return "night";
    } else if (time === "07:00PM - 07:00AM") {
        return "nightLong";
    } else if (time === "07:00AM - 03:00PM") {
        return "doubleMorning";
    } else if (time === "11:00AM - 07:00PM") {
        return "doubleEvening";
    } else if (time === "07:00AM - 07:00PM") {
        return "morningLong";
    } else {
        return "fullDay";
    }
};


export const updatePaymentStatus = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

        const students = await Student.find();

        for (const student of students) {
            // Skip students whose status is "Trash"
            if (student.status === "Trash") {
                continue;
            }
            const nextPaymentDateString = student.nextPayment ? student.nextPayment : '1970-01-01T00:00:00.000Z';
            const nextPaymentDate = new Date(nextPaymentDateString);
            nextPaymentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            fiveDaysAgo.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

            // Map the shift time to the appropriate shift label
            const shiftLabel = getShiftLabel(student.time);
            const seat = await Seat.findOne({ seatNumber: student.seatNumber });
            if (nextPaymentDate <= today) {
                if (nextPaymentDate <= fiveDaysAgo) {
                    student.status = "Deactive";
                    if (student.seatNumber !== "Other") {
                        deleteSeatAvailability(seat, shiftLabel);
                        await seat.save();
                    }
                } else {
                    student.status = "Pending";

                    sendMail({
                        to: student.email,
                        subject: "Fee Due Reminder - Bihari Library",
                        body: `<p>Dear ${student.name},</p>
<p>&nbsp;</p>
<p>We hope you're doing well! This is a gentle reminder that your membership fee at <strong>Bihari Library</strong> is due. Please submit the fee by the due date to continue enjoying uninterrupted access to our study and co-working facilities.</p>
<p>&nbsp;</p>
<p>Here are your details:</p>
<ul>
<li><strong>Student ID (SID):</strong> ${student.sid}</li>
<li><strong>Shift:</strong> ${student.time}</li>
<li><strong>Seat Number:</strong> ${student.seatNumber}</li>
</ul>
<p>To avoid any disruption to your access, kindly ensure the payment is made on or before the due date. If you&rsquo;ve already made the payment, please disregard this email.</p>
<p>For payment-related questions or assistance, feel free to contact us at 9608888400.</p>
<p>Thank you for your attention, and we appreciate your prompt action on this matter.</p>
<p>Best regards,<br /><br />Bihari Library<br />biharilibrary@mail.com<br />9608888400</p>
<p><img src="https://biharilibrary.in/img/biharilogo.png" alt="Bihari Logo" width="150" height="" /></p>`})


                }
            } else {
                student.status = "Active";
            }

            await student.save();

            // console.log(`Status updated to "${student.status}" for student ID: ${student.sid}`);
        }

        res.status(200).json({ message: "Updated Success" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", error });
    }
};

export const deleteSeatAvailability = (seat, shiftLabel) => {
    // console.log(seat, shiftLabel)
    const shifts = {
        fullDay: ['morning', 'afternoon', 'evening', 'night', 'doubleMorning', 'doubleEvening', 'nightLong', 'fullDay', 'morningLong'],
        morning: ['morning'],
        afternoon: ['afternoon'],
        evening: ['evening'],
        night: ['night'],
        doubleMorning: ['morning', 'afternoon', 'doubleMorning'],
        doubleEvening: ['afternoon', 'evening', 'doubleEvening'],
        morningLong: ['morning', 'afternoon', 'evening', 'morningLong'],
        nightLong: ['night', 'nightLong']
    };

    if (!shifts[shiftLabel]) {
        throw new Error(`Invalid seat shift: ${shiftLabel}`);
    }

    shifts[shiftLabel].forEach(shift => seat.availability[shift] = true); // Set availability to true when deleting

};


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
            status: { $in: ['Pending', 'Deactive'] }
        });

        const updatedStudents = [];

        for (let student of students) {
            if (!student.nextPayment || !student.paymentAmount) continue;

            const nextPayDate = new Date(student.nextPayment);

            // If the nextPayment is after today, skip
            if (nextPayDate > today) continue;

            const monthsMissed = calculateMonthCycles(nextPayDate, today);

            if (monthsMissed > 0) {
                const missedAmount = monthsMissed * student.paymentAmount;

                student.paymentDue = -missedAmount;
                student.status = 'Pending';

                // Move nextPayment forward by missed cycles
                student.nextPayment.setMonth(student.nextPayment.getMonth() + monthsMissed);

                await student.save();

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