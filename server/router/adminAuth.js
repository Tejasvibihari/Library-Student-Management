import express from "express";
import { SignIn, SignUp, CheckAdmin } from "../controllers/adminAuth.js";

const router = express.Router()

router.post('/signup', SignUp)
router.post('/signin', SignIn)
router.post('/checkuser', CheckAdmin)


export default router;