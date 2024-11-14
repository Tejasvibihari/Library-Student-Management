import React from 'react'
import Slider from "react-slick";

export default function Testimonial({ testimonials }) {

    // const settings = {
    //     className: "center",
    //     centerMode: true,
    //     infinite: true,
    //     centerPadding: "60px",
    //     slidesToShow: 3,
    //     speed: 500
    // };
    console.log(testimonials);
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    return (
        <>
            <div className='px-16 flex items-center justify-center'>
                <h1 className='font-bold text-2xl mb-4 font-[inter]  tracking-[.2em]  md:pr-2  border-l-4 border-r-4 pl-2 border-l-red-600 border-r-red-600 text-center'>
                    Student Says About Us
                </h1>
            </div>
            <div className='max-w-6xl mx-auto my-8 p-4'>
                <div className="slider-container">
                    <Slider {...settings}>
                        {testimonials.map((testimonial, index) => {
                            return (
                                <div className='P-4 max-h-96 shadow-2xl' key={index}>
                                    <div className='flex flex-col items-center justify-center p-4'>
                                        <div className='flex items-center justify-center'>
                                            <img src={`https://api.biharilibrary.in/uploads/${testimonial.student.image}`} className='rounded-full w-24' />
                                        </div>
                                        <div className='my-4 font-inter font-semibold text-xl'>
                                            {testimonial.student.name}
                                        </div>
                                        <p className='max-w-4xl mx-auto text-center font-cedarville-cursive text-xl'>
                                            {testimonial.review}
                                        </p>
                                    </div>
                                </div>
                            )
                        }
                        )}
                    </Slider>
                </div>
            </div>
        </>
    )
}
