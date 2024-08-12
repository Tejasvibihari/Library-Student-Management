import React, { useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import { Smartphone, MapPin, Mail } from 'lucide-react';
import SideBar from '../components/Sidebar';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import client from '../services/axiosClient';
import formatDate from '../utils/FormateDate';



export default function AdminStudentDashboard() {
    const userId = useSelector(state => state.admin.currentAdmin)
    const { _id } = useParams()
    const [student, setStudent] = useState({})
    const [payment, setPayment] = useState({})


    useEffect(() => {
        const getStudent = async () => {
            try {
                const response = await client.get("/api/student/getstudent", {
                    params: { admin: userId._id, _id }
                });
                setStudent(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        getStudent();
        const getPayment = async () => {
            try {
                const response = await client.get("/api/payment/getpaymentsid", {
                    params: { sid: student.sid }
                });
                setPayment(response.data);
            } catch (error) {
                console.log(error);
            }
        };

        getPayment();
    }, [_id, userId._id, student.sid]);
    return (
        <>
            <SideBar>
                <div className='p-4 shadow-lg'>
                    <Breadcrumbs title="Student" subTitle="Profile" />
                </div>
                <div className='bg-gray-200'>
                    <div className='p-4'>
                        <div className='rounded-md bg-white p-2 shadow-lg'>
                            <div className='flex flex-col md:flex-row gap-2'>
                                <div>
                                    <img className='w-32 rounded-full' src={`https://library-student-management-api.onrender.com/uploads/${student.image}`} />
                                </div>
                                <div className='flex flex-col py-3'>
                                    <div className='font-[inter]'><span className='font-semibold'>SID</span>:- {student.sid}</div>
                                    <div className='font-[inter] mb-2'><span className='font-semibold'>Name</span>:- {student.name}</div>
                                    <div className='flex items-center text-xs text-gray-600 font-[inter] space-x-10 mb-1'><Smartphone size={15} /> {student.mobile}</div>
                                    <div className='flex items-center text-xs text-gray-600 font-[inter] space-x-10 mb-1'><Mail size={15} />{student.email}</div>
                                    <div className='flex items-center text-xs text-gray-600 font-[inter] space-x-10 mb-1'><MapPin size={15} />{student.address}</div>
                                    <div className={`${!student.nextPayment || student.nextPayment < new Date() ? "border-yellow-600 bg-yellow-800 text-white" : "border-green-600 bg-green-800 text-white"}  px-4 py-2 rounded-full  font-bold  border border-green-900 text-center items-center text-xs font-[inter]`}>
                                        {!student.nextPayment || student.nextPayment < new Date() ? "Payment Due" : "Active"}
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
                                        <div className='font-[inter]'><span className='font-semibold'>Name</span>:- {student.name}</div>
                                        <div className='font-[inter]'><span className='font-semibold'>Gender</span>:- {student.gender}</div>
                                        <div className='font-[inter]'><span className='font-semibold'>Father's Name</span>:- {student.father}</div>
                                        <div className='font-[inter]'><span className='font-semibold'>Guardian Mobile No.</span>:- {student.guardian}</div>
                                        <div className='font-[inter]'><span className='font-semibold'>Date Of Birth</span>:- {formatDate(student.dob)}</div>
                                        <div className='font-[inter]'><span className='font-semibold'>Aadhar No.</span>:- {student.aadhar}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='p-4'>
                            <div className='rounded-md bg-white shadow-lg p-2'>
                                <div className='font-[inter] text-lg font-semibold  border-l-yellow-300 border-l-4 pl-1 my-2'>Additional Detail</div>
                                <div className='flex flex-col md:flex-row gap-2 px-4'>
                                    <div className='flex flex-col'>
                                        <div className='font-[inter]'><span className='font-semibold'>Shift</span>:- {student.shift}</div>
                                        <div className='font-[inter]'><span className='font-semibold'>Timming</span>:- {student.time}</div>
                                        <div className='font-[inter]'><span className='font-semibold'>Preparing For</span>:-{student.preparingFor}</div>
                                        <div className='font-[inter]'><span className='font-semibold'>Admission Date</span>:- {formatDate(student.admissionDate)}</div>
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

            </SideBar >
        </>
    )
}
