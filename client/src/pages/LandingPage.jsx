import React, { useEffect, useState } from 'react'
import Header from '../components/landingPage/Header'
import Hero from '../components/landingPage/Hero'
import Features from '../components/landingPage/Features'
import AboutSection from '../components/landingPage/AboutSection'
import Services from '../components/landingPage/Services'
import Footer from '../components/landingPage/Footer'
import Contact from '../components/landingPage/ContactSection'
import Gallery from '../components/landingPage/Gallery'
import Testimonial from '../components/landingPage/Testimonial'
import client from '../services/axiosClient'
export default function LandingPage() {


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

            <Header />
            <Hero />
            <Features />
            <AboutSection />
            <Services />
            {
                testimonials.length > 0 && <Testimonial testimonials={testimonials} />
            }
            <Gallery />
            <Contact />
            <Footer />
        </>
    )
}
