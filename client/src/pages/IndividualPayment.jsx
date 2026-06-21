

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
    const [amountPaid, setAmountPaid] = useState('')
    const [cycleStart, setCycleStart] = useState('')
    const [cycleEnd, setCycleEnd] = useState('')
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
            const response = await client.get("/api/v2/student/getstudent", {
                params: { _id }
            })
            setStudentData(response.data)
            setAdmissionDate(safeFormatDate(response.data.admissionDate))
            const start = safeFormatDate(response.data?.currentCycle?.nextPayment || response.data?.currentCycle?.cycleStart || response.data?.admissionDate);
            const endDate = new Date(start);
            if (!isNaN(endDate.getTime())) {
                endDate.setMonth(endDate.getMonth() + 1);
                setCycleStart(start);
                setCycleEnd(endDate.toISOString().split('T')[0]);
            }
        }
        getData()
    }, [_id])

    useEffect(() => {
        const payable = studentData?.shift?.feeAmount || studentData.paymentAmount || 0;
        setPaymentData({
            sid: studentData.sid,
            paymentDate,
            amountPaid: Number(amountPaid || payable * (paymentFor || 1)),
            monthsPaidFor: Number(paymentFor || 1),
            cycleStart,
            cycleEnd,
            shiftCode: studentData?.shift?.code
        })
    }, [paymentDate, paymentFor, amountPaid, cycleStart, cycleEnd, studentData.paymentAmount, studentData.sid, studentData?.shift?.code, studentData?.shift?.feeAmount])

    const handlePaymentClick = async () => {
        setLoading(true)
        try {
            const response = await client.post('/api/v2/payment/makepayment', paymentData)
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
            {/* <SideBar> */}
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
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData?.shift?.label || studentData.shift}</h2>
                                </div>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Time</h3>
                                    <h2 className='font-semibold text-sm text-[#1b2c3f] font-[inter]'>{studentData?.shift?.displayTime || studentData.time}</h2>
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
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Cycle Start</h3>
                                    <input required className='font-semibold text-sm text-[#1b2c3f] font-[inter] w-full p-2' type='date' value={cycleStart} onChange={(e) => setCycleStart(e.target.value)} />
                                </div>
                                <div className='border p-2 rounded-sm w-full'>
                                    <h3 className='font-semibold text-xs text-gray-500 font-[inter]'>Cycle End</h3>
                                    <input required className='font-semibold text-sm text-[#1b2c3f] font-[inter] w-full p-2' type='date' value={cycleEnd} onChange={(e) => setCycleEnd(e.target.value)} />
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
                                    <input className='font-semibold text-sm text-[#1b2c3f] font-[inter] w-full p-2' value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} type="number" placeholder={`${(studentData?.shift?.feeAmount || studentData.paymentAmount || 0) * (paymentFor || 1)}`} />
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
            {/* </SideBar > */}
        </div >
    )
}
