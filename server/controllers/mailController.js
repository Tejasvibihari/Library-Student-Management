import express from 'express';

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

