import Student from '../models/studentModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { sendMail } from '../utils/mailer.js';
import fs from 'fs';
import path from 'path';
import Payment from '../models/paymentModel.js';
import Seat from '../models/seatModel.js';


export const createStudent = async (req, res) => {
    const {
        sid,
        name,
        email,
        mobile,
        aadhar,
        father,
        guardian,
        gender,
        preparingFor,
        dob,
        admissionDate,
        shift,
        time,
        paymentAmount,
        address,
        image,
        admin,
        lastPayment,
        seatNumber,
        seatShift
    } = req.body;

    try {
        let imageFilename = null;
        let password;

        const student = await Student.findOne({ sid });
        const studentEmail = await Student.findOne({ email });
        const seat = await Seat.findOne({ seatNumber });


        if (student || studentEmail) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        if (sid >= 1 && sid <= 321) {
            if (seat.availability[seatShift]) {
                if (image && typeof image === 'string') {
                    const base64String = image.split(",")[1];
                    if (base64String) {
                        const imageBuffer = Buffer.from(base64String, 'base64');
                        imageFilename = `${sid}.jpeg`;
                        fs.writeFileSync(path.join('./uploads', imageFilename), imageBuffer);

                        seat.availability[seatShift] = false;
                        await seat.save();

                        password = (name.slice(0, 4)).toUpperCase() + (aadhar.toString().slice(-4));
                        const hashedPassword = await bcrypt.hash(password, 12);

                        await Student.create({
                            sid, name, dob, email, seatNumber, password: hashedPassword, mobile, aadhar, father, guardian,
                            gender, preparingFor, admissionDate, shift, time, paymentAmount, address,
                            image: imageFilename, admin, lastPayment
                        });

                        sendMail({
                            to: email,
                            subject: "Welcome to Bihari Library - Admission Confirmation",
                            body: `<hr />
<p>Dear ${name},</p>
<p>We are thrilled to welcome you to Bihari Library Congratulations on your admission. Below are the details of your enrollment:</p>
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
<p>You can access your student dashboard and manage your account by clicking the link below: <a href="https://biharilibrary.vercel.app/student-dashboard" target="_new" rel="noreferrer">Student Dashboard</a></p>
<p>or&nbsp;</p>
<p>Copy the link Given Below and paste it into any Browser</p>
<p>https://biharilibrary.vercel.app/student-dashboard</p>
<p>Should you have any questions or need further assistance, feel free to reach out to us at <strong>Bihari Library</strong>. We are here to support you every step of the way.</p>
<p>Once again, congratulations on your admission! We look forward to having you join our vibrant campus community.</p>
<p>Warm regards,</p>
<p><strong>Bihari Library</strong><br /><em>9608888400</em></p>`
                        });

                        return res.status(201).json({ message: "Admission Success" });
                    } else {
                        console.error("Invalid image format: base64 string is missing.");
                    }
                } else {
                    console.error("Invalid image: image is either undefined or not a string.");
                }
            } else {
                res.status(400).json({ message: 'Seat not available' });
            }
        } else {
            if (seat.availability[seatShift]) {
                if (image && typeof image === 'string') {
                    const base64String = image.split(",")[1];
                    if (base64String) {
                        const imageBuffer = Buffer.from(base64String, 'base64');
                        const lastStudent = await Student.findOne().sort({ sid: -1 });
                        const newSid = lastStudent ? lastStudent.sid + 1 : 322;

                        imageFilename = `${newSid}.jpeg`;
                        fs.writeFileSync(path.join('./uploads', imageFilename), imageBuffer);
                        seat.availability[seatShift] = false;
                        await seat.save();

                        password = (name.slice(0, 4)).toUpperCase() + (aadhar.toString().slice(-4));
                        const hashedPassword = await bcrypt.hash(password, 12);

                        await Student.create({
                            sid: newSid, name, dob, email, seatNumber, password: hashedPassword, mobile, aadhar, father, guardian,
                            gender, preparingFor, admissionDate, shift, time, paymentAmount, address,
                            image: imageFilename, admin, lastPayment
                        });

                        sendMail({
                            to: email,
                            subject: "Welcome to Bihari Library - Admission Confirmation",
                            body: `<hr />
<p>Dear ${name},</p>
<p>We are thrilled to welcome you to Bihari Library Congratulations on your admission. Below are the details of your enrollment:</p>
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
<p>You can access your student dashboard and manage your account by clicking the link below: <a href="https://biharilibrary.vercel.app/student-dashboard" target="_new" rel="noreferrer">Student Dashboard</a></p>
<p>or&nbsp;</p>
<p>Copy the link Given Below and paste it into any Browser</p>
<p>https://biharilibrary.vercel.app/student-dashboard</p>
<p>Should you have any questions or need further assistance, feel free to reach out to us at <strong>Bihari Library</strong>. We are here to support you every step of the way.</p>
<p>Once again, congratulations on your admission! We look forward to having you join our vibrant campus community.</p>
<p>Warm regards,</p>
<p><strong>Bihari Library</strong><br /><em>9608888400</em></p>`
                        });

                        return res.status(201).json({ message: "Admission Success" });
                    } else {
                        console.error("Invalid image format: base64 string is missing.");
                    }
                } else {
                    console.error("Invalid image: image is either undefined or not a string.");
                }
            } else {
                res.status(400).json({ message: 'Seat not available' });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const GetAllStudent = async (req, res) => {
    const { sid, name, admin, status } = req.query;

    // Construct a dynamic query object
    let query = {};
    if (admin) query.admin = admin;
    if (sid) query.sid = sid;
    if (name) query.name = name;
    if (status) query.status = status;

    try {
        // Use the constructed query object to filter data
        const students = await Student.find(query);
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};
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
        aadhar,
        father,
        guardian,
        gender,
        preparingFor,
        dob,
        admissionDate,
        shiftFrom,
        shiftTo,
        pincode,
        village,
        block,
        district,
        instagram,
        facebook,
        youtube,
        status,
        lastPayment,
        paymentAmount,
        paymentMode,
        image,
        admin
    } = req.body;

    try {
        const imageBuffer = Buffer.from(image.split(",")[1], 'base64');

        // Assuming 'sid' or 'email' can uniquely identify a student
        const student = await Student.findOne({ $or: [{ sid }, { email }] });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        // Generate a unique filename for the image
        const imageFilename = `${sid}.jpeg`;
        // Write the image to a file
        fs.writeFileSync(path.join('./uploads', imageFilename), imageBuffer);
        // Update student details
        student.name = name;
        student.email = email;
        student.mobile = mobile;
        student.aadhar = aadhar;
        student.father = father;
        student.guardian = guardian;
        student.gender = gender;
        student.preparingFor = preparingFor;
        student.dob = dob;
        student.admissionDate = admissionDate;
        student.shiftFrom = shiftFrom;
        student.shiftTo = shiftTo;
        student.pincode = pincode;
        student.village = village;
        student.block = block;
        student.district = district;
        student.instagram = instagram;
        student.facebook = facebook;
        student.youtube = youtube;
        student.status = status;
        student.lastPayment = lastPayment;
        student.paymentAmount = paymentAmount;
        student.paymentMode = paymentMode;
        student.image = imageFilename;
        student.admin = admin;

        await student.save();

        res.status(200).json({ message: "Student details updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while updating the student details", error: error.message });
    }
};

