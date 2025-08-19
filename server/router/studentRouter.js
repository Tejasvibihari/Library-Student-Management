import express from 'express';
import { tempApiForPayment, createOldStudent, createNewStudent, StudentLogin, StudentLogOut, GetOnlineStudent, GetAllStudent, GetStudent, updateStudent, bulkStudentAdmission, getAdmissionMonth, trashStudent, trash, GetStudentBySid } from '../controllers/studentController.js';
import { generateSidMiddleware, studentUpload } from '../middleware/studentIMulter.js';

const router = express.Router();

router.post("/create-old-student", createOldStudent);
router.post("/create-new-student", generateSidMiddleware, studentUpload.single('image'), createNewStudent);

router.post('/login', StudentLogin);
router.post('/logout', StudentLogOut);
router.get('/online-users', GetOnlineStudent);
router.get('/getallstudent', GetAllStudent);
router.get('/getstudent', GetStudent);
router.get('/getstudentbysid/:sid', GetStudentBySid);
router.post('/updatestudent', updateStudent);
router.post('/bulk-admission', bulkStudentAdmission);
router.get('/get-admission-month', getAdmissionMonth);

// Add the delete route
router.get('/delete', trashStudent);
router.get('/trash-Student', trash);

router.get('/temp-api', tempApiForPayment);

export default router;
