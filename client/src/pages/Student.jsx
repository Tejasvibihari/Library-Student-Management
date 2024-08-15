import React, { useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import { Smartphone, MapPin, Mail, Fingerprint } from 'lucide-react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import client from '../services/axiosClient';
import formatDate from '../utils/FormateDate';
import CircularLoading from '../components/ui/CircularLoading';
import { Link } from 'react-router-dom';



export default function AdminStudentDashboard() {
    const user = useSelector(state => state.student.currentStudent)
    // const { _id } = useParams()
    // const [student, setStudent] = useState({})
    const [payment, setPayment] = useState({})
    console.log(user.sid)

    useEffect(() => {

        console.log(user.sid)
        const getPayment = async () => {
            try {
                const response = await client.get(`/api/payment/getpaymentsid/${user.sid}`);
                setPayment(response.data);
                console.log(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        getPayment();

    }, [user]);
    return (
        <>
            {/* <SideBar> */}
            <div className='p-4 shadow-lg'>
                <Breadcrumbs title="Student" subTitle="Profile" />
            </div>
            <div className='bg-gray-200'>
                <div className='p-4'>
                    <div className='rounded-md bg-white p-2 shadow-lg'>
                        <div className='flex flex-col md:flex-row gap-2'>
                            <div>
                                <img className='w-32 rounded-full' src={`http://api.biharilibrary.in/uploads/${user.image}`} />
                            </div>
                            <div className='flex flex-col py-3'>
                                <div className='font-[inter]'><span className='font-semibold'>SID</span>:- {user.sid}</div>
                                <div className='font-[inter] mb-2'><span className='font-semibold'>Name</span>:- {user.name}</div>
                                <div className='flex items-center text-xs text-gray-600 font-[inter] space-x-10 mb-1'><Smartphone size={15} /> {user.mobile}</div>
                                <div className='flex items-center text-xs text-gray-600 font-[inter] space-x-10 mb-1'><Mail size={15} />{user.email}</div>
                                <div className='flex items-center text-xs text-gray-600 font-[inter] space-x-10 mb-1'><MapPin size={15} />{user.address}</div>
                                <div className={`${!user.nextPayment || user.nextPayment < new Date() ? "border-yellow-600 bg-yellow-800 text-white" : "border-green-600 bg-green-800 text-white"}  px-4 py-2 rounded-full  font-bold  border border-green-900 text-center items-center text-xs font-[inter]`}>
                                    {!user.nextPayment || user.nextPayment < new Date() ? "Payment Due" : "Active"}
                                </div>

                                <Link className='my-2 flex w-full justify-center' to='/student-id'>

                                    <button type='submit' className='p-2 w-md border rounded-md flex w-full justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                                        <div className='flex items-center'>
                                            <Fingerprint size={17} className='mr-2' />View Id Card</div>
                                    </button>
                                </Link>

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
                                    <div className='font-[inter]'><span className='font-semibold'>Name</span>:- {user.name}</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Gender</span>:- {user.gender}</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Father's Name</span>:- {user.father}</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Guardian Mobile No.</span>:- {user.guardian}</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Date Of Birth</span>:- {formatDate(user.dob)}</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Aadhar No.</span>:- {user.aadhar}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='p-4'>
                        <div className='rounded-md bg-white shadow-lg p-2'>
                            <div className='font-[inter] text-lg font-semibold  border-l-yellow-300 border-l-4 pl-1 my-2'>Additional Detail</div>
                            <div className='flex flex-col md:flex-row gap-2 px-4'>
                                <div className='flex flex-col'>
                                    <div className='font-[inter]'><span className='font-semibold'>Seat No</span>:- {user.seatNumber}</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Shift</span>:- {user.shift}</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Timming</span>:- {user.time}</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Preparing For</span>:-{user.preparingFor}</div>
                                    <div className='font-[inter]'><span className='font-semibold'>Admission Date</span>:- {formatDate(user.admissionDate)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='rounded-md bg-white shadow-lg p-2'>
                        <div className='font-[inter] text-lg font-semibold  border-l-red-700 border-l-4 pl-1 my-2'>Payment Detail</div>
                        <div className="overflow-x-auto">
                            <table className='min-w-full divide-y divide-gray-200'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Payment Date</th>
                                        <th className='px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Next Payment</th>
                                        <th className='px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Amount</th>
                                        <th className='px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Months Paid For</th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200'>
                                    {!payment ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4">
                                                <CircularLoading size={50} />
                                            </td>
                                        </tr>
                                    ) : (
                                        Array.isArray(payment) && payment.map((pay) => (
                                            <tr key={pay._id}>
                                                <td className='px-2 py-4 whitespace-nowrap'>{formatDate(pay.payment_date)}</td>
                                                <td className='px-2 py-4 whitespace-nowrap'>{formatDate(user.nextPayment)}</td>
                                                <td className='px-2 py-4 whitespace-nowrap'>{pay.amount}</td>
                                                <td className='px-2 py-4 whitespace-nowrap'>{pay.months_paid_for}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


            </div>

            {/* </SideBar > */}
        </>
    )
}
