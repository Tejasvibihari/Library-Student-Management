import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
    seatNumber: {
        type: String,
        required: true,
    },
    availability: {
        morning: {
            type: Boolean,
            default: true
        },
        afternoon: {
            type: Boolean,
            default: true
        },
        evening: {
            type: Boolean,
            default: true
        },
        night: {
            type: Boolean,
            default: true
        },
        doubleMorning: {
            type: Boolean,
            default: true
        },
        doubleEvening: {
            type: Boolean,
            default: true
        },
        nightLong: {
            type: Boolean,
            default: true
        },
        fullDay: {
            type: Boolean,
            default: true
        },
        morningLong: {
            type: Boolean,
            default: true
        }

    }
});

const Seat = mongoose.model('Seat', seatSchema);

export default Seat;