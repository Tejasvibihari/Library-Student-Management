import express from 'express'
import { addTestimonial, getTestimonial } from '../controllers/testimonoialController.js'

const router = express.Router()

router.post('/add-testimonial', addTestimonial);
router.get('/get-testimonial', getTestimonial);

export default router;