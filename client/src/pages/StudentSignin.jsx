import React from 'react'
import StudentSigninForm from '../components/studentAuth/StudentSigninForm'

export default function StudentSignin() {
    return (
        <div className='grid grid-cols-2'>
            <div>
                <img src='./img/librarys.webp' />
            </div>
            <StudentSigninForm />
        </div>
    )
}
