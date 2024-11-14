import mongoose, { Schema } from 'mongoose'

const TestimonialSchema = new Schema({

    review: {
        type: String,
        required: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
})

const Testimonial = mongoose.model('Testimonial', TestimonialSchema);
export default Testimonial;