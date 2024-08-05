import React from 'react'
import { Link } from 'react-router-dom'
import { Users } from 'lucide-react';


export default function OverviewCard({ title, value }) {
    return (
        <>
            <div className='p-4 bg-white max-w-96 border'>
                <div className='grid grid-cols-2'>
                    <div>
                        <p className='text-[#818995] font-semibold font-[inter] text-sm my-2'>
                            {title}
                        </p>
                        <div className='text-[#1b2c3f] font-bold font-[inter] text-xl my-2'>
                            {value}
                        </div>
                    </div>
                    <div className='flex justify-end p-3'>
                        <Users size={30} />
                    </div>
                </div>
                <div className='flex justify-end'>
                    <Link className='text-[#818995] font-semibold font-[inter] text-sm underline'>
                        View More
                    </Link>
                </div>
            </div>
        </>
    )
}
