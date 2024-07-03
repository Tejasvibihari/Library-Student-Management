import express from "express";
import { GetMail, getStudentEmail, sendEmail } from "../controllers/mailController.js";

const router = express.Router()

router.get('/getmail', GetMail)
router.get('/getstudentemail', getStudentEmail)
router.post('/sendemail', sendEmail)

export default router;