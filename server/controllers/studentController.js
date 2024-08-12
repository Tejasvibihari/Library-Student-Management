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

    console.log(`Received SID: ${sid}`);
    try {
        let imageFilename = null;
        let password;

        const student = await Student.findOne({ sid });
        const studentEmail = await Student.findOne({ email });
        const seat = await Seat.findOne({ seatNumber });

        console.log(`Student by SID: ${student}`);
        console.log(`Student by Email: ${studentEmail}`);

        if (student || studentEmail) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        if (sid >= 1 && sid <= 321) {
            if (seat && seat.availability[shift]) {
                if (image && typeof image === 'string') {
                    const base64String = image.split(",")[1];
                    if (base64String) {
                        const imageBuffer = Buffer.from(base64String, 'base64');
                        imageFilename = `${sid}.jpeg`;
                        fs.writeFileSync(path.join('./uploads', imageFilename), imageBuffer);

                        seat.availability[shift] = false;
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
                            body: `<p>Dear ${name},</p>
                            <p>Congratulations! We are pleased to inform you that you have been admitted to [School/College Name]. Please find your admission details below:</p>
                            <p><strong>Student ID:</strong> ${sid}</p>
                            <p><strong>Name:</strong> ${name}<br /><strong>Shift:</strong> ${shift}<br /><strong>Admission Date:</strong> ${admissionDate}<br /><strong>Father's Name:</strong> ${father}<br /><strong>Address:</strong> ${address} <br /><strong>Email:</strong> ${email}<br /><strong>Password:</strong> ${password}</p>
                            <p>Please ensure to complete the admission process by paying the required fee. The payment details and deadline will be shared with you shortly.</p>
                            <p>If you have any questions or need further assistance, do not hesitate to contact us at <strong>Bihari Library</strong>.</p>
                            <p>Once again, congratulations on your admission. We look forward to welcoming you to our campus.</p>
                            <p>Best regards,</p>
                            <p><strong><em>Bihari Library</em></strong></p>
                            <p><strong><em>9608888400, 9905424292</em></strong></p>`
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
            if (seat && seat.availability[shift]) {
                if (image && typeof image === 'string') {
                    const base64String = image.split(",")[1];
                    if (base64String) {
                        const imageBuffer = Buffer.from(base64String, 'base64');
                        const lastStudent = await Student.findOne().sort({ sid: -1 });
                        const newSid = lastStudent ? lastStudent.sid + 1 : 322;

                        imageFilename = `${newSid}.jpeg`;
                        fs.writeFileSync(path.join('./uploads', imageFilename), imageBuffer);
                        seat.availability[shift] = false;
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
                            body: `<p>Dear ${name},</p>
                            <p>Congratulations! We are pleased to inform you that you have been admitted to [School/College Name]. Please find your admission details below:</p>
                            <p><strong>Student ID:</strong> ${newSid}</p>
                            <p><strong>Name:</strong> ${name}<br /><strong>Shift:</strong> ${shift}<br /><strong>Admission Date:</strong> ${admissionDate}<br /><strong>Father's Name:</strong> ${father}<br /><strong>Address:</strong> ${address} <br /><strong>Email:</strong> ${email}<br /><strong>Password:</strong> ${password}</p>
                            <p>Please ensure to complete the admission process by paying the required fee. The payment details and deadline will be shared with you shortly.</p>
                            <p>If you have any questions or need further assistance, do not hesitate to contact us at <strong>Bihari Library</strong>.</p>
                            <p>Once again, congratulations on your admission. We look forward to welcoming you to our campus.</p>
                            <p>Best regards,</p>
                            <p><strong><em>Bihari Library</em></strong></p>
                            <p><strong><em>9608888400, 9905424292</em></strong></p>`
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

