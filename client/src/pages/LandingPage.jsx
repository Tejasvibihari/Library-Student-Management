import React from 'react'
import Header from '../components/landingPage/Header'
import Hero from '../components/landingPage/Hero'
import Features from '../components/landingPage/Features'
import AboutSection from '../components/landingPage/AboutSection'
import Services from '../components/landingPage/Services'
import Footer from '../components/landingPage/Footer'
import Contact from '../components/landingPage/ContactSection'
import Gallery from '../components/landingPage/Gallery'
import Testimonial from '../components/landingPage/Testimonial'
export default function LandingPage() {
    return (
        <>

            <Header />
            <Hero />
            <Features />
            <AboutSection />
            <Services />
            <Testimonial />
            <Gallery />
            <Contact />
            <Footer />
        </>
    )
}
