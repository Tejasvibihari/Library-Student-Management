import Student from "../../models/studentModel.js";
import cron from 'node-cron';
import { sendMail } from "../mailer.js";



const task = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

        const students = await Student.find();

        for (const student of students) {
            const nextPaymentDateString = student.nextPayment ? student.nextPayment : '1970-01-01T00:00:00.000Z';
            const nextPaymentDate = new Date(nextPaymentDateString);
            nextPaymentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
            fiveDaysAgo.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison

            if (nextPaymentDate <= today) {
                if (nextPaymentDate <= fiveDaysAgo) {
                    student.status = "Deactive";
                } else {
                    student.status = "Pending";
                }
            } else {
                student.status = "Active";
            }

            await student.save();

            console.log(`Status updated to "${student.status}" for student ID: ${student.sid}`);
        }

    } catch (error) {
        console.log(error);
    }
};


// Schedule the task to run every day at 6 AM
// cron.schedule('0 6 * * *', task);
cron.schedule('*/5 * * * *', task);