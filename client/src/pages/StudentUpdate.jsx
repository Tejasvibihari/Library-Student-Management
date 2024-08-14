import React from 'react'
import SideBar from '../components/Sidebar'
import StudentUpdateForm from '../components/StudentUpdateForm'
import Breadcrumbs from '../components/Breadcrumbs'

export default function StudentUpdate() {
    return (
        <>
            {/* <SideBar> */}
                <Breadcrumbs title="Student Update" subTitle="Student" />
                <StudentUpdateForm />
            {/* </SideBar> */}
        </>
    )
}
