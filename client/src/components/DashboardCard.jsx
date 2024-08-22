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

            <div className='grid grid-cols-2 gap-2 p-4 md:grid-cols-4 w-full rounded-sm'>
                <div className='flex flex-col gap-4 w-full'>
                    <OverviewCard icon="Users" title="Total Student" value={allStudent.length} link="student-detail" />

                </div>
                <div className='flex flex-col gap-4 w-full'>
                    <OverviewCard icon="CalendarArrowDown" title="Pending Student" value={pendingStudent} link="student-detail" />
                    {/* <OverviewCard title="Active Student" value={activeStudent} /> */}
                </div>
            </div>

        </>
    )
}
