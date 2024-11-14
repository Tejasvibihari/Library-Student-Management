import express from 'express'
import { addTestimonial, getTestimonial, deleteTestimonial } from '../controllers/testimonoialController.js'

const router = express.Router()

router.post('/add-testimonial', addTestimonial);
router.get('/get-testimonial', getTestimonial);
router.delete('/delete-testimonial/:id', deleteTestimonial); // Add this line


export default router;