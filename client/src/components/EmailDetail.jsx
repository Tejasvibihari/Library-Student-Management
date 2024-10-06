import React, { useEffect, useState } from 'react';
import { MailPlus, Search } from 'lucide-react';
import Avatar from '@mui/material/Avatar';
import client from '../services/axiosClient';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CircularLoading from './ui/CircularLoading';
import formatDate from '../utils/FormateDate';
import formatTime from '../utils/formateTime';

export default function EmailDetail() {
    const [emailDetails, setEmailDetails] = useState(null);
    const adminId = useSelector(state => state.admin.currentAdmin._id)
    const [detailMail, setDetailMail] = useState("")
    const [emails, setEmails] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await client.get('/api/mail/getmail', { params: { adminId } }); // Adjust the URL as needed
                setEmailDetails(response.data);

            } catch (error) {
                console.error('Error fetching email details:', error);
            }
        };

        fetchData();
    }, []);
    const viewMail = async (id) => {
        console.log(id)
        setDetailMail(emailDetails.filter(mail => mail._id === id))
        console.log(detailMail)
    }
    useEffect(() => {
        if (emailDetails && emailDetails.length > 0) {
            setEmails(emailDetails.reverse());
        }
    }, [emailDetails]);




    if (!emailDetails) return <div className='flex justify-center items-center'><CircularLoading />Loading... </div>;
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
                            {emails.length === 0 ? (
                                <div className='flex items-center justify-center font-inter font-semibold p-4'>No Email Found</div>
                            ) : (
                                <div className="overflow-auto h-[26rem]">
                                    {emails.map((data, i) => (
                                        <div key={i} className="border-b">
                                            <div onClick={() => viewMail(data._id)} className="grid grid-cols-5 py-2 cursor-pointer">
                                                <Avatar alt={data.name} src={`https://api.biharilibrary.in/uploads/${data.image}`} />
                                                <div className="col-span-4">
                                                    <div className="flex justify-between">
                                                        <p className="text-sm">
                                                            {data.name}
                                                        </p>
                                                        <span className="text-sm text-gray-500">
                                                            {formatDate(data.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col justify-between mt-1">
                                                        <p className="text-sm font-semibold">
                                                            {data.subject}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
                <div className='col-span-2'>
                    {!detailMail ?
                        <div className='flex justify-center items-center font-inter font-semibold p-4 bg-white shadow-lg rounded-md h-[37rem]'>
                            Select Any Chat to See The Detail message
                        </div> :
                        <div className='p-4 bg-white shadow-lg rounded-md h-auto'>
                            <div className='flex items-center justify-between border-b pb-2'>
                                <div className='flex items-center'>
                                    <div>
                                        <Avatar alt="Remy Sharp" src={`https://api.biharilibrary.in/uploads/${detailMail[0].image}`} />
                                    </div>
                                    <div className='flex flex-col ml-2'>
                                        <h3 className='font-semibold text-[inter]'>
                                            {detailMail[0].name}
                                        </h3>
                                        <p className='text-sm text-gray-500'>
                                            {detailMail[0].to}
                                        </p>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm font-normal '> {formatDate(detailMail[0].createdAt)}</p>
                                    <p className='text-sm text-gray-500'>{formatTime(detailMail[0].createdAt)}</p>
                                </div>
                            </div>
                            <div className='p-2 overflow-auto'>
                                <h1 className='text-lg font-semibold'>
                                    {detailMail[0].subject}
                                </h1>
                                <div className='mt-4' dangerouslySetInnerHTML={{ __html: detailMail[0].body }} />
                                {/* <div className='mt-4'>
                                    {detailMail[0].body}
                                </div> */}
                            </div>
                        </div>
                    }

                </div>
            </div >


        </>
    )
}
