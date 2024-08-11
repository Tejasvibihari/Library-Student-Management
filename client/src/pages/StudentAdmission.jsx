import React, { useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import StudentAdmissionForm from '../components/StudentAdmissionForm'
import NewAdmissionForm from '../components/NewAdmissionForm';
import OldAdmissionForm from '../components/OldAdmissionForm';

export default function StudentAdmission() {
    const [selectedButton, setSelectedButton] = useState(true);

    const toggleSelectedButton = (option) => {
        if (option === "New") {
            setSelectedButton(true)
        }
        if (option === "Old") {
            setSelectedButton(false)
        }
    };
    return (
        <>
            <Breadcrumbs title="Admission Form" subTitle="Student" />
            <div className='flex gap-4 p-4 bg-white justify-center items-center mx-auto'>
                <div onClick={() => toggleSelectedButton("New")} className={`${selectedButton === true ? "bg-[#8e54e9] hover:bg-[#8e54e9e6] text-white" : "border border-[#8e54e9] text-[#8e54e9]"} py-4 px-3 rounded-md font-[inter] cursor-pointer`}>New Registration</div>
                <div onClick={() => toggleSelectedButton("Old")} className={`${selectedButton === false ? "bg-[#8e54e9] hover:bg-[#8e54e9e6] text-white" : "border border-[#8e54e9] text-[#8e54e9]"} py-4 px-3 rounded-md font-[inter] cursor-pointer`}>Old Registration</div>
            </div >

            {selectedButton === true ? <NewAdmissionForm /> : <OldAdmissionForm />}
        </>
    )
}
