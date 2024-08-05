
import SideBar from '../components/Sidebar'
import Breadcrumbs from '../components/Breadcrumbs'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import client from '../services/axiosClient'
import CircularLoading from '../components/ui/CircularLoading'
import { loadStripe } from '@stripe/stripe-js';

export default function IndividualPayment() {
    const [studentData, setStudentData] = useState({})
    const [loading, setLoading] = useState(false)

    const { _id } = useParams()
    useEffect(() => {
        const getData = async () => {
            const response = await client.get("/api/student/getstudent", {
                params: { _id }
            })
            setStudentData(response.data)
        }
        getData()
    })

    const makePayment = async () => {
        setLoading(true)
        try {
            const stripe = await loadStripe('pk_test_51O6UlBSDEHgQOqxIWLAdUy36073N1Y5TwalsRza6sVcgBoYnqQdkIfMioC1L0hy4V0t5x54iLjdQamwdFwoiJS2g00fCQAVYtB');
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }
    return (
        <div>
            <SideBar>
                <Breadcrumbs title="Checkout" subTitle="Payment" />

                <div className='grid grid-cols-6 gap-4'>
                    <div className='col-span-4'>
                        <div className='p-4 shadow-lg rounded-md'>
                            <div className='py-2'>
                                <h1 className='font-[inter] border-l-4 border-green-700 pl-2'>Personal Detail</h1>
                            </div>
                            <hr className='' />
                            <div className='my-4 flex gap-4'>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Name</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.name}</h2>
                                </div>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Email</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.email}</h2>
                                </div>
                            </div>
                            <div className='my-4 flex gap-4'>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Phone</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.mobile}</h2>
                                </div>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Address</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.village}, {studentData.block}, {studentData.district} - {studentData.pincode}</h2>
                                </div>
                            </div>
                            <div className='my-4 flex gap-4'>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Gender</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.gender}</h2>
                                </div>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Aadhar</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.aadhar}</h2>
                                </div>
                            </div>
                            <div className='my-4 flex gap-4'>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Date of Birth</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.dob}</h2>
                                </div>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Preparing For</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.preparingFor}</h2>
                                </div>
                            </div>
                            <div className='py-2'>
                                <h1 className='font-[inter] border-l-4 border-red-700 pl-2'>Guardian Detail</h1>
                            </div>
                            <hr className='' />
                            <div className='my-4 flex gap-4'>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Father's Name</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.father}</h2>
                                </div>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Guardian Mobile No.</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.guardian}</h2>
                                </div>
                            </div>
                            <div className='py-2'>
                                <h1 className='font-[inter] border-l-4 border-red-700 pl-2'>Social Link</h1>
                            </div>
                            <hr className='' />
                            <div className='my-4 flex gap-4'>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Instagram</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.instagram}</h2>
                                </div>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Facebook</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.facebook}</h2>
                                </div>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Youtube</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.youtube}</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-span-2'>
                        <div className='p-4 shadow-lg rounded-md'>
                            <div className='py-2'>
                                <h1 className='font-[inter] border-l-4 border-yellow-700 pl-2'>
                                    Payment Detail
                                </h1>
                                <hr className='' />
                                <div className='my-4 flex gap-4'>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Shift From</h3>
                                        <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.shiftFrom}</h2>
                                    </div>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Shift To</h3>
                                        <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.shiftTo}</h2>
                                    </div>
                                </div>
                                <div className='my-4 flex gap-4'>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Last Payment Date</h3>
                                        <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.lastPayment}</h2>
                                    </div>
                                </div>
                                <div className='my-4 flex gap-4'>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Enter Payment Date</h3>
                                        {/* <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.lastPayment}</h2> */}
                                        <input className='font-semibold text-sm text-[#1b2c3f] font-[inter] w-full' type='date' placeholder='Enter Payment Date' />
                                    </div>
                                </div>
                                <div className='my-4 flex gap-4'>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Amount</h3>
                                        {/* <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.lastPayment}</h2> */}
                                        <input className='font-semibold text-sm text-[#1b2c3f] font-[inter] w-full' type="number" placeholder='Enter Amount' />
                                    </div>
                                </div>
                                <button onClick={makePayment} type='submit' className='p-2 w-full border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                                    {loading ? <div className='flex items-center justify-center'><span className='mr-2'>Please Wait..</span><CircularLoading size={25} /></div> :
                                        <div className='flex items-center'>
                                            {/* <UserPlus size={17} className='mr-2' />Update Student</div>} */}
                                            Checkout</div>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SideBar>
        </div >
    )
}
