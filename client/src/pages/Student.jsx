import React from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import { Smartphone, MapPin, Mail } from 'lucide-react';
// import { House } from 'lucide-react';

export default function Student() {
    return (
        <>
            <div className='p-4 shadow-lg'>
                <Breadcrumbs title="Student" subTitle="Profile" />
            </div>
            <div className='bg-gray-200'>
                <div className='p-4'>
                    <div className='rounded-md bg-white p-2 shadow-lg'>
                        <div className='flex flex-col md:flex-row gap-2'>
                            <div>
                                <img className='w-32 rounded-full' src='/img/idDp.jpg' />
                            </div>
                            <div className='flex flex-col py-3'>
                                <div className='font-[inter]'><span className='font-semibold'>SID</span>:- 1001</div>
                                <div className='font-[inter] mb-2'><span className='font-semibold'>Name</span>:- Tejasvi Kumar</div>
                                <div className='flex items-center text-xs text-gray-600 font-[inter] space-x-10 mb-1'><Smartphone size={15} /> 6205731150</div>
                                <div className='flex items-center text-xs text-gray-600 font-[inter] space-x-10 mb-1'><Mail size={15} />tejasvibihari2000@gmail.com</div>
                                <div className='flex items-center text-xs text-gray-600 font-[inter] space-x-10 mb-1'><MapPin size={15} />Amarpura</div>
                                <div className='bg-green-400 px-4 py-2 rounded-full text-green-900 font-bold  border border-green-900 text-center items-center text-xs font-[inter]'>
                                    Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='p-4'>
                        <div className='rounded-md bg-white shadow-lg p-2'>
                            <div className='font-[inter] text-lg font-semibold  border-l-green-700 border-l-4 pl-1 my-2'>Personal Detail</div>
                            <div className='flex flex-col md:flex-row gap-2 px-4'>
                                <div className='flex flex-col'>
                                    <div className='font-[inter]'><span className='font-semibold'>Name</span>:- Tejasvi Kumar</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Gender</span>:- Male</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Father's Name</span>:- Manoj Kumar</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Guardian Mobile No.</span>:- 9905424292</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Date Of Birth</span>:- 30 Oct 2002</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Aadhar No.</span>:- 30 Oct 2002</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='p-4'>
                        <div className='rounded-md bg-white shadow-lg p-2'>
                            <div className='font-[inter] text-lg font-semibold  border-l-yellow-300 border-l-4 pl-1 my-2'>Additional Detail</div>
                            <div className='flex flex-col md:flex-row gap-2 px-4'>
                                <div className='flex flex-col'>
                                    <div className='font-[inter]'><span className='font-semibold'>Shift</span>:- Morning</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Timming</span>:- 07:00AM - 03:00PM</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Preparing For</span>:- Manoj Kumar</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Admission Date</span>:- 9905424292</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='rounded-md bg-white shadow-lg p-2'>
                        <div className='font-[inter] text-lg font-semibold  border-l-red-700 border-l-4 pl-1 my-2'>Payment Detail</div>
                        <div className='flex flex-col md:flex-row gap-2 px-4'>
                            <div className='flex flex-col'>
                                <div className='font-[inter]'><span className='font-semibold'></span>:- Morning</div>
                                <div className='font-[inter]'><span className='font-semibold'>Timming</span>:- 07:00AM - 03:00PM</div>
                                <div className='font-[inter]'><span className='font-semibold'>Preparing For</span>:- Manoj Kumar</div>
                                <div className='font-[inter]'><span className='font-semibold'>Admission Date</span>:- 9905424292</div>
                                <div className='font-[inter]'><span className='font-semibold'>Date Of Birth</span>:- 30 Oct 2002</div>
                                <div className='font-[inter]'><span className='font-semibold'>Aadhar No.</span>:- 30 Oct 2002</div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}
