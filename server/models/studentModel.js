import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    sid: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    aadhar: { type: String, required: true },
    father: { type: String, required: true },
    guardian: { type: String },
    gender: { type: String, required: true },
    preparingFor: { type: String },
    dob: { type: Date, required: true },
    admissionDate: { type: Date, required: true },
    shift: { type: String, required: true },
    time: { type: String, required: true },
    seatNumber: { type: String, required: true },
    address: { type: String, required: true },
    instagram: { type: String },
    facebook: { type: String },
    youtube: { type: String },
    status: { type: String, default: "Pending" },
    // Payment Model
    paymentAmount: { type: Number },
    nextPayment: { type: Date },
    lastPayment: { type: Date },

    image: { type: String }, // Assuming image is stored as a URL or base64 string
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    },
    isOnline: { type: Boolean, default: false },
    // Assuming paymentDate is the same as lastPayment, if not, add it as well

});

const Student = mongoose.model('Student', StudentSchema);

export default Student;