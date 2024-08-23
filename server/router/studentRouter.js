import express from 'express'
import { createOldStudent, createNewStudent, StudentLogin, StudentLogOut, GetOnlineStudent, GetAllStudent, GetStudent, updateStudent, bulkStudentAdmission, getAdmissionMonth } from '../controllers/studentController.js'



const router = express.Router()



router.post("/create-old-student", createOldStudent)
router.post("/create-new-student", createNewStudent)

router.post('/login', StudentLogin);
router.post('/logout', StudentLogOut);
router.get('/online-users', GetOnlineStudent);
router.get('/getallstudent', GetAllStudent);
router.get('/getstudent', GetStudent);
router.post('/updatestudent', updateStudent);
router.post('/bulk-admission', bulkStudentAdmission);
router.get('/get-admission-month', getAdmissionMonth);

export default router