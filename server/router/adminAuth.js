import express from "express";
import { SignIn, SignUp, CheckAdmin, sendOtp, verifyOtp } from "../controllers/adminAuth.js";

const router = express.Router()

router.post('/signup', SignUp)
router.post('/signin', SignIn)
router.post('/checkuser', CheckAdmin)
router.post('/senotp', sendOtp)
router.post('/verifyotp', verifyOtp)


export default router;