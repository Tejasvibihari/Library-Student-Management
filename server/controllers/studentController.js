import Student from '../models/studentModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { sendMail } from '../utils/mailer.js';

export const createStudent = async (req, res) => {
    const { name, dob, email, mobile, aadhar, father, guardian, gender, preparingFor, admissionDate, shift, pincode, village, block, district, image, admin } = req.body;
    try {
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

        const createStudent = await Student.create({
            sid: newSid, name, dob, email, password: hashedPassword, mobile, aadhar, father, guardian,
            gender, preparingFor, admissionDate, shift, pincode, village, block, district,
            image, admin
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