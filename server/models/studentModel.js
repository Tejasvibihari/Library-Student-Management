const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
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
    shift: {
        fromHour: {
            type: Number,
            required: true
        },
        fromMinute: {
            type: Number,
            required: true
        },
        fromPeriod: {
            type: String,
            required: true
        },
        toHour: {
            type: Number,
            required: true
        },
        toMinute: {
            type: Number,
            required: true
        },
        toPeriod: {
            type: String,
            required: true
        }
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
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    }
});

const Student = mongoose.model('Student', StudentSchema);

export default Student;