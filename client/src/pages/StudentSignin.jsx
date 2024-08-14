import React from 'react'
import StudentSigninForm from '../components/studentAuth/StudentSigninForm'

export default function StudentSignin() {
    return (
        <div className='grid md:grid-cols-2 grid-cols-1'>
            <div className="hidden md:flex">
                <img src='./img/librarys.webp' />
            </div>
            <StudentSigninForm />
        </div>
    )
}
