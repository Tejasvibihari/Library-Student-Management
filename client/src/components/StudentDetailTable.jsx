import { Instagram, } from 'lucide-react';
import { Youtube } from 'lucide-react';
import { Facebook } from 'lucide-react';
import { Link } from "react-router-dom";
import { UserCog } from 'lucide-react';
import Chip from '@mui/material/Chip';
import DoneIcon from '@mui/icons-material/Done';
export default function StudentDetailTable() {
    return (
        <>
            <div className='border shadow-md rounded-md w-full hello'>
                <div className='text-white p-4'>
                    <div className='flex justify-between items-center'>
                        {/* Proile Image  */}
                        <div>
                            <img src='./img/idDp.jpg' className='w-32 rounded-full shadow-sm shadow-white border' />
                        </div>
                        <div className='flex flex-col border border-gray-500 shadow-md rounded-md p-2'>
                            <div>
                                <span className='font-semibold font-[inter] text-sm leading-6'>Payment Date:- <span className='font-normal text-gray-100'>10 July 2024</span></span>
                            </div>
                            <div className='mt-4'>
                                <div className='border rounded-full p-1 text-center border-green-600 bg-green-800 flex items-center justify-center '>
                                    Active
                                    <span className='ml-2 mr-2'>
                                        <DoneIcon />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col leading-3 text-right'>
                            {/* Dates Section  */}
                            <span className='font-semibold font-[inter] text-sm leading-6'>Addmission Date:- <span className='font-normal text-gray-100'>10 July 2024</span></span>
                            <span className='font-semibold font-[inter] text-sm leading-6'>Preparing For:-<span className='font-normal text-gray-100'>10 July 2024</span></span>
                            <span className='font-semibold font-[inter] text-sm leading-6'>DOB:-<span className='font-normal text-gray-100'>10:00 - 12:00 </span></span>
                            <span className='font-semibold font-[inter] text-sm leading-6'>Shift:-<span className='font-normal text-gray-100'>10:00 - 12:00 </span></span>
                            {/* Social Media Link Section Start  */}
                            <div className="flex justify-around items-center w-60 border border-gray-500 shadow-md p-2 rounded-md">
                                <Link to="https://www.instagram.com/">
                                    <div className="p-1 border rounded-full border-white">
                                        <Facebook size={15} />
                                    </div>
                                </Link>
                                <Link to="">
                                    <div className="p-1 border rounded-full border-white">
                                        <Instagram size={15} />
                                    </div>
                                </Link>
                                <Link to="">
                                    <div className="p-1 border rounded-full border-white">
                                        <Youtube size={15} />
                                    </div>
                                </Link>
                                <Link to="">
                                    <div className="p-1 border rounded-full border-white">
                                        <Facebook size={15} />
                                    </div>
                                </Link>
                            </div>
                            {/* Social Media Link End  */}
                        </div>
                    </div>
                    {/* Top Section With frofile End  */}
                    {/* Personal Detail Start Here  */}
                    <div className='border border-gray-500 p-2 rounded-md shadow-md mt-2'>
                        <div className='flex justify-between'>
                            <div className='flex flex-col'>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Name:-
                                    <span className='font-normal text-gray-100'>
                                        Tejasvi Kumar
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    S/0:-
                                    <span className='font-normal text-gray-100'>
                                        Manoj Kumar
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Email:-
                                    <span className='font-normal text-gray-100'>
                                        tejasvibihari2000@gmail.com
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Mobile:-
                                    <span className='font-normal text-gray-100'>
                                        6205731150
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Aadhar:-
                                    <span className='font-normal text-gray-100'>
                                        6205731150
                                    </span>
                                </span>
                            </div>
                            {/* Gender nad Address  */}
                            <div className='flex flex-col'>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Gender:-
                                    <span className='font-normal text-gray-100'>
                                        Male
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Guardian Mobile:-
                                    <span className='font-normal text-gray-100'>
                                        9905424292
                                    </span>
                                </span>
                                <span className='font-semibold font-[inter] text-sm leading-6'>
                                    Address:-
                                    <span className='font-normal text-gray-100'>
                                        Amarpura Naubatpur,<br /> Patna 801109
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Presonal detail end Here   */}
                    <div className='flex justify-end mt-2'>
                        <div className='mx-1'>
                            <button className='p-2 w-full  rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                                <UserCog size={17} className='mr-2' />Update Student
                            </button>
                        </div>
                        {/* <div className='mx-1'>
                            <button className='p-2 w-full border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                                <MailPlus size={17} className='mr-2' />Compose Mail
                            </button>
                        </div> */}

                    </div>
                </div>

            </div>
        </>
    )
}
