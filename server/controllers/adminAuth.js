import Admin from "../models/adminModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { sendMail } from "../utils/mailer.js";


export const SignUp = async (req, res) => {
    const { email, password } = req.body

    try {
        const existingUser = await Admin.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' })
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        const createAdmin = await Admin.create({ email, password: hashedPassword })

        sendMail({
            to: email,
            subject: "Account Created",
            body: "Your account has been created successfully."
        });
        return res.status(201).json({ admin: createAdmin, message: "Admin created" });


    } catch (error) {
        console.log(error)
    }
}

export const CheckAdmin = async (req, res) => {
    try {
        const { email } = req.body
        const existingUser = await Admin.findOne({ email })
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.json({ message: "User already exists" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'An error occurred' })
    }
}

export const SignIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ email: admin.email, id: admin._id }, 'test', { expiresIn: "1h" }); // replace 'test' with your secret key

        return res.status(200).json({ result: admin, token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}


// Send Otp Controller



export const sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = Date.now() + 1000 * 60 * 15; // OTP expires after 15 minutes

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        admin.otp = otp;
        admin.otpexpiry = otpExpiry;
        await admin.save();

        // TODO: Send OTP to admin's email
        sendMail({
            to: email,
            subject: "Password Reset",
            body: `Your OTP is ${otp}`
        });

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
}
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (admin.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (Date.now() > admin.otpexpiry) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // TODO: Handle successful OTP verification

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
}