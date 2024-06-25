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

export default function StudentUpdateForm() {
    const userId = useSelector(state => state.admin.currentAdmin)
    const [addressArray, setAddressArray] = useState([])
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
    // const [fromHour, setFromHour] = useState("");
    // const [fromMinute, setFromMinute] = useState("");
    // const [fromamPm, setFromAmPm] = useState("");
    // const [toHour, setToHour] = useState("");
    // const [toMinute, setToMinute] = useState("");
    // const [toamPm, setToAmPm] = useState("");
    const [shiftFrom, setShiftFrom] = useState("");
    const [shiftTo, setShiftTo] = useState("");

    const [pincode, setPincode] = useState("");
    const [village, setVillage] = useState("");
    const [block, setBlock] = useState("");
    const [district, setDistrict] = useState("");
    const [croppedImage, setCroppedImage] = useState(null);
    const [formData, setFormData] = useState({})
    console.log(croppedImage)

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

    const handleOnBlur = async () => {
        try {
            const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`)
            setAddressArray(response.data[0].PostOffice)
        } catch (error) {
            console.log(error)
        }
    }
    // Show Unique Item From The array of address in the input field 
    const uniqueBlocks = addressArray && addressArray.reduce((unique, item) => {
        return unique.findIndex(uniqueItem => uniqueItem.Block === item.Block) < 0
            ? [...unique, item]
            : unique;
    }, []);

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
                // fromHour,
                // fromMinute,
                // fromamPm,
                // toHour,
                // toMinute,
                // toamPm,
                shiftFrom,
                shiftTo,
                pincode,
                village,
                block,
                district,
                image: croppedImage,
                admin: userId
            })
        }
        console.log(shiftTo)
        console.log(shiftFrom)
        setDistrict(addressArray.length > 0 && addressArray[0].District
            ? addressArray[0].District
            : null)
        handleChange()
    }, [name, email, mobile, aadhar, father, guardian, gender, preparingFor, dob,
        admissionDate, shiftFrom, shiftTo,
        pincode, village, block, district, croppedImage, userId, addressArray])


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
            // setFromHour("")
            // setFromMinute("")
            // setFromAmPm("")
            // setToHour("")
            // setToMinute("")
            setShiftFrom("")
            setShiftTo("")
            // setToAmPm("")
            setPincode("")
            setVillage("")
            setBlock("")
            setDistrict("")
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

    return (
        <>
            <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
                <Alert
                    onClose={handleSnackClose}
                    severity={alertStatus === "Addmission Success" ? "success" : "error"}
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
                                        <input required className="p-2 border rounded-md w-full" value={guardian} onChange={(e) => setGuardian(e.target.value)} type="number" id="guardian" placeholder="Guardian's Mobile No." />
                                    </div>
                                    <div>
                                        <label htmlFor="aadhar">Gender</label>
                                        <select required className="p-2 border rounded-md w-full" value={gender} onChange={(e) => setGender(e.target.value)}>
                                            <option value="" disabled selected>Select One</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="prefer-not-to-say">Prefer Not To Say</option>
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
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pb-4'>
                                        <div className='flex flex-col'>
                                            <label htmlFor="fromHour">From</label>
                                            <div className='flex gap-2'>
                                                <input type='time' value={shiftFrom} onChange={(e) => setShiftFrom(e.target.value)} className="p-2 border rounded-md w-full" />
                                                {/* <input required className="p-2 border rounded-md w-full"
                                                type="number"
                                                id="fromHour"
                                                placeholder="Hour"
                                                value={fromHour}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value, 10);
                                                    if (value < 1) e.target.value = '1';
                                                    if (value > 12) e.target.value = '12';
                                                    setFromHour(e.target.value)
                                                }}
                                            />
                                            <input required className="p-2 border rounded-md w-full"
                                                type="number"
                                                id="fromMinute"
                                                placeholder="Minute"
                                                value={fromMinute}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value, 10);
                                                    if (value < 1) e.target.value = '1';
                                                    if (value > 12) e.target.value = '12';
                                                    setFromMinute(e.target.value)
                                                }}
                                            /> */}
                                                {/* <select required className='p-2 border rounded-md' value={fromamPm} onChange={(e) => setFromAmPm(e.target.value)} style={{ width: '180px' }} >
                                                <option value="" disabled>AM/PM</option>
                                                <option value="am">AM</option>
                                                <option value="pm">PM</option>
                                            </select> */}
                                            </div>
                                        </div>
                                        <div className='flex flex-col'>
                                            <label htmlFor="toHour">To</label>
                                            <div className='flex gap-2'>
                                                <input type='time' value={shiftTo} onChange={(e) => setShiftTo(e.target.value)} className="p-2 border rounded-md w-full" />

                                                {/* <input required className="p-2 border rounded-md w-full"
                                                type="number"
                                                id="toHour"
                                                placeholder="Hour"
                                                value={toHour}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value, 10);
                                                    if (value < 1) e.target.value = '1';
                                                    if (value > 12) e.target.value = '12';
                                                    setToHour(e.target.value)
                                                }}
                                            />
                                            <input required className="p-2 border rounded-md w-full"
                                                type="number"
                                                id="fromMinute"
                                                placeholder="Minute"
                                                value={toMinute}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value, 10);
                                                    if (value < 1) e.target.value = '1';
                                                    if (value > 12) e.target.value = '12';
                                                    setToMinute(e.target.value)
                                                }}
                                            />
                                            <select required className='p-2 border rounded-md' value={toamPm} onChange={(e) => setToAmPm(e.target.value)} style={{ width: '180px' }} >
                                                <option value="" disabled>AM/PM</option>
                                                <option value="am">AM</option>
                                                <option value="pm">PM</option>
                                            </select> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-4 gap-2 pb-4'>
                                    <div>
                                        <label htmlFor="aadhar">Pincode</label>
                                        <input required className="p-2 border rounded-md w-full" type="number" id="number" placeholder="Pincode"
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            onBlur={handleOnBlur} />
                                    </div>
                                    <div>
                                        <label htmlFor="aadhar">Village</label>
                                        <select required className="p-2 border rounded-md w-full" value={village} onChange={(e) => setVillage(e.target.value)}>
                                            <option value="" disabled>Village</option>
                                            {addressArray && addressArray.map((name, index) => (
                                                <option key={index} value={name.Name}>{name.Name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="aadhar">Block</label>
                                        <select required className="p-2 border rounded-md w-full" value={block} onChange={(e) => setBlock(e.target.value)}>
                                            <option value="" disabled>Block</option>
                                            {uniqueBlocks && uniqueBlocks.map((name, index) => (
                                                <option key={index} value={name.Block}>{name.Block}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="aadhar">District</label>
                                        <input required className="p-2 border rounded-md w-full" type="text"
                                            value={district} id="district" placeholder="District" />
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
                                                <UserPlus size={17} className='mr-2' />Add Student</div>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className='shadow-md rounded-md p-2 bg-white'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pb-4'>
                                <div>
                                    <label htmlFor="aadhar">Payment Status</label>
                                    <select required className="p-2 border rounded-md w-full" value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <option value="" disabled selected>Select One</option>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="decative">Deactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="aadhar">Last Payment</label>
                                    <input required className="p-2 border rounded-md w-full" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} type="date" id="number" placeholder="Aadhar No" />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pb-4'>
                                <div>
                                    <label htmlFor="aadhar">Payment Amount</label>
                                    <input required className="p-2 border rounded-md w-full" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} type="number" id="number" placeholder="Aadhar No" />
                                </div>
                                <div>
                                    <label htmlFor="aadhar">Payment Mode</label>
                                    <select required className="p-2 border rounded-md w-full" value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <option value="" disabled selected>Select One</option>
                                        <option value="cash">Cash</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>
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
