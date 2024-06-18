import React, { useState, useEffect } from 'react'
import { EyeOff, Eye, Asterisk } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../services/axiosClient.js';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { styled } from '@mui/material/styles';
import CircularLoading from '../ui/CircularLoading.jsx';


export default function SignupForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [paswordAlert, setPasswordAlert] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [progressLoading, setProgressLoading] = useState(false)
    const [adminExists, setAdminExists] = useState(false)
    const [openTooltip, setToolTipOpen] = React.useState(false);
    const navigate = useNavigate()

    const handlePasswordShow = () => {
        setShowPassword(!showPassword)
    }
    const handleTooltipClose = () => {
        setToolTipOpen(false);
    };

    const handleTooltipOpen = () => {
        setToolTipOpen(true);
    };
    const chekUser = async () => {
        try {
            setProgressLoading(true)
            const response = await client.post('/api/admin/auth/checkuser', { email })
            console.log(response.data.message)
            setAdminExists(response.data.message)
            handleTooltipOpen()
            setProgressLoading(false)
        } catch (error) {
            console.log(error)
            setProgressLoading(false)
            setAdminExists("")
        }
    }


    useEffect(() => {
        const checkPassword = () => {
            if (password !== confirmPassword) {
                setPasswordAlert('Password Does Not Match')
            }
            if (password == confirmPassword) {
                setPasswordAlert('')
            }
        }
        checkPassword()
    }, [confirmPassword])

    // Send Form Data to Database 
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const formData = { email, password }
            console.log(formData)
            const response = await client.post('/api/admin/auth/signup', formData)
            console.log(response.data.message)
            navigate("/signin")

        } catch (error) {
            console.log(error)
            console.log(error.response.data.message)
        }
    }

    const BootstrapTooltip = styled(({ className, ...props }) => (
        <Tooltip  {...props} arrow classes={{ popper: className }} />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.arrow}`]: {
            color: theme.palette.common.black,
        },
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: theme.palette.common.black,
        },
        [`& .${tooltipClasses.tooltip} .MuiTooltip-tooltip`]: {
            maxWidth: 500,
        },
    }));
    return (
        <>
            <div className='bg-gray-200 h-screen'>
                <div className='p-10'>
                    <div className='text-center mb-10'>Bihari Library</div>
                    <div className='border rounded-md max-w-md md:max-w-sm mx-auto p-7 bg-white shadow-md'>
                        <h3 className='mt-7 text-[#1b2c3f] text-center font-bold text-xl'>Sign Up</h3>
                        <p className='text-[#818995] text-center mt-4 text-sm mb-4'>
                            Welcome & Join us by creating a free account !
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label className='text-[#1b2c3f] text-sm mb-2 flex '>
                                    Email <Asterisk size={12} color="#ff1a1a" strokeWidth={0.75} />
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
                                    <div className='absolute top-8 right-4'>
                                        <ClickAwayListener onClickAway={handleTooltipClose}>
                                            <div>
                                                <BootstrapTooltip
                                                    PopperProps={{
                                                        disablePortal: true,
                                                    }}
                                                    onClose={handleTooltipClose}
                                                    open={open}
                                                    disableFocusListener
                                                    disableHoverListener
                                                    disableTouchListener
                                                    title={adminExists}
                                                >
                                                </BootstrapTooltip>
                                            </div>
                                        </ClickAwayListener>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className='text-[#1b2c3f] text-sm mb-2 flex'>
                                    Password <Asterisk size={12} color="#ff1a1a" strokeWidth={0.75} />
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        required
                                        onChange={(e) => { setPassword(e.target.value) }}
                                        className='w-full border p-2 rounded mb-2'
                                    />
                                    <div className='absolute right-2 top-2 cursor-pointer' onClick={handlePasswordShow}>

                                        {showPassword ? <Eye color="#9e9e9e" /> : <EyeOff color="#9e9e9e" />}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className='text-[#1b2c3f] text-sm mb-2 flex'>
                                    Confirm Password <Asterisk size={12} color="#ff1a1a" strokeWidth={0.75} />
                                </label>
                                <div className='relative mb-4'>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value) }}
                                        className='w-full border p-2 rounded  mb-2'
                                        required
                                    />
                                    <div className='absolute text-sm text-red-700' onClick={handlePasswordShow}>
                                        {paswordAlert}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button type='submit' className='bg-[#8e54e9] hover:bg-[#8e54e9e6] text-white w-full mt-4 rounded-md p-3 font-semibold'>Create Account</button>
                            </div>

                            <div className='flex justify-center items-center text-sm text-[#818995] mt-2'>
                                Already have an account? <Link to='/signin' className='px-2 text-[#8e54e9] underline cursor-pointer'>Sign In</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}