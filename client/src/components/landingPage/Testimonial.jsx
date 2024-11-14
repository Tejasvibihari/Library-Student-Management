import React from 'react'
import Slider from "react-slick";

export default function Testimonial() {

    // const settings = {
    //     className: "center",
    //     centerMode: true,
    //     infinite: true,
    //     centerPadding: "60px",
    //     slidesToShow: 3,
    //     speed: 500
    // };
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
            <div className='max-w-6xl mx-auto my-8'>
                <div className="slider-container">
                    <Slider {...settings}>
                        <div className='P-4 max-h-96'>
                            <div className='flex flex-col items-center justify-center'>
                                <div className='flex items-center justify-center'>
                                    <img src='./img/femaledp.jpg' className='rounded-full w-24' />
                                </div>
                                <div className='my-4 font-inter font-semibold text-xl'>
                                    Tejasvi Kumar
                                </div>
                                <p className='max-w-4xl mx-auto text-center font-cedarville-cursive text-xl'>
                                    Enhanced Learning for Students: E-learning platforms offer interactive and personalized learning experiences, helping students of all ages learn more effectively at their own pace.

                                    Crisis Management: In emergencies, the digital world enables rapid response through alerts, GPS tracking, and online communication, which helps save lives and resources.

                                </p>
                            </div>
                        </div>
                        <div>
                            <h3>2</h3>
                        </div>
                        <div>
                            <h3>3</h3>
                        </div>
                        <div>
                            <h3>4</h3>
                        </div>
                        <div>
                            <h3>5</h3>
                        </div>
                        <div>
                            <h3>6</h3>
                        </div>
                    </Slider>
                </div>
            </div>
        </>
    )
}
