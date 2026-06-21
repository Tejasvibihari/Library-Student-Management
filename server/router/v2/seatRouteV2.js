import express from 'express';
import {
    createShiftV2,
    createSeatControllerV2,
    getAllSeatsV2,
    getSeatBySeatNumberV2,
    getShiftsV2,
    getVacantSeatsByShiftV2,
    permanentDeleteSeatV2,
    permanentDeleteShiftV2,
    softDeleteSeatV2,
    softDeleteShiftV2,
    restoreSeatV2,
    restoreShiftV2,
    updateShiftV2,
    updateSeatV2,
    vacateBookingControllerV2
} from '../../controllers/v2/seatControllerV2.js';

const router = express.Router();

router.get('/shifts', getShiftsV2);
router.post('/shifts', createShiftV2);
router.put('/shifts/:id', updateShiftV2);
router.patch('/shifts/:id/soft-delete', softDeleteShiftV2);
router.patch('/shifts/:id/restore', restoreShiftV2);
router.delete('/shifts/:id/permanent', permanentDeleteShiftV2);
router.get('/seats', getAllSeatsV2);
router.post('/seats', createSeatControllerV2);
router.put('/seats/:id', updateSeatV2);
router.patch('/seats/:id/soft-delete', softDeleteSeatV2);
router.patch('/seats/:id/restore', restoreSeatV2);
router.delete('/seats/:id/permanent', permanentDeleteSeatV2);
router.get('/getAvailableSeats/:shift', getVacantSeatsByShiftV2);
router.get('/getVacantSeatsByShift', getVacantSeatsByShiftV2);
router.post('/createSeat', createSeatControllerV2);
router.get('/getAllSeat', getAllSeatsV2);
router.get('/getseatbynumber/:seatNumber', getSeatBySeatNumberV2);
router.put('/updateSeat/:seatNumber', updateSeatV2);
router.patch('/booking/:bookingId/vacate', vacateBookingControllerV2);

export default router;