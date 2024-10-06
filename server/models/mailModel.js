import mongoose from 'mongoose';

const mailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Assuming you have an Admin model
        required: true // Set to true if every mail must be associated with an admin, otherwise remove this line
    }
}, { timestamps: true }); // Enable timestamps

const Mail = mongoose.model('Mail', mailSchema);

export default Mail;