import express from 'express';
import {
    createNewStudentV2,
    allotSeatToStudentV2,
    getAllStudentsV2,
    getStudentAccountV2,
    getStudentBySidV2,
    getStudentV2,
    trashStudentV2,
    updateStudentV2,
    vacateStudentSeatV2
} from '../../controllers/v2/studentControllerV2.js';
import { generateSidMiddlewareV2, studentUploadV2 } from '../../middleware/v2/studentUploadV2.js';

const router = express.Router();

router.post('/create-new-student', generateSidMiddlewareV2, studentUploadV2.single('image'), createNewStudentV2);
router.get('/getallstudent', getAllStudentsV2);
router.get('/getstudent', getStudentV2);
router.get('/getstudentbysid/:sid', getStudentBySidV2);
router.get('/account/:sid', getStudentAccountV2);
router.post('/updatestudent', updateStudentV2);
router.post('/allot-seat', allotSeatToStudentV2);
router.patch('/vacate-seat/:bookingId', vacateStudentSeatV2);
router.get('/delete', trashStudentV2);

export default router;