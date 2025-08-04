import React from 'react';
import './contact.css';

export default function Contact() {
    return (
        <div id='contact' className="relative min-h-screen">
            <div className="parallax-bg"></div>
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full p-10">
                <div className="bg-transparent bg-opacity-80 p-8 shadow-lg w-full border border-white-1">
                    <h1 className="font-bold text-2xl mb-4 font-[inter] tracking-[.2em] text-left text-white border-l-4 pl-2 border-l-yellow-600">
                        Contact Us
                    </h1>
                    <form className="grid grid-cols-1 space-y-4">
                        <div className='flex gap-4 md:flex-row flex-col'>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-white">Last Name</label>
                                <input placeholder='First Name' type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-white">Last Name</label>
                                <input placeholder='First Name' type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white">Email</label>
                            <input placeholder='Email' type="email" className="mt-1 block w-full px-3 py-2 border border-gray-300  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white">Message</label>
                            <textarea className="mt-1 block w-full px-3 py-2 border border-gray-300  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" rows="4"></textarea>
                        </div>
                        <div>
                            <button type="submit" className="bg-white text-black w-full px-10 py-3 font-semibold font-[inter] hover:bg-black hover:text-white border-2 border-white transition-all">
                                Send Message Hello Update 
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
