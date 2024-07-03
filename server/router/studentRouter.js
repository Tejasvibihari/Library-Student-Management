import express from 'express'
import { createStudent, StudentLogin, StudentLogOut, GetOnlineStudent, GetAllStudent, GetStudent, updateStudent } from '../controllers/studentController.js'



const router = express.Router()



router.post("/createstudent", createStudent)

router.post('/login', StudentLogin);
router.post('/logout', StudentLogOut);
router.get('/online-users', GetOnlineStudent);
router.get('/getallstudent', GetAllStudent);
router.get('/getstudent', GetStudent);
router.post('/updatestudent', updateStudent);

export default router