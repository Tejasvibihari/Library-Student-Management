import React from 'react'
import SideBar from '../components/Sidebar'
import StudentDetailTable from '../components/StudentDetailTable'

export default function StudentDetail() {
    return (
        <>
            <SideBar>
                <h1>Student Detail</h1>
                <div className='grid md:grid-cols-2 grid-cols-1'>
                    <StudentDetailTable />
                </div>
            </SideBar>
        </>
    )
}
