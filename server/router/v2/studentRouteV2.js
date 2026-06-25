import express from 'express';
import {
    createNewStudentV2,
    allotSeatToStudentV2,
    getAllStudentsV2,
    getStudentAccountV2,
    getStudentBySidV2,
    getStudentV2,
    gettrashV2,
    trashStudentV2,
    vacateStudentSeatV2,
    updateStudentProfileV2,
    updateStudentAccountV2,
    updateStudentSeatV2,
    updateStudentStatusV2,
    adminUpdateStudentV2
} from '../../controllers/v2/studentControllerV2.js';
import { generateSidMiddlewareV2, studentUploadV2 } from '../../middleware/v2/studentUploadV2.js';

const router = express.Router();

// ── Create ────────────────────────────────────────────────────────────────────
router.post('/create-new-student', generateSidMiddlewareV2, studentUploadV2.single('image'), createNewStudentV2);

// ── Read ──────────────────────────────────────────────────────────────────────
router.get('/getallstudent', getAllStudentsV2);
router.get('/getstudent', getStudentV2);
router.get('/getstudentbysid', getStudentBySidV2);
router.get('/account/:sid', getStudentAccountV2);
router.get("/gettrashstudent", gettrashV2);
// ── Update ────────────────────────────────────────────────────────────────────
router.put('/profile/:sid', updateStudentProfileV2);   // personal info only
router.put('/account/:sid', updateStudentAccountV2);   // shift / discount / validTill
router.put('/seat/:sid', updateStudentSeatV2);      // assign / change / remove seat
router.patch('/status/:sid', updateStudentStatusV2);    // student status only (active/inactive/left)
router.put('/admin/:sid', adminUpdateStudentV2);     // unrestricted override

// ── Seat operations ───────────────────────────────────────────────────────────
router.post('/allot-seat', allotSeatToStudentV2);
router.patch('/vacate-seat/:bookingId', vacateStudentSeatV2);

// ── Delete (soft) ─────────────────────────────────────────────────────────────
router.delete('/delete', trashStudentV2);

export default router;