
import SideBar from '../components/Sidebar'
import Breadcrumbs from '../components/Breadcrumbs'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import client from '../services/axiosClient'
import CircularLoading from '../components/ui/CircularLoading'
import formatDate from '../utils/FormateDate';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


export default function IndividualPayment() {
    const [studentData, setStudentData] = useState({})
    const [loading, setLoading] = useState(false)
    const [admissionDate, setAdmissionDate] = useState('')
    const { _id } = useParams()

    const [paymentDate, setPaymentDate] = useState('')
    const [paymentFor, setPaymentFor] = useState()
    const [paymentData, setPaymentData] = useState({})
    // SnackBar State 
    const [snackOpen, setSnackOpen] = useState(false);
    const [alertStatus, setAlertStatus] = useState('')
    const handleSnackOpen = () => {
        setSnackOpen(true);
    };
    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackOpen(false);
    };


    function safeFormatDate(dateInput) {
        const date = new Date(dateInput);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    }
    useEffect(() => {
        const getData = async () => {
            const response = await client.get("/api/student/getstudent", {
                params: { _id }
            })
            setStudentData(response.data)
        }
        const handelPaymentChange = () => {
            setPaymentData({
                sid: studentData.sid,
                payment_date: paymentDate,
                amount: studentData.paymentAmount,
                months_paid_for: paymentFor,
                admissionDate: studentData.admissionDate
            })
        }
        getData()
        handelPaymentChange()
        setAdmissionDate(safeFormatDate(studentData.admissionDate))
    }, [_id, paymentDate, paymentFor, studentData.admissionDate, studentData.paymentAmount, studentData.sid])

    const handlePaymentClick = async () => {
        setLoading(true)
        try {
            const response = await client.post('/api/payment/makepayment', paymentData)
            console.log(response)
            setAlertStatus(response.data.message)
            handleSnackOpen()
            setLoading(false)
            setPaymentData({})
        } catch (error) {
            setLoading(false)
            if (error.response && error.response.data && error.response.data.message) {
                setAlertStatus(error.response.data.message);
                handleSnackOpen()
            } else if (error.message) {
                setAlertStatus(error.message);
                handleSnackOpen()
            } else {
                setAlertStatus('An unknown error occurred');
                handleSnackOpen()
            }
        }

    }




    return (
        <div>
            <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
                <Alert
                    onClose={handleSnackClose}
                    severity={alertStatus === "Payment Success" ? "success" : "error"}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alertStatus}
                </Alert>
            </Snackbar>
            <SideBar>
                <Breadcrumbs title="Checkout" subTitle="Payment" />

                <div className='grid grid-cols-1 gap-4'>

                    <div className='col-span-2'>
                        <div className='p-4 shadow-lg rounded-md'>
                            <div className='py-2'>
                                <h1 className='font-[inter] border-l-4 border-yellow-700 pl-2'>
                                    Payment Detail
                                </h1>
                                <hr className='' />
                                <div className='my-4 flex gap-4'>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>SID</h3>
                                        <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.sid}</h2>
                                    </div>
                                </div>
                                <div className='my-4 flex gap-4'>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Name</h3>
                                        <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.name}</h2>
                                    </div>
                                </div>
                                <div className='my-4 flex gap-4'>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Shift</h3>
                                        <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.shift}</h2>
                                    </div>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Time</h3>
                                        <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.time}</h2>
                                    </div>
                                </div>
                                <div className='my-4 flex gap-4'>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Admission Date</h3>
                                        <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{formatDate(studentData.admissionDate)}</h2>
                                    </div>
                                </div>
                                <div className='my-4 flex gap-4'>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Enter Payment Date</h3>
                                        <input required className='font-semibold text-sm text-[#1b2c3f] font-[inter] w-full p-2' type='date' value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} placeholder='Enter Payment Date' />
                                    </div>
                                </div>
                                <div className='my-4 flex gap-4'>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Payment For</h3>
                                        {/* <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.lastPayment}</h2> */}
                                        <input required className='font-semibold text-sm text-[#1b2c3f] font-[inter] w-full p-2' value={paymentFor} onChange={(e) => setPaymentFor(e.target.value)} type="number" placeholder='1 or 2 Month' />
                                    </div>
                                </div>
                                <div className='my-4 flex gap-4'>
                                    <div className='border p-2 rounded-sm w-full'>
                                        <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Amount</h3>
                                        <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData.paymentAmount}</h2>
                                        {/* <input className='font-semibold text-sm text-[#1b2c3f] font-[inter] w-full p-2' type="number" placeholder='Enter Amount' /> */}
                                    </div>
                                </div>
                                <button onClick={handlePaymentClick} className='p-2 w-full border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                                    {loading ?
                                        <div className='flex items-center justify-center'>
                                            <span className='mr-2'>Please Wait..</span>
                                            <CircularLoading size={25} />
                                        </div> :
                                        <div className='flex items-center'>
                                            {/* <UserPlus size={17} className='mr-2' />Update Student</div>} */}
                                            Checkout</div>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SideBar >
        </div >
    )
}
