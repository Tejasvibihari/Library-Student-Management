import Student from "../models/studentModel.js";
import bcrypt from "bcrypt";
// import jwt from 'jsonwebtoken';
// import { sendMail } from '../utils/mailer';

export const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingStudent = await Student.findOne({ email })

        if (!existingStudent) {
            return res.status(404).json({ message: 'Student does not exist' })
        }
        const isPasswordCorrect = await bcrypt.compare(password, existingStudent.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        return res.status(200).json({ message: 'Student signed in successfully', student: existingStudent })

    } catch (error) {
        console.log(error)
    }
}