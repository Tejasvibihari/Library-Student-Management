import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
    seatNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 73
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
            default: false
        },
        doubleEvening: {
            type: Boolean,
            default: false
        },
        nightLong: {
            type: Boolean,
            default: false
        },
        fullDay: {
            type: Boolean,
            default: false
        }
    }
});

const Seat = mongoose.model('Seat', seatSchema);

export default Seat;