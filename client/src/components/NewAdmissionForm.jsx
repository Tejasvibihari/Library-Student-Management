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





const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function NewAdmissionForm() {
    const userId = useSelector(state => state.admin.currentAdmin)
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = useState(false);
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [alertStatus, setAlertStatus] = useState('')

    // Form State 
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
    const [paymentAmount, setPaymentAmount] = useState()
    const [address, setAddress] = useState("");
    const [croppedImage, setCroppedImage] = useState(null);
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


    useEffect(() => {
        const handleChange = () => {
            setFormData({
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
                paymentAmount,
                address,
                image: croppedImage,
                admin: userId
            })
        }

        handleChange()
    }, [name, email, mobile, aadhar, father, guardian, gender, preparingFor, dob,
        admissionDate, shift, time, paymentAmount,
        address, croppedImage, userId])


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const response = await client.post("/api/student/createstudent", formData)
            console.log(response.data.message)
            setLoading(false)
            handleSnackOpen()
            setAlertStatus(response.data.message)
            setName("")
            setEmail("")
            setMobile("")
            setAadhar("")
            setFather("")
            setGuardian("")
            setGender("")
            setPreparingFor("")
            setDob("")
            setAdmissionDate("")
            setShift("")
            setTime('')
            // setToAmPm("")
            setAddress("")
            setCroppedImage("")
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
                    severity={alertStatus === "Admission Success" ? "success" : "error"}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alertStatus}
                </Alert>
            </Snackbar>
            <div className='grid md:grid-cols-3 grid-cols-1 gap-4'>
                <div className='col-span-2'>
                    <div className='bg-white shadow-lg rounded-md'>
                        <form onSubmit={handleSubmit} encType='multipart/form-data' className='p-4'>
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
                                    <label htmlFor="aadhar">Aadhar No</label>
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
                                    <input className="p-2 border rounded-md w-full" value={guardian} onChange={(e) => setGuardian(e.target.value)} type="number" id="guardian" placeholder="Guardian's Mobile No." />
                                </div>
                                <div>
                                    <label htmlFor="aadhar">Gender</label>
                                    <select required className="p-2 border rounded-md w-full" value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <option value="" disabled selected>Select One</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Not to Say">Prefer Not To Say</option>
                                    </select>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-2 pb-4'>
                                <div>
                                    <label htmlFor="aadhar">Preparing For</label>
                                    <input required className="p-2 border rounded-md w-full" value={preparingFor} onChange={(e) => setPreparingFor(e.target.value)} type="text" id="preparingFor" placeholder="Preparing For" />
                                </div>
                                <div>
                                    <label htmlFor="dob">Date of Birth</label>
                                    <input required className="p-2 border rounded-md w-full" value={dob} onChange={(e) => setDob(e.target.value)} type="date" id="dob" placeholder="Date of Birth" />
                                </div>
                                <div>
                                    <label htmlFor="aadhar">Addmission Date</label>
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
                            <div className='grid grid-cols-3'>
                                <div
                                    onClick={handleClickOpen}
                                    className='flex flex-col items-center border-dashed border-slate-300 border-[1px] p-4 bg-slate-200 cursor-pointer'>
                                    <ImagePlus className='mb-2' size={32} />
                                    Uplaod Profile Image
                                </div>
                            </div>
                            <div className='flex justify-end'>
                                <button type='submit' className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                                    {loading ? <div className='flex items-center justify-center'><span className='mr-2'>Please Wait..</span><CircularLoading size={25} /></div> :
                                        <div className='flex items-center'>
                                            <UserPlus size={17} className='mr-2' />Add Student</div>}
                                </button>
                            </div>
                        </form>
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
                        image={croppedImage}
                    />
                </div>
            </div>
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
