import React, { useEffect, useState } from 'react'
import OverviewCard from './ui/OverviewCard'
import { Link } from 'react-router-dom'

export default function DashboardCard({ allStudent }) {
    const [pendingStudent, setPendingStudent] = useState()
    const [activeStudent, setActiveStudent] = useState()
    const [deactiveStudent, setDeactiveStudent] = useState()
    useEffect(() => {
        const pending = allStudent.filter(student => student.status === "Pending")
        const deactive = allStudent.filter(student => student.status === "Deactive")
        const active = allStudent.filter(student => student.status === "Active")
        console.log(pending.length)
        setPendingStudent(pending.length)
        setActiveStudent(active.length)
        setDeactiveStudent(deactive.length)
    }, [allStudent])
    return (
        <>

            <div className='grid grid-cols-2 gap-2 p-4 md:grid-cols-4 w-full rounded-sm'>
                <div className='flex flex-col gap-4 w-full'>
                    <OverviewCard icon="all" title="Total Student" value={allStudent.length} link="student-detail" />

                </div>
                <div className='flex flex-col gap-4 w-full'>
                    <OverviewCard icon="active" title="Active Student" value={activeStudent} link="student-detail" />
                    {/* <OverviewCard title="Active Student" value={activeStudent} /> */}
                </div>
                <div className='flex flex-col gap-4 w-full'>
                    <OverviewCard icon="pending" title="Pending Student" value={pendingStudent} link="student-detail" />
                    {/* <OverviewCard title="Active Student" value={activeStudent} /> */}
                </div>
                <div className='flex flex-col gap-4 w-full'>
                    <OverviewCard icon="deactive" title="Deactive Student" value={deactiveStudent} link="student-detail" />
                    {/* <OverviewCard title="Active Student" value={activeStudent} /> */}
                </div>
            </div>

        </>
    )
}
