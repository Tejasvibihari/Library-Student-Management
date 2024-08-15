import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ImagePlus } from 'lucide-react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Slide from '@mui/material/Slide';
import ImageCroper from './ImageCroper';
import { UserPlus } from 'lucide-react';
import { useSelector } from 'react-redux';
import client from '../services/axiosClient';
import CircularLoading from './ui/CircularLoading';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import StudentIdCard from './StudentIdCard';
import { useParams } from 'react-router-dom';
import InstagramIcon from '@mui/icons-material/Instagram';




const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function StudentUpdateForm() {
    const userId = useSelector(state => state.admin.currentAdmin)

    const [addressArray, setAddressArray] = useState([])
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = useState(false);
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [alertStatus, setAlertStatus] = useState('')
    const [form, setForm] = useState('')



    const { _id } = useParams()

    // Form State 
    const [sid, setSid] = useState('')
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [aadhar, setAadhar] = useState("");
    const [father, setFather] = useState("");
    const [guardian, setGuardian] = useState("");
    const [gender, setGender] = useState("");
    const [preparingFor, setPreparingFor] = useState("");
    const [dob, setDob] = useState("");
    const [admissionDate, setAdmissionDate] = useState("");
    const [shift, setShift] = useState("");
    const [time, setTime] = useState("");
    const [address, setAddress] = useState("");

    const [croppedImage, setCroppedImage] = useState(null);
    const [instagram, setInstagram] = useState("")
    const [facebook, setFacebook] = useState("")
    const [youtube, setYoutube] = useState("")
    const [status, setStatus] = useState('')
    const [lastPayment, setLastPayment] = useState('')
    const [paymentAmount, setPaymentAmount] = useState('')
    const [paymentMode, setPaymentMode] = useState('')
    const [formData, setFormData] = useState({})

    // Alert Snackbar 
    const handleSnackOpen = () => {
        setSnackOpen(true);
    };

    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackOpen(false);
    };
    // Store The Croped Image to State 

    const handleCroppedImage = (imageDataUrl) => {
        setCroppedImage(imageDataUrl);
        console.log("Received cropped image:", imageDataUrl);
    };
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    // Get Address With Pin Code 

    // Show Unique Item From The array of address in the input field 

    function safeFormatDate(dateInput) {
        const date = new Date(dateInput);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    }
    useEffect(() => {
        const getStudent = async () => {
            try {
                const response = await client.get("/api/student/getstudent", {
                    params: { admin: userId._id, _id }
                })

                setSid(response.data.sid)
                setName(response.data.name)
                setEmail(response.data.email)
                setMobile(response.data.mobile)
                setAadhar(response.data.aadhar)
                setFather(response.data.father)
                setGuardian(response.data.guardian)
                setGender(response.data.gender)
                setPreparingFor(response.data.preparingFor)
                setShift(response.data.shift)
                setTime(response.data.time)
                setAddress(response.data.address)
                setCroppedImage(response.data.image)
                setStatus(response.data.status)
                setPaymentAmount(response.data.paymentAmount)
                setPaymentMode(response.data.paymentMode)
                setInstagram(response.data.instagram)
                setFacebook(response.data.facebook)
                setYoutube(response.data.youtube)

                // Helper function to safely format date


                try {
                    // Safely format dates using the helper function
                    const formattedDob = safeFormatDate(response.data.dob);
                    const formattedAdmissionDate = safeFormatDate(response.data.admissionDate);
                    const formattedLastPayment = safeFormatDate(response.data.lastPayment);

                    // Set state with the safely formatted dates or fallback values
                    setDob(formattedDob);
                    setAdmissionDate(formattedAdmissionDate);
                    setLastPayment(formattedLastPayment);
                } catch (error) {
                    console.log(error);
                }
                // const formattedDob = new Date(response.data.dob).toISOString().split('T')[0];
                // const formattedAddmissionDate = new Date(response.data.admissionDate).toISOString().split('T')[0];
                // const formattedLastPayment = new Date(response.data.lastPayment).toISOString().split('T')[0];
                // setDob(formattedDob);
                // setAdmissionDate(formattedAddmissionDate)
                // setLastPayment(formattedLastPayment)
            } catch (error) {
                console.log(error)
            }
        }
        getStudent()

    }, [userId._id, _id])

    useEffect(() => {
        const handleChange = () => {
            setFormData({
                sid,
                name,
                email,
                mobile,
                aadhar,
                father,
                guardian,
                gender,
                preparingFor,
                dob,
                admissionDate,
                shift,
                time,
                address,
                instagram,
                facebook,
                youtube,
                status,
                lastPayment,
                paymentAmount,
                paymentMode,
                image: croppedImage,
                admin: userId
            })
        }
        handleChange()
    }, [sid, name, email, mobile, aadhar, father, guardian, gender, preparingFor, dob,
        admissionDate, shift, time, address, croppedImage, userId, addressArray, instagram, facebook, youtube, status, lastPayment, paymentMode, paymentAmount])


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const response = await client.post("/api/student/updatestudent", formData)
            console.log(response.data.message)
            setLoading(false)
            handleSnackOpen()
            setAlertStatus(response.data.message)
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
    console.log(formData)
    const handleTimeChange = (e) => {
        const selectedTime = e.target.value;
        setTime(selectedTime);

        // Logic to set paymentAmount based on selectedTime
        let amount = 0;
        switch (selectedTime) {
            case "07:00AM - 11:00AM":
            case "11:00AM - 03:00PM":
            case "03:00PM - 07:00PM":
            case "07:00PM - 11:00PM":
                amount = 300; // Example amount for these time slots
                break;
            case "07:00PM - 07:00AM":
                amount = 500; // Example amount for this time slot
                break;
            case "07:00AM - 03:00PM":
            case "11:00AM - 07:00PM":
                amount = 500; // Example amount for these time slots
                break;
            case "24 Hours":
                amount = 1000; // Example amount for 24 Hours
                break;
            default:
                amount = 0;
        }
        setPaymentAmount(amount);
    };
    return (
        <>
            <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
                <Alert
                    onClose={handleSnackClose}
                    severity={alertStatus === "Student details updated successfully" ? "success" : "error"}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alertStatus}
                </Alert>
            </Snackbar>
            <form onSubmit={handleSubmit} encType='multipart/form-data'>
                <div className='grid md:grid-cols-3 grid-cols-1 gap-4'>

                    <div className='col-span-2'>
                        <div className='bg-white shadow-lg rounded-md'>
                            <div className='p-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pb-4'>
                                    <div>
                                        <label htmlFor="name">Name</label>
                                        <input required className="p-2 border rounded-md w-full" value={name} onChange={(e) => setName(e.target.value)} type="text" id="name" placeholder="Name" />
                                    </div>
                                    <div>
                                        <label htmlFor="email">Email</label>
                                        <input required className="p-2 border rounded-md w-full" value={email} onChange={(e) => setEmail(e.target.value)} type="email" id="email" placeholder="Email" />
                                    </div>

                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pb-4'>
                                    <div>
                                        <label htmlFor="mobile">Mobile</label>
                                        <input required className="p-2 border rounded-md w-full" value={mobile} onChange={(e) => setMobile(e.target.value)} type="number" id="mobile" placeholder="Mobile" />
                                    </div>
                                    <div>
                                        <label >Aadhar No</label>
                                        <input required className="p-2 border rounded-md w-full" value={aadhar} onChange={(e) => setAadhar(e.target.value)} type="number" id="number" placeholder="Aadhar No" />
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-2 pb-4'>

                                    <div>
                                        <label htmlFor="father">Father's Name</label>
                                        <input required className="p-2 border rounded-md w-full" value={father} onChange={(e) => setFather(e.target.value)} type="text" id="father" placeholder="Father's Name" />
                                    </div>
                                    <div>
                                        <label htmlFor="mother">Guardian's Mobile No.</label>
                                        <input required className="p-2 border rounded-md w-full" value={guardian} onChange={(e) => setGuardian(e.target.value)} type="number" id="guardian" placeholder="Guardian's Mobile No." />
                                    </div>
                                    <div>
                                        <label>Gender</label>
                                        <select required className="p-2 border rounded-md w-full" value={gender} onChange={(e) => setGender(e.target.value)}>
                                            <option value="" disabled selected>Select One</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="prefer-not-to-say">Prefer Not To Say</option>
                                        </select>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-3 gap-2 pb-4'>
                                    <div>
                                        <label >Preparing For</label>
                                        <input required className="p-2 border rounded-md w-full" value={preparingFor} onChange={(e) => setPreparingFor(e.target.value)} type="text" id="preparingFor" placeholder="Preparing For" />
                                    </div>
                                    <div>
                                        <label htmlFor="dob">Date of Birth</label>
                                        <input required className="p-2 border rounded-md w-full" value={dob} onChange={(e) => setDob(e.target.value)} type="date" id="dob" placeholder="Date of Birth" />
                                    </div>
                                    <div>
                                        <label >Addmission Date</label>
                                        <input required className="p-2 border rounded-md w-full" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} type="date" id="number" placeholder="Aadhar No" />
                                    </div>
                                </div>
                                <div className='border p-2 rounded-sm'>
                                    <h3>Shift</h3>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-2 pb-4'>
                                        <div className='flex flex-col'>
                                            <label>Shift</label>
                                            <select required className="p-2 border rounded-md w-full" value={shift} onChange={(e) => setShift(e.target.value)}>
                                                <option value="" disabled selected>Select One</option>
                                                <option value="Morning">Morning</option>
                                                <option value="Afternoon">Afternoon</option>
                                                <option value="Evening">Evening</option>
                                                <option value="Night">Night</option>
                                                <option value="Double">Double</option>
                                                <option value="24 Hours">24 Hours</option>
                                            </select>
                                        </div>
                                        <div className='flex flex-col'>
                                            <label htmlFor="time">Time</label>
                                            <select required className="p-2 border rounded-md w-full" value={time} onBlur={handleTimeChange} onChange={handleTimeChange}>
                                                <option value="" disabled selected>Select One</option>
                                                {shift === "Morning" && <option value="07:00AM - 11:00AM">07:00AM - 11:00AM</option>}
                                                {shift === "Afternoon" && <option value="11:00AM - 03:00PM">11:00AM - 03:00PM</option>}
                                                {shift === "Evening" && <option value="03:00PM - 07:00PM">03:00PM - 07:00PM</option>}
                                                {shift === "Night" && <option value="07:00PM - 11:00PM">07:00PM - 11:00PM</option>}
                                                {shift === "Night" && <option value="07:00PM - 07:00AM">07:00PM - 07:00AM</option>}
                                                {shift === "Double" && <option value="07:00AM - 03:00PM">07:00AM - 03:00PM</option>}
                                                {shift === "Double" && <option value="11:00AM - 07:00PM">11:00AM - 07:00PM</option>}
                                                {shift === "24 Hours" && <option value="24 Hours">24 Hours</option>}
                                            </select>
                                        </div>
                                        <div>
                                            <label>Amount Chargable</label>
                                            <input required className="p-2 border rounded-md w-full" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} type="number" placeholder="Amount Chargable" />
                                        </div>
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-4 gap-2 pb-4'>
                                    <div>
                                        <label>Address</label>
                                        <input required className="p-2 border rounded-md w-full" type="text" placeholder="Address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-2 pb-4'>
                                    <div>
                                        <label >Instagram</label>
                                        <input

                                            className="p-2 border rounded-md w-full"
                                            type="text"
                                            placeholder="Instagram Link"
                                            value={instagram}
                                            onChange={(e) => setInstagram(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label >Facebook</label>
                                        <input

                                            className="p-2 border rounded-md w-full"
                                            type="text"
                                            placeholder="Facebook Link"
                                            value={facebook}
                                            onChange={(e) => setFacebook(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label >Youtube</label>
                                        <input
                                            className="p-2 border rounded-md w-full"
                                            type="text"
                                            placeholder="Youtube Link"
                                            value={youtube}
                                            onChange={(e) => setYoutube(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className='grid grid-cols-3'>
                                    <div
                                        onClick={handleClickOpen}
                                        className='flex flex-col items-center border-dashed border-slate-300 border-[1px] p-4 bg-slate-200 cursor-pointer'>
                                        <ImagePlus className='mb-2' size={32} />
                                        Uplaod Image
                                    </div>
                                </div>
                                <div className='flex justify-end'>
                                    <button type='submit' className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                                        {loading ? <div className='flex items-center justify-center'><span className='mr-2'>Please Wait..</span><CircularLoading size={25} /></div> :
                                            <div className='flex items-center'>
                                                <UserPlus size={17} className='mr-2' />Update Student</div>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className='shadow-md rounded-md p-2 bg-white'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pb-4'>
                                <div>
                                    <label>Payment Status</label>
                                    <select className="p-2 border rounded-md w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="" disabled selected>Select One</option>
                                        <option value="Deactive">Deactive</option>
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                                <div>
                                    <label >Last Payment</label>
                                    <input className="p-2 border rounded-md w-full" value={lastPayment} onChange={(e) => setLastPayment(e.target.value)} type="date" id="number" placeholder="Aadhar No" />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pb-4'>
                                <div>
                                    <label >Payment Amount</label>
                                    <input
                                        className="p-2 border rounded-md w-full"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        type="number" placeholder="Payment Amount" />
                                </div>
                                <div>
                                    <label >Payment Mode</label>
                                    <select className="p-2 border rounded-md w-full" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                                        <option value="" disabled selected>Select One</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Online">Online</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <StudentIdCard
                                    name={name}
                                    father={father}
                                    mobile={mobile}
                                    village={address}
                                    preparingFor={preparingFor}
                                    addmissionDate={admissionDate}
                                    image={croppedImage === `${sid}.jpeg` ? `http://api.biharilibrary.in/uploads/${croppedImage}` : croppedImage}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </form>

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                {/* <DialogTitle>{"Use Google's location service?"}</DialogTitle> */}
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        <ImageCroper closecroper={handleClose} onImageCrop={handleCroppedImage} />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
