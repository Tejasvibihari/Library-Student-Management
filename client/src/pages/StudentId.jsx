import React from 'react'
import StudentIdCard from '../components/StudentIdCard'
import { useSelector } from 'react-redux'
import formatDate from '../utils/FormateDate'

export default function StudentId() {
    const user = useSelector(state => state.student.currentStudent)

    return (
        <div className='grid grid-cols-1 w-full p-4 mt-4'>
            <StudentIdCard
                sid={user.sid}
                name={user.name}
                father={user.father}
                mobile={user.mobile}
                village={user.address}
                preparingFor={user.preparingFor}
                addmissionDate={formatDate(user.admissionDate)}
                image={`https://api.biharilibrary.in/uploads/${user.image}`}
            />
        </div>
    )
}
