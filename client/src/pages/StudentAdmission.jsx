import React from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import NewAdmissionForm from '../components/NewAdmissionForm';

export default function StudentAdmission() {
    return (
        <>
            <Breadcrumbs title="Admission Form" subTitle="Student" />
            <NewAdmissionForm />
        </>
    )
}