import { Phone, BookText } from 'lucide-react';
import { Link } from "react-router-dom";

export default function Hero() {
    return (
        <>
            <section className='bg-hero-pattern bg-cover bg-center h-[75vh] relative bg-hero-overlay'>
                <div className="flex flex-col justify-center items-center h-full content fade-in">
                    <h1 className="max-w-5xl font-poppins font-extrabold text-white mx-auto text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
                        Your Space, Your Pace<span className="transparent-text-outline font-extrabold"><br />Study Smarter</span><br /> <span className='text-white'>Achieve More</span>
                    </h1>
                    <div className="flex md:flex-row flex-col justify-center items-center md:space-x-20">
                        <a href='tel:+919608888400'>
                            <button className='font-poppins mt-7 border-2 border-solid border-white bg-white px-7 py-3 font-normal text-primary hover:text-white hover:bg-transparent transition'>
                                CALL NOW
                            </button>
                        </a>
                        <Link to='/student-admission'>
                            <button className='font-poppins mt-7 border-2 border-solid border-white hover:bg-white px-7 py-3 font-normal hover:text-primary text-white hover:text-black  bg-transparent transition'>
                                ADMISSION
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}