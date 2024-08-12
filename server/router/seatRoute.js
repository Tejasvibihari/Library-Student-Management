import express from "express";
import { getAvailableSeats, getVacantSeatsByShift, createSeat } from "../controllers/seatController.js";

const router = express.Router()

// router.get('/getAvailableSeats/:shift', getVacantSeatsByShift)
router.get('/getAvailableSeats/:shift', getAvailableSeats)
router.get('/getVacantSeatsByShift', getVacantSeatsByShift)
router.post('/createSeat', createSeat)

export default router;