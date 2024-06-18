import React, { useState } from 'react'
import { Link } from 'react-router-dom'
export default function VerifyPasswordForm() {
    const [email, setEmail] = useState('')


    return (
        <>
            <div className='bg-gray-200 h-screen'>
                <div className='p-10'>
                    <div className='text-center mb-10'>Bihari Library</div>
                    <div className='border rounded-md max-w-md md:max-w-sm mx-auto p-7 bg-white'>
                        <h3 className='mt-7 text-[#1b2c3f] text-center font-bold text-xl'>Enter OTP</h3>
                        <p className='text-[#818995] text-center mt-4 text-sm mb-4'>
                            Welcome & Join us by creating a free account !
                        </p>
                        <div>
                            <div>
                                <label className='text-[#1b2c3f] text-sm mb-2'>
                                    OTP
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter 6 Digit OTP"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value) }}
                                    label="Email"
                                    className='w-full border p-2 rounded mb-2'
                                />
                            </div>
                            <div>
                                <button className='bg-[#8e54e9] hover:bg-[#8e54e9e6] text-white w-full mt-4 rounded-md p-3 font-semibold'>
                                    Confirm
                                </button>
                            </div>
                            {/* <div className='flex justify-center items-center text-sm text-[#818995] mt-2'>
                                Remembered your password ? <Link to='/signin' className='px-2 text-[#8e54e9] underline cursor-pointer'>Login</Link>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
