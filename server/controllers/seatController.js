import Seat from "../models/seatModel.js";


export const getAvailableSeats = async (req, res) => {
    const { shift } = req.params;

    try {
        // Query seats that are available for the given shift
        const availableSeats = await Seat.find({ [`availability.${shift}`]: true });

        res.status(200).json(availableSeats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// Controller to get all vacant seats based on the selected shift
export const getVacantSeatsByShift = async (req, res) => {
    const { shift } = req.query;

    try {
        // Query to find seats that are vacant during the selected shift
        const vacantSeats = await Seat.find({
            [shift]: { $exists: false } // Check if the shift is not occupied
        }, 'seatNumber'); // Only select seatNumber

        res.status(200).json(vacantSeats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
