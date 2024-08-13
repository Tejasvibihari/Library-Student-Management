import Student from "../../models/studentModel.js";
import cron from 'node-cron';
import Seat from "../../models/seatModel.js";
import mongoose from 'mongoose';

// Function to get seat shift based on time
const getSeatShift = (time) => {
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

// Schedule a cron job to run at 00:00 every day
const task = async () => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const students = await Student.find();

        for (const student of students) {
            if (student.nextPayment <= today) {
                const seatShift = getSeatShift(student.time);
                await Seat.updateOne(
                    { seatNumber: student.seatNumber },
                    { $set: { [`availability.${seatShift}`]: true } }
                );
            }
        }
    } catch (error) {
        console.error('Error updating seat availability:', error);
    }
};

cron.schedule('0 0 * * *', task);