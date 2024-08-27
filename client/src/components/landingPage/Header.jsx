import React from 'react';
import { Menu, UserPlus, LayoutDashboard } from 'lucide-react'; // Import the Menu icon from lucide-react or any other icon library

export default function Header() {
    return (
        <>
            <header className='bg-gray-100'>
                <div className='max-w-7xl mx-auto flex justify-between items-center p-2'>
                    <div className='flex items-center'>
                        <img src='./img/biharilogo.png' alt='Company Logo' className='h-17 w-52 mr-4' /> {/* Replace with your icon */}
                    </div>
                    <div className='flex items-center space-x-8'>

                        <nav className='flex items-center space-x-4'>
                            <a href="#home" className='text-gray-700 hover:text-[#8e54e9] border-b-[#8e54e9] hover:border-b-2 transition-all font-[inter] font-semibold text-sm'> HOME</a>
                            <a href="#about" className='text-gray-700 hover:text-[#8e54e9] border-b-[#8e54e9] hover:border-b-2 transition-all font-[inter] font-semibold text-sm'>ABOUT</a>
                            <a href="#contact" className='text-gray-700 hover:text-[#8e54e9] border-b-[#8e54e9] hover:border-b-2 transition-all font-[inter] font-semibold text-sm'>CONTACT</a>
                            <a href="#testimonial" className='text-gray-700 hover:text-[#8e54e9] border-b-[#8e54e9] hover:border-b-2 transition-all font-[inter] font-semibold text-sm'>GALLERY</a>
                        </nav>
                        <button type='submit' className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                            {/* <div className='flex items-center justify-center'></div> */}
                            <div className='flex items-center'>
                                <LayoutDashboard size={17} className='mr-2' />
                                Dashboard
                            </div>
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}