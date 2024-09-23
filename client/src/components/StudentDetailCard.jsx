import { useState } from 'react';
import { CrossIcon, Instagram, Trash, MonitorCheck } from 'lucide-react';
import { Youtube } from 'lucide-react';
import { Facebook } from 'lucide-react';
import { Link } from "react-router-dom";
import { UserCog, ReceiptText } from 'lucide-react';
import ReportIcon from '@mui/icons-material/Report';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';
import formatDate from '../utils/FormateDate';
import client from '../services/axiosClient';

export default function StudentDetailCard({ studentId, sid, src, facebookLink, instaLink, youtubeLink, othLink, name, email, mobile, father, guardian, gender, addmissionDate, shift, time, address, lastPayment, paymentAmount, nextPayment, seatNumber, status }) {
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
        try {
            setLoading(true);
            const res = await client.get(`/api/student/delete`, {
                params: {
                    studentId,
                }
            });
            console.log(res);
            setLoading(false);
            setShowDeleteDialog(false); // Close the dialog after deletion
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };


    return (
        <>
            <div className='border shadow-md rounded-md w-full hello'>
                <div className='text-white p-4'>
                    <div className='flex flex-col md:flex-row justify-between items-center'>
                        {/* Profile Image */}
                        <div>
                            <img src={`${src}`} className='w-32 rounded-full shadow-sm shadow-white border' />
                            <div className='text-center'>{sid}</div>
                        </div>
                        <div className='flex flex-col border border-gray-500 shadow-md rounded-md p-2'>
                            <div>
                                <span className='font-semibold font-[inter] text-sm leading-6'>Last Payment:- <span className='font-normal text-gray-100'>{formatDate(lastPayment)}</span></span>
                            </div>
                            <div>
                                <span className='font-semibold font-[inter] text-sm leading-6'>Next Payment:- <span className='font-normal text-gray-100'>{formatDate(nextPayment)}</span></span>
                            </div>
                            <div className='mt-4'>
                                <div className={`border rounded-full p-1 text-center ${status === "Active" ? "border-green-600 bg-green-800" : status === "Pending" ? "border-yellow-600 bg-yellow-800" : "border-red-600 bg-red-800"}  flex items-center justify-center`}>
                                    {status}
                                    <span className='ml-2 mr-2'>
                                        {status === "Active" ? <DoneIcon /> : status === "Pending" ? <ReportIcon /> : <CancelIcon />}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col leading-3 text-right'>
                            {/* Dates Section */}
                            <span className='font-semibold font-[inter] text-sm leading-6'>Addmission Date:- <span className='font-normal text-gray-100'>{formatDate(addmissionDate)}</span></span>
                            <span className='font-semibold font-[inter] text-sm leading-6'>Seat No:- <span className='font-normal text-gray-100'>{seatNumber}</span></span>
                            <span className='font-semibold font-[inter] text-sm leading-6'>Time:- <span className='font-normal text-gray-100'>{time} </span></span>
                            <span className='font-semibold font-[inter] text-sm leading-6'>Shift:- <span className='font-normal text-gray-100'>{shift}</span></span>
                            <div>
                                <span className='font-semibold font-[inter] text-sm leading-6'>Amount:- <span className='font-normal text-gray-100'>{paymentAmount}</span></span>
                            </div>
                        </div>
                    </div>
                    {/* Top Section With Profile End */}
                    {/* Personal Detail Start Here */}
                    <div className='border border-gray-500 p-2 rounded-md shadow-md mt-2'>
                        <div className='flex flex-col md:flex-row justify-between'>
                            <div className='flex flex-col'>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Name:-
                                    <span className='font-normal text-gray-100'>
                                        {name}
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    S/0:-
                                    <span className='font-normal text-gray-100'>
                                        {father}
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Email:-
                                    <span className='font-normal text-gray-100'>
                                        {email}
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Mobile:-
                                    <span className='font-normal text-gray-100'>
                                        {mobile}
                                    </span>
                                </span>
                            </div>
                            {/* Gender and Address */}
                            <div className='flex flex-col'>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Gender:-
                                    <span className='font-normal text-gray-100'>
                                        {gender}
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Guardian Mobile:-
                                    <span className='font-normal text-gray-100'>
                                        {guardian}
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Address:-
                                    <span className='font-normal text-gray-100'>
                                        {address}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Personal detail end Here */}
                    <div className='flex justify-end mt-2'>


                        {status !== "Trash" &&
                            <div className='mx-1'>
                                <button
                                    onClick={() => setShowDeleteDialog(true)}
                                    className='p-2 w-full rounded-md flex justify-center items-center text-white bg-[#962041] hover:bg-[#8e54e9e6]'>
                                    <Trash size={17} className='mr-2' />Delete Student
                                </button>
                            </div>
                        }
                        <div className='mx-1'>
                            <Link to={`/student-admin-dashboard/${studentId}`}>
                                <button className='p-2 w-full rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                                    <ReceiptText size={17} className='mr-2' />Payment Detail
                                </button>
                            </Link>
                        </div>
                        <div className='mx-1'>
                            <Link to={`/student-update/${studentId}`}>
                                <button className='p-2 w-full rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                                    <UserCog size={17} className='mr-2' />Update Student
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='bg-white p-4 rounded-md shadow-md'>
                        <h2 className='text-lg font-semibold'>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this student?</p>
                        <div className='flex justify-end mt-4'>
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                className='mr-2 p-2 rounded-md bg-gray-300 hover:bg-gray-400'>
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className='p-2 rounded-md bg-red-600 text-white hover:bg-red-700'>
                                {loading ? 'Deleting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}