import express from "express";
import { GetMail } from "../controllers/mailController.js";
const router = express.Router()

router.get('/getmail', GetMail)

export default router;