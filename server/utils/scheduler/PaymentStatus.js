import Student from "../../models/studentModel.js";
import cron from 'node-cron';
import { sendMail } from "../mailer.js";

const task = async () => {
    try {
        // const today = new Date("2024-06-30");
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison
        console.log(today)
        const students = await Student.find({ status: "Pending" });

        for (const student of students) {
            const paymentDateString = student.paymentDate ? student.paymentDate : '1970-01-01T00:00:00.000Z';
            const paymentDate = new Date(paymentDateString);
            paymentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

            const daysDifference = Math.floor((today - paymentDate) / (1000 * 60 * 60 * 24));
            console.log("daysDifference", daysDifference)
            console.log("paymentDate", paymentDate)
            // Send email if payment date is today or within the next 5 days
            if (paymentDate <= today && daysDifference <= 5) {
                console.log("Sending email...");
                // await sendMail({
                //     to: student.email,
                //     subject: "Payment Due",
                //     body: `Your Payment is due.<br/> Your ID is ${student.sid} <br/>`
                // });
                console.log("Email sent.");
            }

            // Change status to "Deactive" if 5 days have passed after payment date
            if (daysDifference > 5) {
                student.status = "Deactive";
                await student.save();
                console.log(`Status changed to "Deactive" for student ID: ${student.sid}`);
            }
        }

    } catch (error) {
        console.log(error);
    }
};

// Schedule the task to run every day at midnight
// cron.schedule('0 0 * * *', task);
cron.schedule('*/3 * * * * *', task);
