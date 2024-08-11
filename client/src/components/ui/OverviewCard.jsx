import React from 'react'
import { Link } from 'react-router-dom'
import { Users, TrendingDown } from 'lucide-react';
// import { CalendarArrowDown } from 'lucide-react';

export default function OverviewCard({ title, value, icon }) {
    return (
        <>
            <div className='p-4 bg-white border'>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <p className='text-[#818995] font-semibold font-[inter] text-sm my-2'>
                            {title}
                        </p>
                        <div className='text-[#1b2c3f] font-bold font-[inter] text-xl my-2'>
                            {value}
                        </div>
                    </div>
                    <div className='flex justify-end rounded-lg items-center'>
                        <div className={`${icon === 'Users' ? 'bg-green-400' : 'bg-red-500'} p-4 rounded-lg`}>
                            {icon === "Users" ? <Users color="#034f16" size={30} /> : <TrendingDown color="#6f0b0b" size={30} />}
                        </div>

                    </div>
                </div>
                <div className='flex justify-end'>
                    <Link className='text-[#818995] font-semibold font-[inter] text-sm underline'>
                        View More
                    </Link>
                </div>
            </div >
        </>
    )
}
