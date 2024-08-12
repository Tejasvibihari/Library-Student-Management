import express from "express";
import { getAvailableSeats, getVacantSeatsByShift } from "../controllers/seatController.js";

const router = express.Router()

router.get('/getAvailableSeats', getAvailableSeats)
router.get('/getVacantSeatsByShift', getVacantSeatsByShift)

export default router;