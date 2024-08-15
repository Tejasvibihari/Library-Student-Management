import { CrossIcon, Instagram, } from 'lucide-react';
import { Youtube } from 'lucide-react';
import { Facebook } from 'lucide-react';
import { Link } from "react-router-dom";
import { UserCog, ReceiptText } from 'lucide-react';
import ReportIcon from '@mui/icons-material/Report';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';
import formatDate from '../utils/FormateDate';
import { useEffect, useState } from 'react';

export default function StudentDetailCard({ studentId, sid, src, facebookLink, instaLink, youtubeLink, othLink, name, email, mobile, father, guardian, gender, preparingFor, addmissionDate, shift, time, dob, aadhar, address, lastPayment, paymentAmount, nextPayment, seatNumber }) {
    const [status, setStatus] = useState('Pending');

    useEffect(() => {
        const handleStatusChange = () => {
            if (!nextPayment || nextPayment < new Date()) {
                setStatus('Payment Due')
            } else {
                setStatus('Active')
            }
        }
        handleStatusChange()
    }, [nextPayment])

    return (
        <>
            <div className='border shadow-md rounded-md w-full hello'>
                <div className='text-white p-4'>
                    <div className='flex flex-col md:flex-row justify-between items-center'>
                        {/* Proile Image  */}
                        <div>
                            {/* <img src={`http://localhost:3000/uploads/${src}`} className='w-32 rounded-full shadow-sm shadow-white border' /> */}
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
                                <div className={`border rounded-full p-1 text-center ${status === "Active" ? "border-green-600 bg-green-800" : status === "Payment Due" ? "border-yellow-600 bg-yellow-800" : "border-red-600 bg-red-800"}  flex items-center justify-center`}>
                                    {status}
                                    <span className='ml-2 mr-2'>
                                        {status === "Active" ? <DoneIcon /> : status === "Payment Due" ? <ReportIcon /> : <CancelIcon />}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col leading-3 text-right'>
                            {/* Dates Section  */}
                            <span className='font-semibold font-[inter] text-sm leading-6'>Addmission Date:- <span className='font-normal text-gray-100'>{formatDate(addmissionDate)}</span></span>
                            <span className='font-semibold font-[inter] text-sm leading-6'>Seat No:- <span className='font-normal text-gray-100'>{seatNumber}</span></span>
                            <span className='font-semibold font-[inter] text-sm leading-6'>Time:- <span className='font-normal text-gray-100'>{time} </span></span>
                            <span className='font-semibold font-[inter] text-sm leading-6'>Shift:- <span className='font-normal text-gray-100'>{shift}</span></span>
                            <div>
                                <span className='font-semibold font-[inter] text-sm leading-6'>Amount:- <span className='font-normal text-gray-100'>{paymentAmount}</span></span>

                            </div>
                            {/* Social Media Link Section Start  */}
                            {/* <div className="flex justify-around items-center w-60 border border-gray-500 shadow-md p-2 rounded-md">
                                <Link to={`https://www.instagram.com/${facebookLink}`}>
                                    <div className="p-1 border rounded-full border-white">
                                        <Facebook size={15} />
                                    </div>
                                </Link>
                                <Link to={`https://www.instagram.com/${instaLink}`}>
                                    <div className="p-1 border rounded-full border-white">
                                        <Instagram size={15} />
                                    </div>
                                </Link>
                                <Link to={`https://www.instagram.com/${youtubeLink}`}>
                                    <div className="p-1 border rounded-full border-white">
                                        <Youtube size={15} />
                                    </div>
                                </Link>
                                <Link to={`https://www.instagram.com/${othLink}`}>
                                    <div className="p-1 border rounded-full border-white">
                                        <Facebook size={15} />
                                    </div>
                                </Link>
                            </div> */}
                            {/* Social Media Link End  */}
                        </div>
                    </div>
                    {/* Top Section With frofile End  */}
                    {/* Personal Detail Start Here  */}
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
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Aadhar:-
                                    <span className='font-normal text-gray-100'>
                                        {aadhar}
                                    </span>
                                </span>
                            </div>
                            {/* Gender nad Address  */}
                            <div className='flex flex-col'>
                                <span className='font-semibold font-[inter] text-sm leading-6'>Preparing For:- <span className='font-normal text-gray-100'>{preparingFor}</span></span>

                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Gender:-
                                    <span className='font-normal text-gray-100'>
                                        {gender}
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>DOB:- <span className='font-normal text-gray-100'>{formatDate(dob)} </span></span>

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
                    {/* Presonal detail end Here   */}
                    <div className='flex justify-end mt-2'>
                        <div className='mx-1'>
                            <Link to={`/student-admin-dashboard/${studentId}`}>
                                <button className='p-2 w-full  rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                                    <ReceiptText size={17} className='mr-2' />Payment Detail
                                </button>
                            </Link>
                        </div>
                        <div className='mx-1'>
                            <Link to={`/student-update/${studentId}`}>
                                <button className='p-2 w-full  rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                                    <UserCog size={17} className='mr-2' />Update Student
                                </button>
                            </Link>
                        </div>
                        {/* <div className='mx-1'>
                            <button className='p-2 w-full border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                                <MailPlus size={17} className='mr-2' />Compose Mail
                            </button>
                        </div> */}

                    </div>
                </div>

            </div >
        </>
    )
}
