import React, { useState } from 'react'
import axios from 'axios'
import { ImagePlus } from 'lucide-react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import ImageCroper from './ImageCroper';


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function StudentAdmissionForm() {
    const [pincode, setPincode] = useState('')
    const [addressArray, setAddressArray] = useState([])
    const [open, setOpen] = React.useState(false);
    const [croppedImage, setCroppedImage] = useState('');

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
            // console.log(response[0].message)

            setAddressArray(response.data[0].PostOffice)

        } catch (error) {
            console.log(error)
        }
    }
    const uniqueBlocks = addressArray && addressArray.reduce((unique, item) => {
        return unique.findIndex(uniqueItem => uniqueItem.Block === item.Block) < 0
            ? [...unique, item]
            : unique;
    }, []);
    return (
        <>
            <div className='bg-white shadow-lg rounded-md'>
                <div className='p-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pb-4'>
                        <div>
                            <label htmlFor="name">Name</label>
                            <input className="p-2 border rounded-md w-full" type="text" id="name" placeholder="Name" />
                        </div>
                        <div>
                            <label htmlFor="email">Email</label>
                            <input className="p-2 border rounded-md w-full" type="email" id="email" placeholder="Email" />
                        </div>

                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pb-4'>
                        <div>
                            <label htmlFor="mobile">Mobile</label>
                            <input className="p-2 border rounded-md w-full" type="number" id="mobile" placeholder="Mobile" />
                        </div>
                        <div>
                            <label htmlFor="aadhar">Aadhar No</label>
                            <input className="p-2 border rounded-md w-full" type="number" id="number" placeholder="Aadhar No" />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-2 pb-4'>

                        <div>
                            <label htmlFor="father">Father's Name</label>
                            <input className="p-2 border rounded-md w-full" type="text" id="father" placeholder="Father's Name" />
                        </div>
                        <div>
                            <label htmlFor="mother">Guardian's Mobile No.</label>
                            <input className="p-2 border rounded-md w-full" type="number" id="guardian" placeholder="Guardian's Mobile No." />
                        </div>
                        <div>
                            <label htmlFor="aadhar">Gender</label>
                            <select className="p-2 border rounded-md w-full">
                                <option value="" disabled selected>Select One</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="prefer-not-to-say">Prefer Not To Say</option>
                            </select>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pb-4'>
                        <div>
                            <label htmlFor="aadhar">Preparing For</label>
                            <input className="p-2 border rounded-md w-full" type="text" id="preparingFor" placeholder="Preparing For" />
                        </div>
                        <div>
                            <label htmlFor="aadhar">Addmission Date</label>
                            <input className="p-2 border rounded-md w-full" type="date" id="number" placeholder="Aadhar No" />
                        </div>
                    </div>
                    <div className='border p-2 rounded-sm'>
                        <h3>Shift</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pb-4'>
                            <div className='flex flex-col'>
                                <label htmlFor="fromHour">From</label>
                                <div className='flex gap-2'>
                                    <input className="p-2 border rounded-md w-full"
                                        type="number"
                                        id="fromHour"
                                        placeholder="Hour"
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value, 10);
                                            if (value < 1) e.target.value = '1';
                                            if (value > 12) e.target.value = '12';
                                        }}
                                    />
                                    <input className="p-2 border rounded-md w-full"
                                        type="number"
                                        id="fromMinute"
                                        placeholder="Minute"
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value, 10);
                                            if (value < 1) e.target.value = '1';
                                            if (value > 12) e.target.value = '12';
                                        }}
                                    />
                                    <select className='p-2 border rounded-md' style={{ width: '180px' }} >
                                        <option value="" disabled>AM/PM</option>
                                        <option value="am">AM</option>
                                        <option value="pm">PM</option>
                                    </select>
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                <label htmlFor="fromHour">To</label>
                                <div className='flex gap-2'>
                                    <input className="p-2 border rounded-md w-full"
                                        type="number"
                                        id="fromHour"
                                        placeholder="Hour"
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value, 10);
                                            if (value < 1) e.target.value = '1';
                                            if (value > 12) e.target.value = '12';
                                        }}
                                    />
                                    <input className="p-2 border rounded-md w-full"
                                        type="number"
                                        id="fromMinute"
                                        placeholder="Minute"
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value, 10);
                                            if (value < 1) e.target.value = '1';
                                            if (value > 12) e.target.value = '12';
                                        }}
                                    />
                                    <select className='p-2 border rounded-md' style={{ width: '180px' }} >
                                        <option value="" disabled>AM/PM</option>
                                        <option value="am">AM</option>
                                        <option value="pm">PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-2 pb-4'>
                        <div>
                            <label htmlFor="aadhar">Pincode</label>
                            <input className="p-2 border rounded-md w-full" type="number" id="number" placeholder="Pincode"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                onBlur={handleOnBlur} />
                        </div>
                        <div>
                            <label htmlFor="aadhar">Village</label>
                            <select className="p-2 border rounded-md w-full">
                                <option value="" disabled>Village</option>
                                {addressArray && addressArray.map((name, index) => (
                                    <option key={index} value={name.Name}>{name.Name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="aadhar">Block</label>
                            <select className="p-2 border rounded-md w-full">
                                <option value="" disabled>Block</option>
                                {uniqueBlocks && uniqueBlocks.map((name, index) => (
                                    <option key={index} value={name.Block}>{name.Block}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="aadhar">District</label>
                            <input className="p-2 border rounded-md w-full" type="text"
                                value={
                                    addressArray.length > 0 && addressArray[0].District
                                        ? addressArray[0].District
                                        : null} id="district" placeholder="District" />
                        </div>
                    </div>
                    <div className='grid grid-cols-3'>
                        <div
                            onClick={handleClickOpen}
                            className='flex flex-col items-center border-dashed border-slate-300 border-[1px] p-4 bg-slate-200 cursor-pointer'>
                            <ImagePlus className='mb-2' size={32} />
                            Uplaod Image
                        </div>
                        {/* <Dialog>
                            <DialogTrigger asChild>
                                <div className='flex flex-col items-center border-dashed border-slate-300 border-[1px] p-4 bg-slate-200 cursor-pointer'>
                                    <ImagePlus className='mb-2' size={32} />
                                    Uplaod Image
                                </div>
                            </DialogTrigger>
                            <DialogContent className="">
                                <div className="flex mx-auto max-h-max">
                                    <ImageCroper onImageCrop={handleCroppedImage} />
                                </div>
                                <hr className='my-1' />
                                <DialogFooter className="sm:justify-start">
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">
                                            Close
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog> */}
                        <div>
                            {croppedImage && (
                                <div className="mt-4">
                                    <h2 className="text-xl">Cropped Image:</h2>
                                    <img src={croppedImage} alt="Cropped" className="border" />
                                </div>
                            )}
                        </div>

                    </div>

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
                        <ImageCroper onImageCrop={handleCroppedImage} />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
