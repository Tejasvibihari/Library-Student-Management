import express from 'express';
import Student from '../models/studentModel.js'
import Mail from '../models/mailModel.js';

// GET email details by adminId
export const GetMail = async (req, res) => {
    const { adminId } = req.query;

    try {
        // Assuming there's a field in your Email model that references the admin's ID
        const emailDetails = await Mail.find({ admin: adminId });

        if (!emailDetails) {
            return res.status(404).json({ message: 'Email details not found' });
        }

        res.json(emailDetails);
    } catch (error) {
        console.error('Error fetching email details:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getStudentEmail = async (req, res) => {
    const { admin } = req.query.adminId; // Extract adminId from query parameters

    try {
        // Find all students by adminId
        const students = await Student.find({ adminId: admin });
        if (!students || students.length === 0) {
            // If no students are found, send a 404 response
            return res.status(404).json({ message: 'No students found' });
        }

        // Map over the students to extract emails
        const studentEmails = students.map(student => student.email);


        // Respond with the students' emails
        res.json({ studentEmails });
    } catch (error) {
        // Log and respond with server error
        console.error('Error fetching student emails:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const sendEmail = async (req, res) => {
    const { to, subject, body, admin } = req.body;

    try {
        // Find students to get their names and emails
        const students = await Student.find({ admin: admin });
        if (students.length === 0) {
            return res.status(404).json({ message: 'Students not found' });
        }

        let recipients;
        if (to === 'All') {
            // If 'to' is 'All', use all student emails
            recipients = students.map(student => student.email);
        } else {
            // Otherwise, split 'to' into individual emails
            recipients = to.split(',').map(email => email.trim());
        }

        // Create a Mail document for each recipient
        const mailPromises = recipients.map(async (recipient) => {
            // Find the student corresponding to the recipient email
            const student = students.find(s => s.email === recipient);

            if (!student) {
                console.log(`No student found for email: ${recipient}`);
                return null; // Skip creating a Mail document if no student is found
            }

            const newMail = new Mail({
                to: recipient,
                subject,
                body,
                admin,
                name: student.name, // Use the found student's name
                image: student.image // Use the found student's name
            });

            // Save the Mail document
            await newMail.save();
            return newMail; // Return the saved document
        });

        // Filter out null values and wait for all Mail documents to be saved
        const savedMails = await Promise.all(mailPromises.filter(Boolean));

        res.status(201).json({ message: 'Email sent successfully', mails: savedMails });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};