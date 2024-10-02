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




    const { _id } = useParams()

    // Form State 
    const [sid, setSid] = useState('')
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [father, setFather] = useState("");
    const [guardian, setGuardian] = useState("");
    const [gender, setGender] = useState("");
    const [admissionDate, setAdmissionDate] = useState("");
    const [shift, setShift] = useState("");
    const [time, setTime] = useState("");
    const [address, setAddress] = useState("");
    const [croppedImage, setCroppedImage] = useState(null);
    const [instagram, setInstagram] = useState("")
    const [facebook, setFacebook] = useState("")
    const [youtube, setYoutube] = useState("")
    const [status, setStatus] = useState('')
    const [paymentAmount, setPaymentAmount] = useState('')
    const [formData, setFormData] = useState({})
    const [seatNumber, setSeatNumber] = useState("")
    const [compressImage, setCompressImage] = useState("")
    const [nextPayment, setNextPayment] = useState("")
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
    function compressBase64Image(base64Str, maxWidth, maxHeight, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = (err) => {
                reject(err);
            };
        });
    }
    compressBase64Image(croppedImage, 400, 400).then(compressedImage => {
        console.log("Compressed image:", compressedImage);
        setCompressImage(compressedImage)
    }).catch(err => {
        console.error("Error compressing image:", err);
    });


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
                setFather(response.data.father)
                setGuardian(response.data.guardian)
                setGender(response.data.gender)
                setShift(response.data.shift)
                setTime(response.data.time)
                setAddress(response.data.address)
                setCompressImage(response.data.image)
                setStatus(response.data.status)
                setPaymentAmount(response.data.paymentAmount)
                setInstagram(response.data.instagram)
                setFacebook(response.data.facebook)
                setYoutube(response.data.youtube)
                setSeatNumber(response.data.seatNumber)

                try {
                    // Safely format dates using the helper function
                    const formattedAdmissionDate = safeFormatDate(response.data.admissionDate);
                    const formattedNextPaymentDate = safeFormatDate(response.data.nextPayment);
                    // Set state with the safely formatted dates or fallback values
                    setAdmissionDate(formattedAdmissionDate);
                    setNextPayment(formattedNextPaymentDate)
                } catch (error) {
                    console.log(error);
                }
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
                father,
                guardian,
                gender,
                admissionDate,
                shift,
                time,
                address,
                instagram,
                facebook,
                youtube,
                status,
                paymentAmount,
                image: compressImage,
                admin: userId,
                seatNumber,
                nextPayment,

            })
        }
        handleChange()
    }, [sid, name, email, mobile, father, guardian, gender, seatNumber, nextPayment,
        admissionDate, shift, time, address, compressImage, userId, addressArray, instagram, facebook, youtube, status, paymentAmount])


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
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-2 pb-4'>
                                    <div>
                                        <label htmlFor="name">Sid</label>
                                        <input required className="p-2 border rounded-md w-full" value={sid} onChange={(e) => setSid(e.target.value)} type="number" id="sid" placeholder="Sid" />
                                    </div>
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
                                        <label>Address</label>
                                        <input required className="p-2 border rounded-md w-full" type="text" placeholder="Address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
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
                                        <label >Addmission Date</label>
                                        <input required className="p-2 border rounded-md w-full" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} type="date" id="number" placeholder="Aadhar No" />
                                    </div>
                                    <div>
                                        <label>Next Payment Date</label>
                                        <input className="p-2 border rounded-md w-full" value={nextPayment} onChange={(e) => setNextPayment(e.target.value)} type="date" id="number" placeholder="Aadhar No" />
                                    </div>
                                    <div>
                                        <label>Status</label>
                                        <select className="p-2 border rounded-md w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
                                            <option value="" disabled selected>Select One</option>
                                            <option value="Active">Active</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Deactive">Deactive</option>
                                            <option value="Trash">Trash</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='border p-2 rounded-sm'>
                                    <h3>Shift</h3>
                                    <div className='grid grid-cols-1 md:grid-cols-4 gap-2 pb-4'>
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
                                        <div>
                                            <label>Seat Number</label>
                                            <input required className="p-2 border rounded-md w-full" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} type="text" placeholder="Amount Chargable" />
                                        </div>

                                    </div>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-2 pb-4'>
                                    <div>
                                        <label>Instagram</label>
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
                            <div>
                                <StudentIdCard
                                    name={name}
                                    father={father}
                                    mobile={mobile}
                                    village={address}
                                    addmissionDate={admissionDate}
                                    // image={compressImage === `${sid}.jpeg` ? `https://api.biharilibrary.in/uploads/${compressImage}` : compressImage}
                                    image={compressImage === `${sid}.jpeg` ? `http://api.biharilibrary.in/uploads/${compressImage}` : compressImage}
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
