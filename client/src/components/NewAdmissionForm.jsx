import React, { useEffect, useState } from 'react'
import { ImagePlus, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Slide from '@mui/material/Slide';
import ImageCroper from './ImageCroper';
import { UserPlus } from 'lucide-react';
import client from '../services/axiosClient';
import CircularLoading from './ui/CircularLoading';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import StudentIdCard from './StudentIdCard';
import { useNavigate } from 'react-router-dom';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function NewAdmissionForm() {

    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = useState(false);
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [alertStatus, setAlertStatus] = useState('')
    const navigate = useNavigate()

    // Core student fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [father, setFather] = useState("");
    const [guardian, setGuardian] = useState("");
    const [gender, setGender] = useState("");
    const [admissionDate, setAdmissionDate] = useState("");
    const [address, setAddress] = useState("");
    const [croppedImage, setCroppedImage] = useState(null);
    const [compressImage, setCompressImage] = useState("")

    // Shift + seat
    const [shiftOptions, setShiftOptions] = useState([])
    const [shiftCode, setShiftCode] = useState("")
    const [vacantSeat, setVacantSeat] = useState([])
    const [seatNumber, setSeatNumber] = useState("Other")

    // Fee payment at admission
    const [feePaid, setFeePaid] = useState(false)
    const [amountPaid, setAmountPaid] = useState("")

    // Advanced / optional fields the controller also accepts
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [password, setPassword] = useState("")
    const [fixedDiscountAmount, setFixedDiscountAmount] = useState("")
    const [fixedDiscountReason, setFixedDiscountReason] = useState("")
    const [cycleDays, setCycleDays] = useState(30)

    const selectedShift = shiftOptions.find(option => option.code === shiftCode);

    const handleSnackOpen = () => setSnackOpen(true);

    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackOpen(false);
    };

    const handleCroppedImage = (imageDataUrl) => {
        setCroppedImage(imageDataUrl);
    };

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    function base64ToFile(base64Str, fileName) {
        const [meta, data] = base64Str.split(",");
        const mime = meta.match(/:(.*?);/)[1];
        const bstr = atob(data);
        const u8arr = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) {
            u8arr[i] = bstr.charCodeAt(i);
        }
        return new File([u8arr], fileName, { type: mime });
    }

    const resetForm = () => {
        setName("");
        setEmail("");
        setMobile("");
        setFather("");
        setGuardian("");
        setGender("");
        setAdmissionDate("");
        setAddress("");
        setCroppedImage("");
        setCompressImage("");
        setShiftCode("");
        setSeatNumber("Other");
        setFeePaid(false);
        setAmountPaid("");
        setPassword("");
        setFixedDiscountAmount("");
        setFixedDiscountReason("");
        setCycleDays(30);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!shiftCode) {
            setAlertStatus("Please select a shift.");
            handleSnackOpen();
            return;
        }
        setLoading(true);

        try {
            const imageFile = croppedImage
                ? base64ToFile(croppedImage, `${name || "student"}-photo.jpg`)
                : null;

            const formData = new FormData();
            [
                ["name", name],
                ["email", email],
                ["mobile", mobile],
                ["father", father],
                ["guardian", guardian],
                ["gender", gender],
                ["admissionDate", admissionDate],
                ["address", address],
                ["seatNumber", seatNumber],
                ["shiftCode", shiftCode],
                ["feePaid", feePaid],
                // Only send amountPaid when the fee isn't marked fully paid;
                // when feePaid is checked the backend charges the full
                // cycle amount itself, so an amount field here would be
                // redundant (and is hidden in the UI in that case).
                ["amountPaid", feePaid ? "" : amountPaid],
                ["password", password],
                ["fixedDiscountAmount", fixedDiscountAmount],
                ["fixedDiscountReason", fixedDiscountReason],
                ["cycleDays", cycleDays],
            ].forEach(([key, value]) => {
                if (value !== "" && value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const { data } = await client.post("/api/v2/student/create-new-student", formData);

            setAlertStatus(data.message);
            handleSnackOpen();
            navigate("/success-review");

            resetForm();
        } catch (error) {
            console.error(error);
            setAlertStatus(error.response?.data?.message || error.message || "An unknown error occurred");
            handleSnackOpen();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadShifts = async () => {
            try {
                const response = await client.get('/api/v2/seat/shifts');
                setShiftOptions(response.data.shifts || []);
            } catch (error) {
                console.error('Error fetching shifts:', error.response ? error.response.data : error.message);
            }
        };
        loadShifts();
    }, []);

    // Re-fetch vacant seats whenever the shift or gender changes. Seat
    // availability is purely shift-time + status driven on the backend now
    // (no date/cycle filtering), so admissionDate/cycleDays don't affect
    // which seats show here - they're only used later when the booking
    // itself is created (for invoicing/cycle records), not for availability.
    useEffect(() => {
        if (shiftCode) {
            getAvailableSeats();
        } else {
            setVacantSeat([]);
        }
        setSeatNumber("Other");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shiftCode, gender]);

    const getAvailableSeats = async () => {
        try {
            const response = await client.get(`/api/v2/seat/getVacantSeatsByShift`, {
                params: {
                    shiftCode,
                    // Only meaningful once a gender has actually been chosen;
                    // backend treats a missing/unrecognized value as "no
                    // gender filter" and returns seats for every reservedFor.
                    gender: gender || undefined
                }
            });
            console.log(response)
            setVacantSeat(response.data || []);
        } catch (error) {
            console.error('Error fetching available seats:', error.response ? error.response.data : error.message);
            setVacantSeat([]);
        }
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
                                    <label htmlFor="gender">Gender</label>
                                    <select required className="p-2 border rounded-md w-full" value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <option value="" disabled>Select One</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Not to Say">Prefer Not To Say</option>
                                    </select>
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-2 pb-4'>
                                <div>
                                    <label htmlFor="father">Father's Name</label>
                                    <input required className="p-2 border rounded-md w-full" value={father} onChange={(e) => setFather(e.target.value)} type="text" id="father" placeholder="Father's Name" />
                                </div>
                                <div>
                                    <label htmlFor="guardian">Guardian's Mobile No.</label>
                                    <input className="p-2 border rounded-md w-full" value={guardian} onChange={(e) => setGuardian(e.target.value)} type="number" id="guardian" placeholder="Guardian's Mobile No." />
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
                                    <label htmlFor="admissionDate">Admission Date</label>
                                    <input required className="p-2 border rounded-md w-full" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} type="date" id="admissionDate" />
                                </div>
                            </div>

                            <div className='border p-2 rounded-sm'>
                                <h3>Shift</h3>
                                {(!gender || gender === 'Not to Say') && (
                                    <p className='text-xs text-amber-600 mb-1'>
                                        {gender === 'Not to Say'
                                            ? 'Showing seats reserved for any gender, since "Prefer Not To Say" was selected.'
                                            : 'Select a gender above to filter to seats reserved for that gender plus unreserved seats.'}
                                    </p>
                                )}
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-2 pb-4'>
                                    <div className='flex flex-col'>
                                        <label htmlFor="shift">Shift</label>
                                        <select
                                            required
                                            id="shift"
                                            className="p-2 border rounded-md w-full"
                                            value={shiftCode}
                                            onChange={(e) => setShiftCode(e.target.value)}
                                        >
                                            <option value="" disabled>Select One</option>
                                            {shiftOptions.map(option => (
                                                <option key={option.code} value={option.code}>
                                                    {option.label} ({option.startTime} - {option.endTime})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='flex flex-col'>
                                        <label htmlFor="seat">Seat</label>
                                        <select
                                            required
                                            id="seat"
                                            className="p-2 border rounded-md w-full"
                                            value={seatNumber}
                                            onChange={(e) => setSeatNumber(e.target.value)}
                                            disabled={!shiftCode}
                                        >
                                            <option value="Other">Other</option>
                                            {/* Backend (/getVacantSeatsByShift) already returns only
                                                available seats matching the selected shift's time
                                                window and the student's gender vs each seat's
                                                reservedFor. The available!==false filter is kept as
                                                a defensive no-op in case that contract ever changes,
                                                rather than trusting a single filtering layer. */}
                                            {Array.isArray(vacantSeat) ? vacantSeat
                                                .filter(seat => seat.available !== false)
                                                .map((seat, index) => (
                                                    <option key={seat._id || index} value={seat.seatNumber}>{seat.seatNumber}</option>
                                                )) : null}
                                        </select>
                                    </div>
                                    <div>
                                        <label>Amount Chargeable</label>
                                        <input
                                            disabled
                                            className="p-2 border rounded-md w-full bg-slate-100"
                                            value={selectedShift ? `Rs ${selectedShift.price}` : ''}
                                            type="text"
                                            placeholder="Select a shift"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='border p-2 rounded-sm mt-3'>
                                <h3>Payment</h3>
                                <div className='flex items-center gap-2 pt-1 pb-2'>
                                    <input
                                        id="feePaid"
                                        type="checkbox"
                                        checked={feePaid}
                                        onChange={(e) => setFeePaid(e.target.checked)}
                                        className='h-4 w-4'
                                    />
                                    <label htmlFor="feePaid" className='select-none'>Fee Paid (full amount received now)</label>
                                </div>

                                {feePaid ? (
                                    <p className='text-sm text-slate-500'>
                                        {selectedShift
                                            ? `The full cycle amount of Rs ${selectedShift.price} will be recorded as paid and an invoice will be generated.`
                                            : 'Select a shift to see the amount that will be recorded as paid.'}
                                    </p>
                                ) : (
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                                        <div>
                                            <label htmlFor="amountPaid">Amount Paid Now (optional)</label>
                                            <input
                                                className="p-2 border rounded-md w-full"
                                                value={amountPaid}
                                                onChange={(e) => setAmountPaid(e.target.value)}
                                                type="number"
                                                id="amountPaid"
                                                placeholder="0"
                                                min="0"
                                            />
                                            <p className='text-xs text-slate-500 mt-1'>Leave blank to mark the full amount as due.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className='mt-3'>
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced((value) => !value)}
                                    className='flex items-center gap-1 text-sm font-semibold text-[#8e54e9]'
                                >
                                    {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    Advanced options
                                </button>

                                {showAdvanced && (
                                    <div className='border p-2 rounded-sm mt-2'>
                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                                            <div>
                                                <label htmlFor="password">Password (optional)</label>
                                                <input
                                                    className="p-2 border rounded-md w-full"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    type="text"
                                                    id="password"
                                                    placeholder="Auto-generated if blank"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="fixedDiscountAmount">Fixed Discount Amount</label>
                                                <input
                                                    className="p-2 border rounded-md w-full"
                                                    value={fixedDiscountAmount}
                                                    onChange={(e) => setFixedDiscountAmount(e.target.value)}
                                                    type="number"
                                                    id="fixedDiscountAmount"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="cycleDays">Cycle Days</label>
                                                <input
                                                    className="p-2 border rounded-md w-full"
                                                    value={cycleDays}
                                                    onChange={(e) => setCycleDays(e.target.value)}
                                                    type="number"
                                                    id="cycleDays"
                                                    placeholder="30"
                                                />
                                            </div>
                                        </div>
                                        <div className='mt-2'>
                                            <label htmlFor="fixedDiscountReason">Discount Reason</label>
                                            <input
                                                className="p-2 border rounded-md w-full"
                                                value={fixedDiscountReason}
                                                onChange={(e) => setFixedDiscountReason(e.target.value)}
                                                type="text"
                                                id="fixedDiscountReason"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className='grid grid-cols-3 my-3'>
                                <div
                                    onClick={handleClickOpen}
                                    className='flex flex-col items-center border-dashed border-slate-300 border-[1px] p-4 bg-slate-200 cursor-pointer'>
                                    <ImagePlus className='mb-2' size={32} />
                                    Upload Profile Image
                                </div>
                            </div>
                            <div className='flex justify-end'>
                                <button type='submit' disabled={loading} className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
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
                        addmissionDate={admissionDate}
                        image={compressImage}
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