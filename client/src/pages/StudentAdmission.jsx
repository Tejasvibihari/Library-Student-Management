import React from 'react'
import SideBar from '../components/Sidebar'
import StudentAdmissionForm from '../components/StudentAdmissionForm'

export default function StudentAdmission() {
    return (
        <>
            <SideBar>
                <div className='grid grid-cols-3 gap-4'>
                    <div className='col-span-2'>
                        <StudentAdmissionForm />
                    </div>
                    <div>
                        Hello
                    </div>
                </div>
            </SideBar>
        </>
    )
}
