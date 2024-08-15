import React, { useEffect, useState } from 'react';
import { MailPlus, Search } from 'lucide-react';
import Avatar from '@mui/material/Avatar';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Make sure to install axios
import client from '../services/axiosClient';
import { useSelector } from 'react-redux';


export default function EmailDetail() {
    const [emailDetails, setEmailDetails] = useState(null);
    const adminId = useSelector(state => state.admin.currentAdmin._id)
    console.log(adminId)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await client.get('/api/mail/getmail', { params: { adminId } }); // Adjust the URL as needed
                setEmailDetails(response.data);
                console.log(response)
            } catch (error) {
                console.error('Error fetching email details:', error);
            }
        };

        fetchData();
    }, []);

    if (!emailDetails) return <div>Loading...</div>;
    return (
        <>

            <div className='grid md:grid-cols-3 gap-3'>
                <div>
                    <div className='p-2 pb-3 bg-white rounded-lg shadow-lg'>
                        <div className='border-b py-3'>
                            <Link to="/sendemail">
                                <button className='p-2 w-full border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                                    <MailPlus size={17} className='mr-2' />Compose Mail
                                </button>
                            </Link>
                        </div>
                        <div>
                            <h3 className='font-[inter] text-gray-500 font-semibold text-sm py-2 border-b border-l-2 pl-2 border-l-green-600'>
                                MAILS
                            </h3>
                            <div className='py-3 relative border-b'>
                                <input
                                    type='text'
                                    placeholder='Search Email'
                                    className='p-1 w-full shadow-md rounded-xl px-2 border' />
                                <div className='absolute top-5 right-2 cursor-pointer'>
                                    <Search size={15} />
                                </div>
                            </div>
                            <div className='overflow-auto h-[26rem]'>
                                {emailDetails.reverse().map((data, i) => {
                                    return (
                                        <div key={i} className='border-b'>
                                            <div className='grid grid-cols-5 py-2 cursor-pointer'>
                                                <Avatar alt={data.name} src={`http://api.biharilibrary.in/uploads/${data.image}`} />
                                                <div className='col-span-4'>
                                                    <div className='flex justify-between'>
                                                        <p className='text-sm'>
                                                            {data.name}
                                                        </p>
                                                        <span className='text-sm text-gray-500'>
                                                            {/* {data.sentAt} */}
                                                        </span>
                                                    </div>
                                                    <div className='flex flex-col justify-between mt-1'>
                                                        <p className='text-sm font-semibold'>
                                                            {data.subject}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-span-2'>
                    <div className='p-4 bg-white shadow-lg rounded-md h-[37rem]'>
                        <div className='flex items-center justify-between border-b pb-2'>
                            <div className='flex items-center'>
                                <div>
                                    <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                                </div>
                                <div className='flex flex-col ml-2'>
                                    <h3 className='font-semibold text-[inter]'>
                                        Sujika
                                    </h3>
                                    <p className='text-sm text-gray-500'>
                                        tejasvibihari2000@gmail.com
                                    </p>
                                </div>
                            </div>
                            <div className='text-right'>
                                <p className='text-sm font-normal '>10 July 2024 </p>
                                <p className='text-sm text-gray-500'>10:10AM </p>
                            </div>
                        </div>
                        <div className='p-2 overflow-auto'>
                            <h1 className='text-lg font-semibold'>
                                History of planets are discovered yesterday.
                            </h1>
                            <div className='mt-4'>
                                Hi, Json Taylor Greetings 🖐

                                Earth, our home, is the third planet from the sun. While scientists continue to hunt for clues of life beyond Earth, our home planet remains the only place in the universe where we've ever identified living organisms. .

                                Earth has a diameter of roughly 8,000 miles (13,000 kilometers) and is mostly round because gravity generally pulls matter into a ball. But the spin of our home planet causes it to be squashed at its poles and swollen at the equator, making the true shape of the Earth an "oblate spheroid.".

                                Regards,
                                Michael Jeremy
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </>
    )
}
