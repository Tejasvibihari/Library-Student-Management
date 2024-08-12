import express from "express";
import { getAvailableSeats, getVacantSeatsByShift, createSeat } from "../controllers/seatController.js";

const router = express.Router()

router.get('/getAvailableSeats', getAvailableSeats)
router.get('/getVacantSeatsByShift', getVacantSeatsByShift)
router.post('/createSeat', createSeat)

export default router;