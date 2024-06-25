import express from 'express'
import { createStudent, StudentLogin, StudentLogOut, GetOnlineStudent, GetAllStudent } from '../controllers/studentController.js'



const router = express.Router()



router.post("/createstudent", createStudent)

router.post('/login', StudentLogin);
router.post('/logout', StudentLogOut);
router.get('/online-users', GetOnlineStudent);
router.get('/getallstudent', GetAllStudent);

export default router