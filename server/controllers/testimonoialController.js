import Testimonial from '../models/testimonialModel.js';

export const addTestimonial = async (req, res) => {
    const { review, studentId } = req.body;
    try {
        const existingTestimonial = await Testimonial.findOne({ studentId });
        if (existingTestimonial) {
            existingTestimonial.review = review;
            await existingTestimonial.save();
            return res.status(200).json(existingTestimonial);
        } else {
            const newTestimonial = new Testimonial({ review, studentId });
            await newTestimonial.save();
            return res.status(201).json(newTestimonial);
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};