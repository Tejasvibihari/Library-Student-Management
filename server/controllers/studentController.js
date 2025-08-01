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
            image: imageFilename, lastPayment, paymentDue: paymentAmount, status: "Pending"
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

    try {
        let imageFilename = null;
        let password;

        // Check if student already exists
        const student = await Student.findOne({ sid });
        const studentEmail = await Student.findOne({ email });

        // Handle new student Sid Generation with simple retry
        let newSid;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            const lastStudent = await Student.findOne().sort({ sid: -1 });
            newSid = lastStudent ? lastStudent.sid + 1 : 327;

            // Check if this SID already exists
            const existingSid = await Student.findOne({ sid: newSid });
            if (!existingSid) {
                break; // SID is unique, we can use it
            }
            attempts++;
            if (attempts >= maxAttempts) {
                return res.status(500).json({ message: 'Unable to generate unique student ID' });
            }
        }

        if (student || studentEmail) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        // Handle image processing
        if (image && typeof image === 'string') {
            const base64String = image.split(",")[1];
            if (base64String) {
                const imageBuffer = Buffer.from(base64String, 'base64');
                imageFilename = `${newSid}.jpeg`;
                const uploadsDir = path.join(__dirname, '../uploads');

                // Create uploads directory if it doesn't exist
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
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

        // Handle seat availability
        if (seatNumber && seatNumber !== 'Other') {
            try {
                const seat = await Seat.findOne({ seatNumber });
                if (seat) {
                    updateSeatAvailability(seat, seatShift);
                    await seat.save();
                }
            } catch (seatError) {
                console.error('Seat update error:', seatError);
                // Continue with student creation even if seat update fails
            }
        }

        // Generate password
        password = name.slice(0, 4).toUpperCase() + mobile.toString().slice(-4);
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create student with all required fields
        await Student.create({
            sid: newSid,
            name,
            email,
            seatNumber: seatNumber || 'Other', // Provide default value
            password: hashedPassword,
            mobile,
            father,
            guardian: guardian || '', // Provide default value
            gender,
            admissionDate,
            shift,
            time: time || '', // Provide default value
            paymentAmount,
            address,
            image: imageFilename,
            lastPayment,
            paymentDue: -Math.abs(paymentAmount),
            status: "Pending"
        });

        // Send email (with error handling)
        try {
            await sendMail({
                to: email,
                subject: "Welcome to Bihari Library - Admission Confirmation",
                body: `
                    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Bihari Library</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .header {
            background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }

        .header-content {
            position: relative;
            z-index: 1;
        }

        .congratulations-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 15px;
            backdrop-filter: blur(10px);
        }

        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 18px;
            opacity: 0.9;
        }

        .content {
            padding: 40px 30px;
        }

        .welcome-message {
            text-align: center;
            margin-bottom: 35px;
        }

        .welcome-message h2 {
            color: #8B5CF6;
            font-size: 24px;
            margin-bottom: 15px;
        }

        .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 15px;
            padding: 30px;
            margin: 25px 0;
            border-left: 5px solid #8B5CF6;
        }

        .info-title {
            color: #8B5CF6;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }

        .info-title::before {
            content: '👤';
            margin-right: 10px;
            font-size: 24px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }

        .info-item {
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(139, 92, 246, 0.1);
        }

        .info-label {
            font-weight: 600;
            color: #64748b;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }

        .info-value {
            color: #1e293b;
            font-size: 16px;
            font-weight: 500;
        }

        .action-section {
            background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin: 30px 0;
        }

        .action-section h3 {
            font-size: 20px;
            margin-bottom: 15px;
        }

        .dashboard-button {
            display: inline-block;
            background: white;
            color: #8B5CF6;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            margin: 15px 0;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .dashboard-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }

        .url-box {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            font-family: monospace;
            font-size: 14px;
            word-break: break-all;
        }

        .payment-notice {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }

        .payment-notice h4 {
            color: #92400e;
            margin-bottom: 10px;
        }

        .footer {
            background: #1e293b;
            color: white;
            padding: 30px;
            text-align: center;
        }

        .logo-container {
            margin-bottom: 20px;
        }

        .logo {
            background: white;
            padding: 10px;
            border-radius: 10px;
            display: inline-block;
        }

        .contact-info {
            font-size: 18px;
            font-weight: 600;
            color: #8B5CF6;
            margin-top: 15px;
        }

        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #8B5CF6, transparent);
            margin: 30px 0;
            border-radius: 1px;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 0 10px;
                border-radius: 15px;
            }

            .header {
                padding: 30px 20px;
            }

            .header h1 {
                font-size: 28px;
            }

            .content {
                padding: 30px 20px;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }

            .action-section {
                padding: 25px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-content">
                <div class="congratulations-badge">🎉 ADMISSION CONFIRMED</div>
                <h1>Welcome to Bihari Library!</h1>
                <p>Your journey to excellence begins here</p>
            </div>
        </div>

        <div class="content">
            <div class="welcome-message">
                <h2>Dear ${name},</h2>
                <p>We are absolutely thrilled to welcome you to our academic community. Congratulations on your successful admission to Bihari Library!</p>
            </div>
            
            <div class="info-card">
                <div class="info-title">Student Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Student ID</div>
                        <div class="info-value">${newSid}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Full Name</div>
                        <div class="info-value">${name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Study Shift</div>
                        <div class="info-value">${shift}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Admission Date</div>
                        <div class="info-value">${admissionDate}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Father's Name</div>
                        <div class="info-value">${father}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Address</div>
                        <div class="info-value">${address}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Temporary Password</div>
                        <div class="info-value">${password}</div>
                    </div>
                </div>
            </div>
            
            <div class="payment-notice">
                <h4>⚠️ Payment Required</h4>
                <p>To complete your admission process, please proceed with the fee payment. Detailed payment instructions and deadlines will be sent to you shortly.</p>
            </div>
            
            <div class="action-section">
                <h3>🚀 Access Your Student Dashboard</h3>
                <p>Manage your account, track your progress, and stay updated with all academic activities.</p>
                
                <a href="https://biharilibrary.in/student-dashboard" class="dashboard-button" target="_blank" rel="noreferrer">
                    Open Dashboard
                </a>
                
                <p style="margin: 15px 0; font-size: 14px; opacity: 0.9;">
                    Or copy and paste this link into your browser:
                </p>
                <div class="url-box">
                    https://biharilibrary.in/student-dashboard
                </div>
            </div>
            
            <div class="divider"></div>
            
            <p style="text-align: center; color: #64748b; line-height: 1.8;">
                Should you have any questions or need assistance, please don't hesitate to reach out to us. We're here to support you every step of the way on your educational journey.
            </p>
            
            <p style="text-align: center; margin-top: 30px; font-size: 18px; color: #8B5CF6; font-weight: 600;">
                Once again, congratulations! We look forward to having you as part of our vibrant academic community.
            </p>
        </div>
        
        <div class="footer">
            <div class="logo-container">
                <div class="logo">
                    <img src="https://biharilibrary.in/img/biharilogo.png" alt="Bihari Library Logo" width="150" height="50" style="display: block;" />
                </div>
            </div>
            
            <p style="margin: 15px 0;">
                <strong>Bihari Library</strong><br>
                Your Partner in Educational Excellence
            </p>
            
            <div class="contact-info">
                📞 9608888400
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>`
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the request if email fails
        }

        return res.status(201).json({ message: "Admission Success" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error, message: 'Internal Server Error' });
    }
}
const updateSeatAvailability = (seat, seatShift) => {
    console.log(seat, seatShift, "updateSeatAvailability called");
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
export const GetStudentBySid = async (req, res) => {
    const { sid } = req.params;

    try {
        // Use the constructed query object to filter data
        const student = await Student.findOne({ sid });
        res.status(200).json(student);
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
        password,
        mobile,
        father,
        guardian,
        gender,
        admissionDate,
        shift,
        time,
        seatNumber,
        address,
        instagram,
        facebook,
        youtube,
        status,
        paymentAmount,
        nextPayment,
        lastPayment,
        paymentDue,
        extraPaymentDue,
        image,
        isOnline
    } = req.body;

    try {
        if (!sid) {
            return res.status(400).json({ message: "SID is required for updating the student" });
        }

        let imageFilename;

        /** ----- IMAGE HANDLING ----- */
        if (image) {
            if (image.startsWith('data:image')) {
                // Handle base64 image
                try {
                    const base64Image = image.split(",")[1];
                    if (!base64Image) {
                        return res.status(400).json({ message: "Invalid image format" });
                    }

                    const imageBuffer = Buffer.from(base64Image, 'base64');
                    imageFilename = `${sid}.jpeg`;

                    fs.writeFileSync(path.join('./uploads', imageFilename), imageBuffer);
                } catch (err) {
                    return res.status(400).json({ message: "Failed to process image", error: err.message });
                }
            } else {
                // If it's an existing filename or URL
                imageFilename = image;
            }
        }

        /** ----- UPDATE LOGIC ----- */
        const updatedStudent = await Student.findOneAndUpdate(
            { $or: [{ sid }, { email }] }, // find by sid or email
            {
                $set: {
                    sid,
                    name,
                    email,
                    ...(password && { password }), // only update if provided
                    mobile,
                    father,
                    guardian,
                    gender,
                    admissionDate,
                    shift,
                    time,
                    seatNumber,
                    address,
                    instagram,
                    facebook,
                    youtube,
                    status,
                    paymentAmount,
                    nextPayment,
                    lastPayment,
                    paymentDue,
                    extraPaymentDue,
                    ...(imageFilename && { image: imageFilename }),
                    ...(typeof isOnline === 'boolean' && { isOnline })
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found with the given SID or email" });
        }

        return res.status(200).json({ message: "Student details updated successfully", student: updatedStudent });
    } catch (error) {
        console.error("Update Student Error:", error);

        // Mongoose validation errors
        if (error.name === "ValidationError") {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation failed", errors: validationErrors });
        }

        // Duplicate key errors (like unique email)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ message: `Duplicate value for field: ${field}` });
        }

        return res.status(500).json({ message: "An error occurred while updating the student details", error: error.message });
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

