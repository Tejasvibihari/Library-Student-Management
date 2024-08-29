import React, { useState, useEffect, useRef } from 'react';
import { Menu, LayoutDashboard, X } from 'lucide-react'; // Import the Menu and X icons from lucide-react
import { Link } from 'react-router-dom';

export default function Header() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const sidebarRef = useRef(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            closeSidebar();
        }
    };

    useEffect(() => {
        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            <header className={`bg-gray-100 fixed top-0 left-0 w-full z-50 transition-shadow ${isScrolled ? 'shadow-md' : ''}`}>
                <div className='max-w-7xl mx-auto flex justify-between items-center p-2'>
                    <div className='flex items-center'>
                        <img src='./img/biharilogo.png' alt='Company Logo' className='h-17 w-52 mr-4' />
                    </div>
                    <div className='flex items-center space-x-8'>
                        <button className='md:hidden' onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        <nav className='hidden md:flex items-center space-x-4'>
                            <a href="/" className='text-gray-700 hover:text-[#8e54e9] border-b-[#8e54e9] hover:border-b-2 transition-all font-[inter] font-semibold text-sm'> HOME</a>
                            <a href="#about" className='text-gray-700 hover:text-[#8e54e9] border-b-[#8e54e9] hover:border-b-2 transition-all font-[inter] font-semibold text-sm'>ABOUT</a>
                            <a href="#service" className='text-gray-700 hover:text-[#8e54e9] border-b-[#8e54e9] hover:border-b-2 transition-all font-[inter] font-semibold text-sm'>SERVICES</a>
                            <a href="#gallery" className='text-gray-700 hover:text-[#8e54e9] border-b-[#8e54e9] hover:border-b-2 transition-all font-[inter] font-semibold text-sm'>GALLERY</a>
                            <a href="#contact" className='text-gray-700 hover:text-[#8e54e9] border-b-[#8e54e9] hover:border-b-2 transition-all font-[inter] font-semibold text-sm'>CONTACT</a>
                        </nav>
                        <Link to="/admin-dashboard" className='hidden md:block bg-black text-white px-10 py-3 font-semibold font-[inter] hover:bg-white hover:text-black border-2 border-black transition-all'>
                            <div className='flex items-center'>
                                <LayoutDashboard size={17} className='mr-2' />
                                Dashboard
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <div className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-50 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div ref={sidebarRef} className='bg-white w-64 h-full p-4'>
                    <button className='mb-4' onClick={toggleSidebar}>
                        <X size={24} />
                    </button>
                    <nav className='flex flex-col space-y-4'>
                        <a href="/" onClick={closeSidebar} className='text-gray-700 hover:text-[#8e54e9] transition-all font-[inter] font-semibold text-sm'> HOME</a>
                        <a href="#about" onClick={closeSidebar} className='text-gray-700 hover:text-[#8e54e9] transition-all font-[inter] font-semibold text-sm'>ABOUT</a>
                        <a href="#service" onClick={closeSidebar} className='text-gray-700 hover:text-[#8e54e9] transition-all font-[inter] font-semibold text-sm'>SERVICES</a>
                        <a href="#gallery" onClick={closeSidebar} className='text-gray-700 hover:text-[#8e54e9] transition-all font-[inter] font-semibold text-sm'>GALLERY</a>
                        <a href="#contact" onClick={closeSidebar} className='text-gray-700 hover:text-[#8e54e9] transition-all font-[inter] font-semibold text-sm'>CONTACT</a>
                        <Link to="/admin-dashboard" className='bg-black text-white px-10 py-3 font-semibold font-[inter] hover:bg-white hover:text-black border-2 border-black transition-all'>
                            <div className='flex items-center'>
                                <LayoutDashboard size={17} className='mr-2' />
                                Dashboard
                            </div>
                        </Link>
                    </nav>
                </div>
            </div>
        </>
    );
}