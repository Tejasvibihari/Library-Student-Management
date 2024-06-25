import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    sid: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    aadhar: {
        type: Number,
        required: true
    },
    father: {
        type: String,
        required: true
    },
    guardian: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    preparingFor: {
        type: String,
        required: true
    },
    admissionDate: {
        type: Date,
        required: true
    },
    shiftFrom: {
        type: String,
        required: true
    },
    shiftTo: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    village: {
        type: String,
        required: true
    },
    block: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    image: {
        type: String,
        // required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    },
    isOnline: { type: Boolean, default: false },
    lastPayment: {
        type: Date,
    },
    paymentDate: {
        type: Date,
    },
    status: {
        type: String,
        default: "Pending"
    },

});

const Student = mongoose.model('Student', StudentSchema);

export default Student;