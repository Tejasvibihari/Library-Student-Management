import React, { useEffect, useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import client from '../services/axiosClient';
import TestimonialProfileCard from '../components/TestimonialProfileCard';
import TestimonialReviewCard from '../components/TestimonialReviewCard';

export default function ViewTestimonial() {
    const [testimonials, setTestimonials] = useState([])
    console.log(testimonials)
    const getTestimonials = async () => {
        try {
            const response = await client.get("/api/testimonial/get-testimonial");
            const testimonialsData = response.data;

            // Fetch student details for each testimonial
            const testimonialsWithStudentDetails = await Promise.all(testimonialsData.map(async (testimonial) => {
                const studentResponse = await client.get(`/api/student/getstudent`, { params: { _id: testimonial.studentId } });
                return {
                    ...testimonial,
                    student: studentResponse.data
                };
            }));

            setTestimonials(testimonialsWithStudentDetails);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getTestimonials();
    }, []);
    return (
        <>
            <Breadcrumbs
                title="View Testimonial" subTitle="Testimonial"
            />
            <div>
                <div className='grid md:grid-cols-4 gap-4 grid-cols-1 items-center p-4'>
                    {
                        testimonials.map((testimonial, index) => {
                            return (
                                <div key={index}>
                                    <TestimonialReviewCard
                                        id={testimonial.student._id}
                                        name={testimonial.student.name}
                                        sid={testimonial.student.sid}
                                        review={testimonial.review}
                                        img={`https://api.biharilibrary.in/uploads/${testimonial.student.image}`}
                                    />
                                </div>
                            );
                        })
                    }
                </div>
            </div>

        </>
    )
}
