import SeatV2 from '../../models/v2/seatModelV2.js';
import ShiftV2 from '../../models/v2/shiftModelV2.js';
import { SeatBookingV2 } from '../../models/v2/seatModelV2.js';
import { createSeatV2, getSeatAvailabilityV2, vacateBookingV2 } from '../../services/v2/seatServiceV2.js';
import { getActiveShiftsV2, resolveShiftV2 } from '../../services/v2/shiftServiceV2.js';

export const getShiftsV2 = async (req, res) => {
    try {
        const includeDeleted = req.query.includeDeleted === 'true';
        const shifts = includeDeleted
            ? await ShiftV2.find().sort({ displayOrder: 1, label: 1 })
            : await getActiveShiftsV2();
        res.status(200).json({ shifts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createShiftV2 = async (req, res) => {
    try {
        const shift = await ShiftV2.create(req.body);
        res.status(201).json(shift);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateShiftV2 = async (req, res) => {
    try {
        const shift = await ShiftV2.findById(req.params.id);
        if (!shift) return res.status(404).json({ message: 'Shift not found.' });

        Object.assign(shift, req.body);
        await shift.save();
        res.status(200).json(shift);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const softDeleteShiftV2 = async (req, res) => {
    try {
        const shift = await ShiftV2.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: false, deletedAt: new Date() } },
            { new: true }
        );
        if (!shift) return res.status(404).json({ message: 'Shift not found.' });
        res.status(200).json({ message: 'Shift soft deleted.', shift });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const restoreShiftV2 = async (req, res) => {
    try {
        const shift = await ShiftV2.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: true, deletedAt: null } },
            { new: true }
        );
        if (!shift) return res.status(404).json({ message: 'Shift not found.' });
        res.status(200).json({ message: 'Shift restored.', shift });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const permanentDeleteShiftV2 = async (req, res) => {
    try {
        const shift = await ShiftV2.findByIdAndDelete(req.params.id);
        if (!shift) return res.status(404).json({ message: 'Shift not found.' });
        res.status(200).json({ message: 'Shift permanently deleted.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllSeatsV2 = async (req, res) => {
    try {
        if (req.query.shiftCode || req.query.seatShift) {
            const allSeats = await getSeatAvailabilityV2({
                shiftCode: req.query.shiftCode || req.query.seatShift,
                gender: req.query.gender
            });
            return res.status(200).json({ allSeats });
        }

        const includeDeleted = req.query.includeDeleted === 'true';
        const query = includeDeleted ? {} : { deletedAt: null };
        if (req.query.reservedFor) query.reservedFor = req.query.reservedFor;
        if (req.query.row) query.row = req.query.row;

        const allSeats = await SeatV2.find(query).sort({ row: 1, seatNumber: 1 });
        return res.status(200).json({ allSeats });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getVacantSeatsByShiftV2 = async (req, res) => {
    console.log(req.query)
    try {
        const seats = await getSeatAvailabilityV2({
            shiftCode: req.query.shiftCode || req.query.seatShift || req.params.shift,
            gender: req.query.gender
        });
        res.status(200).json(seats.filter((seat) => seat.available));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const createSeatControllerV2 = async (req, res) => {
    try {
        const seat = await createSeatV2(req.body);
        res.status(201).json(seat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const createSeatMasterV2 = createSeatControllerV2;

export const getSeatBySeatNumberV2 = async (req, res) => {
    try {
        const seat = await SeatV2.findOne({ seatNumber: req.params.seatNumber });
        if (!seat) return res.status(404).json({ message: 'Seat not found.' });
        res.status(200).json(seat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSeatV2 = async (req, res) => {
    try {
        const filter = req.params.id
            ? { _id: req.params.id }
            : { seatNumber: req.params.seatNumber };

        const seat = await SeatV2.findOneAndUpdate(
            filter,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!seat) return res.status(404).json({ message: 'Seat not found.' });
        res.status(200).json(seat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const softDeleteSeatV2 = async (req, res) => {
    try {
        const activeBooking = await SeatBookingV2.findOne({ seat: req.params.id, status: 'allotted' }).lean();
        if (activeBooking) {
            return res.status(409).json({ message: 'Seat has active bookings. Vacate/cancel bookings before deleting.' });
        }

        const seat = await SeatV2.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: false, deletedAt: new Date() } },
            { new: true }
        );
        if (!seat) return res.status(404).json({ message: 'Seat not found.' });
        res.status(200).json({ message: 'Seat soft deleted.', seat });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const restoreSeatV2 = async (req, res) => {
    try {
        const seat = await SeatV2.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: true, deletedAt: null } },
            { new: true }
        );
        if (!seat) return res.status(404).json({ message: 'Seat not found.' });
        res.status(200).json({ message: 'Seat restored.', seat });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const permanentDeleteSeatV2 = async (req, res) => {
    try {
        const activeBooking = await SeatBookingV2.findOne({ seat: req.params.id, status: 'allotted' }).lean();
        if (activeBooking) {
            return res.status(409).json({ message: 'Seat has active bookings. Vacate/cancel bookings before deleting.' });
        }

        const seat = await SeatV2.findByIdAndDelete(req.params.id);
        if (!seat) return res.status(404).json({ message: 'Seat not found.' });
        res.status(200).json({ message: 'Seat permanently deleted.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const vacateBookingControllerV2 = async (req, res) => {
    try {
        const booking = await vacateBookingV2({ bookingId: req.params.bookingId, reason: req.body.reason });
        res.status(200).json({ message: 'Seat booking vacated.', booking });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};