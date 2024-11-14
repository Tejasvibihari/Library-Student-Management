import Testimonial from '../models/testimonialModel.js';

export const addTestimonial = async (req, res) => {
    const { review, studentId } = req.body;

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
export const deleteTestimonial = async (req, res) => {
    const { id } = req.params;
    try {
        const testimonial = await Testimonial.findByIdAndDelete(id);
        console.log("deleteed")
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        res.status(200).json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};