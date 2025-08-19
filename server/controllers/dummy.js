
export const createNewStudent = async (req, res) => {
    const {
        name, email, mobile, father, guardian, gender, admissionDate,
         shift, time, paymentAmount, address, image, lastPayment,
          seatNumber, seatShift
    } = req.body;

    try {
        let imageFilename = null;
        let password;

        // FIRST: Check if student already exists with this email
        const existingStudentWithEmail = await Student.findOne({ email: email });

        if (existingStudentWithEmail) {
            return res.status(400).json({
                success: false,
                message: 'Student already exists with this email address'
            });
        }

        // SECOND: Generate new SID with retry mechanism
        let newSid;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            try {
                // Get the highest existing SID
                const lastStudent = await Student.findOne().sort({ sid: -1 });
                newSid = lastStudent ? lastStudent.sid + 1 : 327;

                // Check if this SID already exists
                const existingSid = await Student.findOne({ sid: newSid });

                if (!existingSid) {
                    // SID is unique, break out of loop
                    break;
                }

                // If SID exists, increment attempts and try again
                attempts++;
                console.log(`SID ${newSid} already exists, attempt ${attempts}/${maxAttempts}`);

            } catch (error) {
                console.error('Error generating SID:', error);
                attempts++;
            }
        }

        // Check if we failed to generate a unique SID
        if (attempts >= maxAttempts) {
            return res.status(500).json({ message: 'Unable to generate unique student ID after multiple attempts' });
        }

        console.log(`Generated new SID: ${newSid}`);

        // Handle image processing
        if (image && typeof image === 'string') {
            const base64String = image.split(",")[1];
            if (base64String) {
                const imageBuffer = Buffer.from(base64String, 'base64');
                imageFilename = `${newSid}.jpeg`;
                const uploadsDir = path.join(__dirname, '../uploads');
                const imageSizeInBytes = Buffer.byteLength(base64String, 'base64');

                // Convert to KB / MB
                const imageSizeInKB = imageSizeInBytes / 1024;
                const imageSizeInMB = imageSizeInKB / 1024;

                console.log(`📷 Uploaded image size: ${imageSizeInKB.toFixed(2)} KB (${imageSizeInMB.toFixed(2)} MB)`);

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
        const createdStudent = await Student.create({
            sid: newSid,
            name,
            email,
            seatNumber: seatNumber || 'Other',
            password: hashedPassword,
            mobile,
            father,
            guardian: guardian || '',
            gender,
            admissionDate,
            shift,
            time: time || '',
            paymentAmount,
            address,
            image: imageFilename,
            lastPayment,
            paymentDue: -Math.abs(paymentAmount),
            status: "Pending"
        });

        console.log(`✅ Student created successfully with SID: ${newSid}`);

        // Send email (with error handling)
        try {
            await sendMail({
                to: email,
                subject: "Welcome to Bihari Library - Admission Confirmation",
                body: `<!DOCTYPE html>
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
            console.log(`📧 Email sent to: ${email}`);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the request if email fails
        }

        return res.status(201).json({
            success: true,
            message: "Admission Success",
            studentId: newSid,
            student: {
                sid: newSid,
                name,
                email
            }
        });

    } catch (error) {
        console.error('❌ Error in createNewStudent:', error);

        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Student already exists with this information'
            });
        }

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
};