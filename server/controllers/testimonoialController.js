import Testimonial from '../models/testimonialModel.js';

export const addTestimonial = async (req, res) => {
    const { review, studentId } = req.body;
    console.log(review, studentId);
    try {
        const existingTestimonial = await Testimonial.findOne({ studentId });
        if (existingTestimonial) {
            existingTestimonial.review = review;
            await existingTestimonial.save();
            return res.status(200).json({ message: "Testimonial added successfully" });
        } else {
            const newTestimonial = new Testimonial({ review, studentId });
            await newTestimonial.save();
            return res.status(201).json({ message: "Testimonial added successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });

    }
};

export const getTestimonial = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        console.log(testimonials);
        res.status(200).json(testimonials);
    } catch (error) {
        console.log(error);
    }
}