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
// Define __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createStudent = async (req, res) => {
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

        if (sid >= 1 && sid <= 326) {
            if (seat.availability[seatShift]) {
                if (image && typeof image === 'string') {
                    const base64String = image.split(",")[1];
                    if (base64String) {
                        const imageBuffer = Buffer.from(base64String, 'base64');
                        imageFilename = `${sid}.jpeg`;
                        const uploadsDir = path.join(__dirname, '../uploads');
                        if (!fs.existsSync(uploadsDir)) {
                            fs.mkdirSync(uploadsDir);
                        }
                        sharp(imageBuffer)
                            .jpeg({ quality: 80 }) // Compress the image with 80% quality
                            .toBuffer()
                            .then(compressedBuffer => {
                                fs.writeFileSync(path.join(uploadsDir, imageFilename), compressedBuffer);
                                // Now you can send the compressed image to the database
                            })
                            .catch(err => {
                                console.error('Error compressing the image:', err);
                            });

                        if (seatShift === "fullDay") {
                            seat.availability.morning = false;
                            seat.availability.afternoon = false;
                            seat.availability.evening = false;
                            seat.availability.night = false;
                            seat.availability.doubleMorning = false;
                            seat.availability.doubleEvening = false;
                            seat.availability.nightLong = false;
                            seat.availability.fullDay = false;
                            seat.availability.morningLong = false;
                        } else if (seatShift === "morning") {
                            seat.availability.morning = false;
                        } else if (seatShift === "afternoon") {
                            seat.availability.afternoon = false;
                        } else if (seatShift === "evening") {
                            seat.availability.evening = false;
                        } else if (seatShift === "night") {
                            seat.availability.night = false;
                        } else if (seatShift === "doubleMorning") {
                            seat.availability.morning = false;
                            seat.availability.afternoon = false;
                            seat.availability.doubleMorning = false;
                        } else if (seatShift === "doubleEvening") {
                            seat.availability.afternoon = false;
                            seat.availability.evening = false;
                            seat.availability.doubleEvening = false;
                        } else if (seatShift === "morningLong") {
                            seat.availability.morning = false;
                            seat.availability.afternoon = false;
                            seat.availability.evening = false;
                            seat.availability.morningLong = false;
                        } else if (seatShift === "nightLong") {
                            seat.availability.night = false;
                            seat.availability.nightLong = false;
                        } else {
                            seat.availability[seatShift] = false;
                        }


                        password = name.slice(0, 4).toUpperCase() + mobile.toString().slice(-4);
                        const hashedPassword = await bcrypt.hash(password, 12);

                        await Student.create({
                            sid, name, email, seatNumber, password: hashedPassword, mobile, father, guardian,
                            gender, admissionDate, shift, time, paymentAmount, address,
                            image: imageFilename, lastPayment
                        });
                        await seat.save();

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
                        // const uploadsDir = path.join(__dirname, 'uploads');
                        const uploadsDir = path.join(__dirname, '../uploads');
                        if (!fs.existsSync(uploadsDir)) {
                            fs.mkdirSync(uploadsDir);
                        }
                        sharp(imageBuffer)
                            .jpeg({ quality: 80 }) // Compress the image with 80% quality
                            .toBuffer()
                            .then(compressedBuffer => {
                                fs.writeFileSync(path.join(uploadsDir, imageFilename), compressedBuffer);
                                // Now you can send the compressed image to the database
                            })
                            .catch(err => {
                                console.error('Error compressing the image:', err);
                            });
                        // fs.writeFileSync(path.join('./uploads', imageFilename), imageBuffer);
                        if (seatShift === "fullDay") {
                            seat.availability.morning = false;
                            seat.availability.afternoon = false;
                            seat.availability.evening = false;
                            seat.availability.night = false;
                            seat.availability.doubleMorning = false;
                            seat.availability.doubleEvening = false;
                            seat.availability.nightLong = false;
                            seat.availability.fullDay = false;
                            seat.availability.morningLong = false;
                        } else if (seatShift === "morning") {
                            seat.availability.morning = false;
                        } else if (seatShift === "afternoon") {
                            seat.availability.afternoon = false;
                        } else if (seatShift === "evening") {
                            seat.availability.evening = false;
                        } else if (seatShift === "night") {
                            seat.availability.night = false;
                        } else if (seatShift === "doubleMorning") {
                            seat.availability.morning = false;
                            seat.availability.afternoon = false;
                            seat.availability.doubleMorning = false;
                        } else if (seatShift === "doubleEvening") {
                            seat.availability.afternoon = false;
                            seat.availability.evening = false;
                            seat.availability.doubleEvening = false;
                        } else if (seatShift === "morningLong") {
                            seat.availability.morning = false;
                            seat.availability.afternoon = false;
                            seat.availability.evening = false;
                            seat.availability.morningLong = false;
                        } else if (seatShift === "nightLong") {
                            seat.availability.night = false;
                            seat.availability.nightLong = false;
                        } else {
                            seat.availability[seatShift] = false;
                        }


                        password = name.slice(0, 4).toUpperCase() + mobile.toString().slice(-4);
                        const hashedPassword = await bcrypt.hash(password, 12);

                        await Student.create({
                            sid: newSid, name, email, seatNumber, password: hashedPassword, mobile, father, guardian,
                            gender, admissionDate, shift, time, paymentAmount, address,
                            image: imageFilename, lastPayment
                        });
                        await seat.save();


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
    const { sid, name, status } = req.query;
    // Construct a dynamic query object
    let query = {};
    if (sid) query.sid = sid;
    if (name) query.name = name;
    if (status) {
        if (status === "Pending") {
            // query.status = status;
            query.nextPayment = { $lte: new Date() }; // Check if nextPayment is less than or equal to today
        } else if (status === "Active") {
            // query.status = status;
            query.nextPayment = { $gt: new Date() }; // Check if nextPayment is greater than today
        } else {
            query.status = status;
        }
    }
    console.log(query)
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