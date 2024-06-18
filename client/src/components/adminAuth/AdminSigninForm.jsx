import React, { useState, useEffect } from 'react'
import { EyeOff, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import client from '../../services/axiosClient';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signInFailure, signInStart, signInSuccess } from '../../models/admin/adminAuthSlice';
import CircularLoading from '../ui/CircularLoading';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


export default function SigninForm() {
    const loading = useSelector(state => state.admin.loading)
    const error = useSelector(state => state.admin.error)
    const navigate = useNavigate()

    console.log(error)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const dispatch = useDispatch()


    const [snackOpen, setSnackOpen] = useState(false);

    const handleSnackOpen = () => {
        setSnackOpen(true);
    };

    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackOpen(false);
    };

    const handlePasswordShow = () => {
        setShowPassword(!showPassword)
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            dispatch(signInStart())
            const formData = { email, password }
            const response = await client.post('/api/admin/auth/signin', formData)
            console.log(response.data.result)
            dispatch(signInSuccess(response.data.result))
            navigate('/')
        } catch (error) {

            if (error.response && error.response.data) {
                dispatch(signInFailure(error.response.data.message));
                handleSnackOpen()
            } else if (error.message) {
                dispatch(signInFailure(error.message));
                handleSnackOpen()
            }
        }
    }


    return (
        <>
            <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
                <Alert
                    onClose={handleSnackClose}
                    severity={error === "User not found" || error === "Invalid credentials" ? "warning" : "error"}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar >
            <div className='bg-gray-200 h-screen'>
                <div className='p-10'>
                    <div className='text-center mb-10'>Bihari Library</div>
                    <div className='border rounded-md max-w-md md:max-w-sm mx-auto p-7 bg-white'>
                        <h3 className='mt-7 text-[#1b2c3f] text-center font-bold text-xl'>Sign In</h3>
                        <p className='text-[#818995] text-center mt-4 text-sm mb-4'>
                            Welcome & Join us by creating a free account !
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label className='text-[#1b2c3f] text-sm'>
                                    Email
                                </label>
                                <input
                                    type="text"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value) }}
                                    required
                                    label="Email"
                                    className='w-full border p-2 rounded mb-2'
                                />
                            </div>
                            <div>
                                <div className='flex felx-col justify-between'>
                                    <label className='text-[#1b2c3f] text-sm'>
                                        Password
                                    </label>
                                    <Link to="/resetpassword" className='text-[#8e54e9] cursor-pointer text-sm'>
                                        Forget Password ?
                                    </Link>
                                </div>
                                <div className='relative'>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value) }}
                                        required
                                        className='w-full border p-2 rounded'
                                    />
                                    <div className='absolute right-2 top-2 cursor-pointer' onClick={handlePasswordShow}>

                                        {showPassword ? <Eye color="#9e9e9e" /> : <EyeOff color="#9e9e9e" />}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button type='submit' className='bg-[#8e54e9] hover:bg-[#8e54e9e6] text-white w-full mt-4 rounded-md p-3 font-semibold'>
                                    {loading ? <CircularLoading size={28} /> : "Create Account"}
                                </button>
                            </div>
                        </form>

                        <div className='flex justify-center items-center text-sm text-[#818995] mt-2'>
                            Don't have an account? <Link to="/signup" className='px-2 text-[#8e54e9] underline cursor-pointer'>Sign Up</Link>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}