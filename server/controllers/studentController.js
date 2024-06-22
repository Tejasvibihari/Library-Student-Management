import Student from '../models/studentModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { sendMail } from '../utils/mailer.js';
import fs from 'fs';
import path from 'path';

export const createStudent = async (req, res) => {
    const { name, dob, email, mobile, aadhar, father, guardian, gender, preparingFor, admissionDate, shiftFrom, shiftTo, pincode, village, block, district, image, admin } = req.body;

    try {
        const imageBuffer = Buffer.from(image.split(",")[1], 'base64');

        const password = (name.slice(0, 4)).toUpperCase() + (aadhar.toString().slice(-4))

        const existingStudent = await Student.findOne({ email })
        if (existingStudent) {
            return res.status(400).json({ message: 'Student already exists', studentId: existingStudent.sid })
        }
        const hashedPassword = await bcrypt.hash(password, 12)

        //  Generate Sid by first finding the last sid in data base and increment by one and add to sid
        const lastStudent = await Student.find().sort({ sid: -1 }).limit(1)
        let newSid = 0
        if (lastStudent.length === 0) {
            newSid = 1001
        } else {
            newSid = lastStudent[0].sid + 1
        }
        // Generate a unique filename for the image
        const imageFilename = `${newSid}.jpeg`;
        // Write the image to a file
        fs.writeFileSync(path.join('./uploads', imageFilename), imageBuffer);

        const createStudent = await Student.create({
            sid: newSid, name, dob, email, password: hashedPassword, mobile, aadhar, father, guardian,
            gender, preparingFor, admissionDate, shiftFrom, shiftTo, pincode, village, block, district,
            image: imageFilename, admin
        })
        sendMail({
            to: email,
            subject: "Addmission Success",
            body: `Your account has been created successfully.<br/>
             Your ID is ${newSid} <br/>Your password is ${password}`
        })
        return res.status(201).json({ message: "Addmission Success" });

    } catch (error) {
        console.log(error)
    }
}

// Update Student Detail

export const updateStudent = async (req, res) => {
    const { sid } = req.params;
    const { name, dob, email, mobile, aadhar, father, guardian, gender, preparingFor, admissionDate, shift, pincode, village, block, district, image, admin } = req.body;
    try {
        const student = await Student.findById(sid);
        if (!student) {
            return res.status(404).json({ message: "No student found with this ID" });
        }

        student.name = name;
        student.dob = dob;
        student.email = email;
        student.mobile = mobile;
        student.aadhar = aadhar;
        student.father = father;
        student.guardian = guardian;
        student.gender = gender;
        student.preparingFor = preparingFor;
        student.admissionDate = admissionDate;
        student.shift = shift;
        student.pincode = pincode;
        student.village = village;
        student.block = block;
        student.district = district;
        student.image = image;
        student.admin = admin;

        await student.save();

        return res.status(200).json({ message: "Student details updated successfully" });

    } catch (error) {
        console.log(error)
    }
}