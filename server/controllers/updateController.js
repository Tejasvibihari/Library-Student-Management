import Student from '../models/studentModel.js';
import Seat from '../models/seatModel.js';


const getShiftLabel = (time) => {
    console.log(time)
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
    console.log(seat, shiftLabel)
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