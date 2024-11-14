import express from 'express'
import { addTestimonial } from '../controllers/testimonoialController'

const router = express.Router()

router.post('/add-testimonial', addTestimonial);
router.get('/get-testimonial', getTestimonial);

export default router;