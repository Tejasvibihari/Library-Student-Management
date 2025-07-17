import Student from '../models/studentModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/mailer.js';
import fs from 'fs';
import path from 'path';
import Payment from '../models/paymentModel.js';
import Seat from '../models/seatModel.js';
import { fileURLToPath } from 'url';
import sharp from 'sharp'
import { oldAdmission, newAdmission } from './EmailTamplet.js';
// Define __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createOldStudent = async (req, res) => {
    const {
        sid, name, email, mobile, father, guardian, gender, admissionDate, shift, time, paymentAmount, address, image, lastPayment, seatNumber, seatShift
    } = req.body;
    console.log(seatShift)
    try {
        let imageFilename = null;
        let password;

        const student = await Student.findOne({ sid });
        const studentEmail = await Student.findOne({ email });
        // const seat = await Seat.findOne({ seatNumber });

        if (student || studentEmail) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        if (image && typeof image === 'string') {
            const base64String = image.split(",")[1];
            if (base64String) {
                const imageBuffer = Buffer.from(base64String, 'base64');
                imageFilename = `${sid}.jpeg`;
                const uploadsDir = path.join(__dirname, '../uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir);
                }
                try {
                    const compressedBuffer = await sharp(imageBuffer)
                        .jpeg({ quality: 80 })
                        .toBuffer();
                    fs.writeFileSync(path.join(uploadsDir, imageFilename), compressedBuffer);
                } catch (err) {
                    console.error('Error compressing the image:', err);
                    return res.status(500).json({ message: 'Error processing image' });
                }
            } else {
                console.error("Invalid image format: base64 string is missing.");
                return res.status(400).json({ message: 'Invalid image format' });
            }
        } else {
            console.error("Invalid image: image is either undefined or not a string.");
            return res.status(400).json({ message: 'Invalid image' });
        }
        // Handle old student admissions
        password = name.slice(0, 4).toUpperCase() + mobile.toString().slice(-4);
        const hashedPassword = await bcrypt.hash(password, 12);

        if (seatNumber !== 'Other') {
            const seat = await Seat.findOne({ seatNumber });
            if (seat) {
                updateSeatAvailability(seat, seatShift);
                await seat.save();
            }
            return res.status(404).json({ message: "Seat Not Found" });
        }

        await Student.create({
            sid, name, email, seatNumber, password: hashedPassword, mobile, father, guardian,
            gender, admissionDate, shift, time, paymentAmount, address,
            image: imageFilename, lastPayment
        });

        sendMail({
            to: email,
            subject: "Welcome to Bihari Library - Admission Confirmation",
            body: `
                    <p>Dear ${name},</p>
                    <p>We are thrilled to welcome you to Bihari Library. Congratulations on your admission. Below are the details of your enrollment:</p>
                    <p><strong>Student Information:</strong></p>
                    <ul>
                        <li><strong>Student ID:</strong> ${sid}</li>
                        <li><strong>Name:</strong> ${name}</li>
                        <li><strong>Shift:</strong> ${shift}</li>
                        <li><strong>Admission Date:</strong> ${admissionDate}</li>
                        <li><strong>Father's Name:</strong> ${father}</li>
                        <li><strong>Address:</strong> ${address}</li>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Password:</strong> ${password}</li>
                    </ul>
                    <p>To complete your admission, please proceed with the payment of the required fee. Detailed payment instructions and deadlines will be sent to you soon.</p>
                    <p>You can access your student dashboard and manage your account by clicking the link below: <a href="https://biharilibrary.in/student-dashboard" target="_new" rel="noreferrer">Student Dashboard</a></p>
                    <p>or&nbsp;</p>
                    <p>Copy the link Given Below and paste it into any Browser</p>
                    <p>https://biharilibrary.in/student-dashboard</p>
                    <p>Should you have any questions or need further assistance, feel free to reach out to us at <strong>Bihari Library</strong>. We are here to support you every step of the way.</p>
                    <p>Once again, congratulations on your admission! We look forward to having you join our vibrant campus community.</p>
                    <p>Warm regards,</p>
                    <p><img src="https://marudhardentalclinic.com/wp-content/uploads/2024/08/20240811_173606-scaled.webp" alt="bihari logo" width="150" height="50" /><br /><em>9608888400</em></p>`
        });
        return res.status(201).json({ message: "Admission Success" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const createNewStudent = async (req, res) => {
    const {
        sid, name, email, mobile, father, guardian, gender, admissionDate, shift, time, paymentAmount, address, image, lastPayment, seatNumber, seatShift
    } = req.body;
    console.log(seatNumber)
    try {
        let imageFilename = null;
        let password;

        const student = await Student.findOne({ sid });
        const studentEmail = await Student.findOne({ email });
        // const seat = await Seat.findOne({ seatNumber });

        // Handle new student Sid Generation 
        const lastStudent = await Student.findOne().sort({ sid: -1 });
        const newSid = lastStudent ? lastStudent.sid + 1 : 327;

        if (student || studentEmail) {
            return res.status(400).json({ message: 'Student already exists' });
        }
        if (image && typeof image === 'string') {
            const base64String = image.split(",")[1];
            if (base64String) {
                const imageBuffer = Buffer.from(base64String, 'base64');
                imageFilename = `${newSid}.jpeg`;
                const uploadsDir = path.join(__dirname, '../uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir);
                }
                try {
                    const compressedBuffer = await sharp(imageBuffer)
                        .jpeg({ quality: 80 })
                        .toBuffer();
                    fs.writeFileSync(path.join(uploadsDir, imageFilename), compressedBuffer);
                } catch (err) {
                    console.error('Error compressing the image:', err);
                    return res.status(500).json({ message: 'Error processing image' });
                }
            } else {
                console.error("Invalid image format: base64 string is missing.");
                return res.status(400).json({ message: 'Invalid image format' });
            }
        } else {
            console.error("Invalid image: image is either undefined or not a string.");
            return res.status(400).json({ message: 'Invalid image' });
        }


        if (seatNumber !== 'Other') {
            const seat = await Seat.findOne({ seatNumber });
            updateSeatAvailability(seat, seatShift);
            await seat.save();
        }

        password = name.slice(0, 4).toUpperCase() + mobile.toString().slice(-4);
        const hashedPassword = await bcrypt.hash(password, 12);

        await Student.create({
            sid: newSid, name, email, seatNumber, password: hashedPassword, mobile, father, guardian,
            gender, admissionDate, shift, time, paymentAmount, address,
            image: imageFilename, lastPayment
        });
        sendMail({
            to: email,
            subject: "Welcome to Bihari Library - Admission Confirmation",
            body: `
                    <p>Dear ${name},</p>
                    <p>We are thrilled to welcome you to Bihari Library. Congratulations on your admission. Below are the details of your enrollment:</p>
                    <p><strong>Student Information:</strong></p>
                    <ul>
                        <li><strong>Student ID:</strong> ${newSid}</li>
                        <li><strong>Name:</strong> ${name}</li>
                        <li><strong>Shift:</strong> ${shift}</li>
                        <li><strong>Admission Date:</strong> ${admissionDate}</li>
                        <li><strong>Father's Name:</strong> ${father}</li>
                        <li><strong>Address:</strong> ${address}</li>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Password:</strong> ${password}</li>
                    </ul>
                    <p>To complete your admission, please proceed with the payment of the required fee. Detailed payment instructions and deadlines will be sent to you soon.</p>
                    <p>You can access your student dashboard and manage your account by clicking the link below: <a href="https://biharilibrary.in/student-dashboard" target="_new" rel="noreferrer">Student Dashboard</a></p>
                    <p>or&nbsp;</p>
                    <p>Copy the link Given Below and paste it into any Browser</p>
                    <p>https://biharilibrary.in/student-dashboard</p>
                    <p>Should you have any questions or need further assistance, feel free to reach out to us at <strong>Bihari Library</strong>. We are here to support you every step of the way.</p>
                    <p>Once again, congratulations on your admission! We look forward to having you join our vibrant campus community.</p>
                    <p>Warm regards,</p>
                    <p><img src="https://marudhardentalclinic.com/wp-content/uploads/2024/08/20240811_173606-scaled.webp" alt="bihari logo" width="150" height="50" /><br /><em>9608888400</em></p>`
        });
        return res.status(201).json({ message: "Admission Success" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error, message: 'Internal Server Error' });
    }
}

const updateSeatAvailability = (seat, seatShift) => {
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
    shifts[seatShift].forEach(shift => seat.availability[shift] = false);
};

export const GetAllStudent = async (req, res) => {
    const { sid, name, status, seatNumber } = req.query;
    // Construct a dynamic query object
    let query = { status: { $ne: 'Trash' } }; // Exclude students with status 'Trash'

    if (sid) query.sid = sid;
    if (name) query.name = name;
    if (status) query.status = status;
    if (seatNumber) query.seatNumber = seatNumber;
    try {
        // Use the constructed query object to filter data
        const students = await Student.find(query);
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};
export const trash = async (req, res) => {
    try {
        const students = await Student.find({ status: "Trash" })
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
}
export const GetStudent = async (req, res) => {
    const { _id } = req.query;

    try {
        // Use the constructed query object to filter data
        const students = await Student.findOne({ _id });
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};

// Login Student 
export const StudentLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Student.findOne({ email });

        if (user && user.password === password) {
            user.isOnline = true;
            await user.save();
            res.status(200).json(user);
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
// LogOut Student 
export const StudentLogOut = async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await Student.findById(userId);
        if (user) {
            user.isOnline = false;
            await user.save();
            res.status(200).json({ message: 'User logged out' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
// Get online users
export const GetOnlineStudent = async (req, res) => {
    try {
        const onlineUsers = await Student.find({ isOnline: true });
        res.status(200).json(onlineUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Student Detail
export const updateStudent = async (req, res) => {
    const {
        sid,
        name,
        email,
        mobile,
        father,
        guardian,
        gender,
        admissionDate,
        shift,
        time,
        paymentAmount,
        address,
        image,
        seatNumber,
        instagram,
        facebook,
        youtube,
        nextPayment,
        status
        // admin
    } = req.body;
    console.log(image)
    try {
        let imageFilename;

        if (image && image.startsWith('data:image')) {
            // If the image is a base64 string
            const base64Image = image.split(",")[1];
            if (!base64Image) {
                throw new Error('Invalid image format');
            }

            const imageBuffer = Buffer.from(base64Image, 'base64');
            // Generate a unique filename for the image
            imageFilename = `${sid}.jpeg`;

            // Write the image to a file
            fs.writeFileSync(path.join('./uploads', imageFilename), imageBuffer);
        } else {
            // If the image is not provided, use the existing image filename
            imageFilename = `${sid}.jpeg`;
        }
        // Assuming 'sid' or 'email' can uniquely identify a student
        const student = await Student.findOne({ $or: [{ sid }, { email }] });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        // Write the image to a file
        // fs.writeFileSync(path.join('./uploads', imageFilename), imageBuffer);
        // Update student details
        student.sid = sid;
        student.name = name;
        student.email = email;
        student.mobile = mobile;
        student.father = father;
        student.guardian = guardian;
        student.gender = gender;
        student.admissionDate = admissionDate;
        student.shift = shift;
        student.address = address;
        student.instagram = instagram;
        student.facebook = facebook;
        student.youtube = youtube;
        student.paymentAmount = paymentAmount;
        student.image = imageFilename;
        student.seatNumber = seatNumber;
        student.time = time;
        student.nextPayment = nextPayment;
        student.status = status
        // student.admin = admin;

        await student.save();

        res.status(200).json({ message: "Student details updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while updating the student details", error: error.message });
    }
};


export const bulkStudentAdmission = async (req, res) => {
    const studentsData = req.body.students; // Expecting an array of student data

    if (!Array.isArray(studentsData) || studentsData.length === 0) {
        return res.status(400).json({ message: "Invalid input data. Please provide an array of student data." });
    }

    try {
        const savedStudents = [];
        let password;

        for (const studentData of studentsData) {
            const {
                sid,
                name,
                email,
                mobile,
                father,
                guardian,
                gender,
                admissionDate,
                shift,
                time,
                paymentAmount,
                address,
                image,
                lastPayment,
                seatNumber,
                seatShift
            } = studentData;

            // Generate password using the first four letters of the name in uppercase and the last four digits of the mobile number
            password = name.slice(0, 4).toUpperCase() + mobile.toString().slice(-4);
            const hashedPassword = await bcrypt.hash(password, 12);


            const newStudent = new Student({
                sid,
                name,
                email,
                mobile,
                father,
                guardian,
                gender,
                admissionDate,
                shift,
                time,
                paymentAmount,
                address,
                image,
                lastPayment,
                seatNumber,
                seatShift,
                password: hashedPassword
            });

            const savedStudent = await newStudent.save();
            savedStudents.push(savedStudent);
        }

        res.status(201).json({ message: "Students admitted successfully", students: savedStudents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while admitting the students", error: error.message });
    }
};


// Get Student Record of Admission Month for making chart

export const getAdmissionMonth = async (req, res) => {
    try {
        const students = await Student.find({}, 'admissionDate');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}
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

export const trashStudent = async (req, res) => {
    try {
        const { studentId } = req.query;

        // Find the student by ID
        const student = await Student.findOne({ _id: studentId });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Retrieve the seat number and shift from the student profile
        const { seatNumber, time } = student;

        // Map the shift time to the appropriate shift label
        const shiftLabel = getShiftLabel(time);

        // Find the seat by seat number
        const seat = await Seat.findOne({ seatNumber });

        if (seat) {
            // Update the seat availability based on the student's shift
            deleteSeatAvailability(seat, shiftLabel);
            await seat.save();
        }
        student.status = "Trash"
        // Delete the student profile
        await student.save();

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteSeatAvailability = (seat, shiftLabel) => {
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


export const tempApiForPayment = async (req, res) => {
  try {
    // Find all active students
    const activeStudents = await Student.find({ status: "Active" });

    if (activeStudents.length === 0) {
      return res.status(404).json({ message: "No active students found." });
    }

    // Update each student's paymentDue to 0
    const updateResults = await Promise.all(
      activeStudents.map(student =>
        Student.findByIdAndUpdate(student._id, { paymentDue: 0 }, { new: true })
      )
    );

    res.status(200).json({
      message: `${updateResults.length} students updated successfully.`,
      updatedStudents: updateResults,
    });
  } catch (error) {
    console.error("Error updating paymentDue:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

