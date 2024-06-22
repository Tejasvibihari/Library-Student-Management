import React from 'react'
import SideBar from '../components/Sidebar'
import StudentAdmissionForm from '../components/StudentAdmissionForm'

export default function StudentAdmission() {
    return (
        <>
            <SideBar>
                <div>

                    <StudentAdmissionForm />

                </div>
            </SideBar>
        </>
    )
}
