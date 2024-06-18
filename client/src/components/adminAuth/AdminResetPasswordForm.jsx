import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import CircularLoading from '../ui/CircularLoading.jsx';
import client from '../../services/axiosClient.js';

export default function ResetPasswordForm() {
    const [email, setEmail] = useState('')
    const [adminExists, setAdminExists] = useState(false)
    const [progressLoading, setProgressLoading] = useState(false)
    const [otpLoading, setOtpLoading] = useState(null)
    const navigate = useNavigate()

    const chekUser = async () => {
        try {
            setProgressLoading(true)
            const response = await client.post('/api/admin/auth/checkuser', { email })
            setAdminExists(response.data.message)
            setProgressLoading(false)

        } catch (error) {
            console.log(error)
            setProgressLoading(false)
            setAdminExists("")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setOtpLoading(true)
            const response = await client.post('/api/admin/auth/senotp', { email })
            console.log(response)
            setOtpLoading(false)
            navigate("/verifypassword")
        } catch (error) {
            console.log(error)
            setOtpLoading(false)
        }
    }
    return (
        <>
            <div className='bg-gray-200 h-screen'>
                <div className='p-10'>
                    <div className='text-center mb-10'>Bihari Library</div>
                    <div className='border rounded-md max-w-md md:max-w-sm mx-auto p-7 bg-white'>
                        <h3 className='mt-7 text-[#1b2c3f] text-center font-bold text-xl'>Reset Password</h3>
                        <p className='text-[#818995] text-center mt-4 text-sm mb-4'>
                            Welcome & Join us by creating a free account !
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label className='text-[#1b2c3f] text-sm mb-2'>
                                    Email
                                </label>
                                <div className='relative'>
                                    <input
                                        type="text"
                                        placeholder="Email"
                                        value={email}
                                        required
                                        onChange={(e) => { setEmail(e.target.value) }}
                                        onBlur={chekUser}
                                        label="Email"
                                        className={`w-full border p-2 rounded mb-2 ${adminExists ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    <div className='absolute top-2 right-2'>
                                        {progressLoading && <CircularLoading size={28} />}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button type='submit' className='bg-[#8e54e9] hover:bg-[#8e54e9e6] text-white w-full mt-4 rounded-md p-3 font-semibold'>
                                    {otpLoading ? <CircularLoading size={28} /> : "Send OTP"}
                                </button>
                            </div>
                            <div className='flex justify-center items-center text-sm text-[#818995] mt-2'>
                                Remembered your password ? <Link to='/signin' className='px-2 text-[#8e54e9] underline cursor-pointer'>Login</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}