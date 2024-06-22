import express from 'express'
import { createStudent } from '../controllers/studentController.js'



const router = express.Router()



router.post("/createstudent", createStudent)
export default router