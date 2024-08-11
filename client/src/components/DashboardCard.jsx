import React, { useEffect, useState } from 'react'
import OverviewCard from './ui/OverviewCard'
import { Link } from 'react-router-dom'

export default function DashboardCard({ allStudent }) {
    const [pendingStudent, setPendingStudent] = useState()
    const [activeStudent, setActiveStudent] = useState()
    useEffect(() => {
        const pending = allStudent.filter(student => student.nextPayment < new Date() || student.nextPayment == null)
        const active = allStudent.filter(student => student.nextPayment >= new Date())
        console.log(pending.length)
        setPendingStudent(pending.length)
        setActiveStudent(active.length)
    }, [allStudent])
    return (
        <>
            <div className='grid grid-cols-3 my-4'>
                <div className='flex gap-4 p-2 my-4 col-span-2 w-full rounded-sm'>
                    <div className='flex flex-col gap-4 w-full'>
                        <OverviewCard icon="Users" title="Total Student" value={allStudent.length} />

                    </div>
                    <div className='flex flex-col gap-4 w-full'>
                        <OverviewCard icon="CalendarArrowDown" title="Pending Student" value={pendingStudent} />
                        {/* <OverviewCard title="Active Student" value={activeStudent} /> */}
                    </div>
                </div>
                <div>
                    <div className='rounded-sm bg-white'>
                        <div className='flex items-center justify-between'>

                            <div className='text-[#1b2c3f] p-4 font-semibold font-[inter]'>
                                New Admission
                            </div>
                            <Link className='p-4 text-[#818995] font-semibold text-xs underline font-[inter]'>
                                View All
                            </Link>
                        </div>
                        <hr />
                        <div>
                            <div className='flex items-center gap-4 p-4 w-full'>
                                <div className=''>
                                    <img src='./img/idDp.jpg' className='rounded-full' width='50px' />
                                </div>
                                <div className='flex justify-between w-full'>
                                    <div className='text-[#1b2c3f] font-bold font-[inter] my-2'>
                                        Tejasvi Kumar
                                    </div>
                                    <div className=' my-2'>
                                        Status
                                    </div>
                                    <div className='text-[#1b2c3f] font-bold font-[inter] my-2'>
                                        10th
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}
