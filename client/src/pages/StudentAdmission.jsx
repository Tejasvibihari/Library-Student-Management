import React from 'react'
import SideBar from '../components/Sidebar'
import StudentAdmissionForm from '../components/StudentAdmissionForm'
import Breadcrumbs from '../components/Breadcrumbs'

export default function StudentAdmission() {
    return (
        <>
            <SideBar>
                <div>
                    <Breadcrumbs title="Student Admission" subTitle="Student" />
                    <StudentAdmissionForm />

                </div>
            </SideBar>
        </>
    )
}
