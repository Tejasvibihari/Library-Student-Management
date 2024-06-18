import mongoose, { Schema } from 'mongoose'

const AdminSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: Number
    },
    otpexpiry: {
        type: Date
    },
    logo: {
        type: String
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    website: {
        type: String
    },
    facebook: {
        type: String
    },
    twitter: {
        type: String
    },
    instagram: {
        type: String
    },
    linkedin: {
        type: String
    },
    youtube: {
        type: String
    },
    about: {
        type: String
    },
    role: {
        type: String,
        default: 'admin'
    },
})

const Admin = mongoose.model('Admin', AdminSchema);
export default Admin