import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Building, Settings, Images, Link2, LayoutDashboard, Network } from 'lucide-react'

export default function Footer() {
    return (
        <>
            <footer className="bg-black text-white py-8">
                <div className="max-w-6xl mx-auto px-4 my-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <img src='./img/biharilogo.png' />
                        </div>
                        <div>
                            <h5 className="font-regular mb-4 font-roboto text-xl tracking-[.2em] border-l-4 pl-2 border-l-green-600">IMPORTANT LINK</h5>
                            {/* <hr className='bg-primary border-primary w-[20%] border-2' /> */}
                            <ul className='flex flex-col text-secondary text-sm font-poppins mt-8'>
                                <Link to="">
                                    {/* <li className='flex mb-4'><House size={20} className='text-primary mr-3' />Home</li> */}
                                </Link>
                                <Link to="#about">
                                    <li className='flex mb-4'><Building size={20} className='text-primary mr-3' />About</li>
                                </Link>
                                <Link to="#service">
                                    <li className='flex mb-4'><Settings size={20} className='text-primary mr-3' />Service</li>
                                </Link>
                                <Link to="#gallery">
                                    <li className='flex mb-4'><Images size={20} className='text-primary mr-3' />Gallery</li>
                                </Link>
                                <Link to="#contact">
                                    <li className='flex mb-4'><MapPin size={20} className='text-primary mr-3' />Contact</li>
                                </Link>
                                <Link to="/student-admission">
                                    <li className='flex mb-4'><Link2 size={20} className='text-primary mr-3' />Student Admission</li>
                                </Link>
                                <Link to="/admin-dashboard">
                                    <li className='flex mb-4'><LayoutDashboard size={20} className='text-primary mr-3' />Dashboard</li>
                                </Link>
                                <Link to="/6024841_21.html">
                                    <li className='flex mb-4'><Network size={20} className='text-primary mr-3' />Sitemap</li>
                                </Link>

                            </ul>
                        </div>
                        <div>
                            <h5 className="font-regular mb-4 font-roboto text-xl tracking-[.2em] border-l-4 pl-2 border-l-green-600">LET'S CONNECT</h5>
                            {/* <hr className='bg-primary border-primary w-[20%] border-2' /> */}
                            <ul className='flex flex-col text-secondary text-sm font-poppins mt-8'>
                                <li className='flex mb-4'><MapPin size={20} className='text-primary mr-3' />Bihari Library</li>
                                <li className='flex mb-4'><Phone size={20} className='text-primary mr-3' />+91 9608888400</li>
                                <li className='flex mb-4'><Mail size={20} className='text-primary mr-3' />biharilibrary@gmail.com </li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-regular mb-4 font-roboto text-xl tracking-[.2em] border-l-4 pl-2 border-l-green-600">OUR GALLERY</h5>
                            {/* <hr className='bg-primary border-primary w-[20%] border-2' /> */}
                            <div className='grid grid-cols-1 mt-8'>
                                <div className='flex gap-1'>
                                    <img src='./gallery/g1.jpg' className='w-28' />
                                    <img src='./gallery/g3.jpg' className='w-28' />

                                </div>
                                <div className='flex gap-1'>
                                    <img src='./gallery/g3.jpg' className='w-28' />
                                    <img src='./gallery/g2.jpg' className='w-28' />

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}
