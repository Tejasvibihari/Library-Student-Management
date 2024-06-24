import express from 'express'
import { createStudent, StudentLogin, StudentLogOut, GetOnlineStudent } from '../controllers/studentController.js'



const router = express.Router()



router.post("/createstudent", createStudent)

router.post('/login', StudentLogin);
router.post('/logout', StudentLogOut);
router.get('/online-users', GetOnlineStudent);

export default router