import express from "express";
import { getAvailableSeats, getVacantSeatsByShift, createSeat, getAllSeats, getSeatBySeatNumber } from "../controllers/seatController.js";

const router = express.Router()

// router.get('/getAvailableSeats/:shift', getVacantSeatsByShift)
router.get('/getAvailableSeats/:shift', getAvailableSeats)
router.get('/getVacantSeatsByShift', getVacantSeatsByShift)
router.post('/createSeat', createSeat)
router.get('/getAllSeat', getAllSeats)
router.get('/getseatbynumber/:seatNumber', getSeatBySeatNumber)

export default router;