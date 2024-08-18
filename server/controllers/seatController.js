import Seat from "../models/seatModel.js";

export const getAllSeats = async (req, res) => {
    try {
        // Query to get all seat records
        const allSeats = await Seat.find();
        res.status(200).json({ allSeats });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
export const getAvailableSeats = async (req, res) => {
    const { shift } = req.params;
    // console.log(shift)
    try {
        // Query seats that are available for the given shift
        const availableSeats = await Seat.find({ [`availability.${shift}`]: true });

        res.status(200).json({ availableSeats });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


export const getVacantSeatsByShift = async (req, res) => {
    const { seatShift } = req.query;
    let query = {};

    // Build the query based on the seatShift
    if (seatShift === "morningLong") {
        query = {
            'availability.morning': true,
            'availability.afternoon': true,
            'availability.evening': true
        };
    } else if (seatShift === "doubleEvening") {
        query = {
            'availability.afternoon': true,
            'availability.evening': true
        };
    } else if (seatShift === "doubleMorning") {
        query = {
            'availability.morning': true,
            'availability.afternoon': true
        };
    } else if (seatShift === "fullDay") {
        query = {
            'availability.morning': true,
            'availability.afternoon': true,
            'availability.evening': true,
            'availability.night': true
        };
    } else {
        query = {
            [`availability.${seatShift}`]: true
        };
    }

    try {
        // Query to find seats that are vacant during the selected shift
        const vacantSeats = await Seat.find(query, 'seatNumber'); // Only select seatNumber

        // console.log(vacantSeats);
        res.status(200).json(vacantSeats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createSeat = async (req, res) => {
    const { seatNumber } = req.body;

    // Validate input
    // if (!seatNumber || seatNumber < 1 || seatNumber > 73) {
    //     return res.status(400).json({ message: 'Invalid seat number. It must be between 1 and 73.' });
    // }

    try {
        // Check if the seat number already exists
        const existingSeat = await Seat.findOne({ seatNumber });
        if (existingSeat) {
            return res.status(400).json({ message: 'Seat number already exists.' });
        }

        // Create a new seat
        const newSeat = new Seat({
            seatNumber,
        });

        // Save the seat to the database
        await newSeat.save();

        res.status(201).json(newSeat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Controller to update a seat
export const updateSeat = async (req, res) => {
    const { seatNumber } = req.params;
    const updateData = req.body;

    try {
        // Find the seat by seatNumber and update it with the new data
        const updatedSeat = await Seat.findOneAndUpdate({ seatNumber }, updateData, { new: true });

        if (!updatedSeat) {
            return res.status(404).json({ message: 'Seat not found.' });
        }

        res.status(200).json(updatedSeat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};