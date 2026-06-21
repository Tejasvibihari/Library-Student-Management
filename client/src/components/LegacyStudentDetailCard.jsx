import { useState } from 'react';
import {
    Trash,
    IndianRupee,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Clock,
    Users,
    CreditCard,
    GraduationCap,
    Armchair
} from 'lucide-react';
import { Link } from "react-router-dom";
import { UserCog, ReceiptText } from 'lucide-react';
import ReportIcon from '@mui/icons-material/Report';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import formatDate from '../utils/FormateDate';
import client from '../services/axiosClient';
import CircularLoading from './ui/CircularLoading';

// ---- Theming config -------------------------------------------------

// One palette per payment status — drives the card border, the ledger
// box, and the badge, so the whole card reads as "paid" / "due" etc.
// at a glance instead of just a small pill in the corner.
const PAYMENT_STATUS_STYLES = {
    paid: {
        label: 'Paid',
        topBar: 'bg-emerald-500',
        border: 'border-emerald-600',
        cardBg: 'bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900',
        badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50',
        ledgerBg: 'bg-emerald-950/30 border-emerald-700/50',
        dot: 'bg-emerald-400'
    },
    advance: {
        label: 'Advance',
        topBar: 'bg-blue-500',
        border: 'border-blue-600',
        cardBg: 'bg-gradient-to-br from-blue-950/50 via-slate-900 to-slate-900',
        badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/50',
        ledgerBg: 'bg-blue-950/30 border-blue-700/50',
        dot: 'bg-blue-400'
    },
    partial: {
        label: 'Partial',
        topBar: 'bg-amber-500',
        border: 'border-amber-600',
        cardBg: 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900',
        badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/50',
        ledgerBg: 'bg-amber-950/30 border-amber-700/50',
        dot: 'bg-amber-400'
    },
    due: {
        label: 'Due',
        topBar: 'bg-rose-500',
        border: 'border-rose-600',
        cardBg: 'bg-gradient-to-br from-rose-950/50 via-slate-900 to-slate-900',
        badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/50',
        ledgerBg: 'bg-rose-950/30 border-rose-700/50',
        dot: 'bg-rose-400'
    }
};

const STUDENT_STATUS_STYLES = {
    active: { label: 'Active', badge: 'border-green-600 bg-green-800', Icon: DoneIcon },
    pending: { label: 'Pending', badge: 'border-yellow-600 bg-yellow-800', Icon: ReportIcon },
    inactive: { label: 'Inactive', badge: 'border-red-600 bg-red-800', Icon: CancelIcon },
    left: { label: 'Left', badge: 'border-slate-500 bg-slate-700', Icon: LogoutIcon },
    trash: { label: 'Trash', badge: 'border-slate-600 bg-slate-800', Icon: DeleteSweepIcon }
};

// The old/legacy schema spells the inactive status "Deactive" instead
// of v2's "inactive" — alias it so both data sources theme correctly.
const STUDENT_STATUS_ALIASES = {
    deactive: 'inactive',
    deactivated: 'inactive'
};

function normalizeStudentStatus(status) {
    const raw = String(status || 'pending').toLowerCase();
    return STUDENT_STATUS_ALIASES[raw] || raw;
}

// ---- Helpers ----------------------------------------------------------

function daysBetweenToday(dateInput) {
    if (!dateInput) return null;
    const target = new Date(dateInput);
    if (Number.isNaN(target.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function relativeDayLabel(days) {
    if (days === null) return null;
    if (days > 1) return `in ${days} days`;
    if (days === 1) return 'tomorrow';
    if (days === 0) return 'today';
    if (days === -1) return '1 day ago';
    return `${Math.abs(days)} days ago`;
}

function formatCurrency(amount) {
    const value = Number(amount || 0);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);
}

export default function LegacyStudentDetailCard({
    studentId,
    sid,
    src,
    name,
    email,
    mobile,
    father,
    guardian,
    gender,
    dob,
    aadhar,
    preparingFor,
    addmissionDate,
    shift,
    time,
    address,
    pincode,
    dist,
    block,
    lastPayment,
    paymentAmount,
    nextPayment,
    seatNumber,
    status,
    paymentStatus,
    paymentDue,
    advanceAmount,
    dueDays,
    creditDays
}) {
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
        try {
            setLoading(true);
            const res = await client.get(`/api/v2/student/delete`, {
                params: {
                    studentId,
                }
            });
            console.log(res);
            setLoading(false);
            setShowDeleteDialog(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    const normalizedPaymentStatus = String(paymentStatus || 'due').toLowerCase();
    const payTheme = PAYMENT_STATUS_STYLES[normalizedPaymentStatus] || PAYMENT_STATUS_STYLES.due;

    const normalizedStudentStatus = normalizeStudentStatus(status);
    const studentTheme = STUDENT_STATUS_STYLES[normalizedStudentStatus] || STUDENT_STATUS_STYLES.pending;
    const StudentStatusIcon = studentTheme.Icon;

    const isSeatAllotted = Boolean(seatNumber) && seatNumber !== 'Other';

    const validTillDays = daysBetweenToday(nextPayment);
    const lastPaidDays = daysBetweenToday(lastPayment);

    const hasDue = Number(paymentDue) > 0;
    const hasAdvance = Number(advanceAmount) > 0;

    // Fields that aren't guaranteed to be filled in for every student —
    // only render the ones that actually have a value.
    const personalDetails = [
        { icon: Mail, label: 'Email', value: email },
        { icon: Phone, label: 'Mobile', value: mobile },
        { icon: Users, label: "Father's Name", value: father },
        { icon: Phone, label: 'Guardian Mobile', value: guardian },
        { icon: Calendar, label: 'Date of Birth', value: dob ? formatDate(dob) : null },
        { icon: CreditCard, label: 'Aadhar No.', value: aadhar },
        { icon: GraduationCap, label: 'Preparing For', value: preparingFor },
    ].filter(item => item.value);

    const locationDetails = [
        { label: 'Address', value: address },
        { label: 'District', value: dist },
        { label: 'Block', value: block },
        { label: 'Pincode', value: pincode },
    ].filter(item => item.value);

    return (
        <>
            <div className={`border ${payTheme.border} rounded-md w-full ${payTheme.cardBg} overflow-hidden shadow-lg`}>
                <div className={`h-1.5 w-full ${payTheme.topBar}`} />
                <div className='text-white p-4'>

                    {/* Top section: avatar, identity, ledger */}
                    <div className='flex flex-col lg:flex-row justify-between items-stretch gap-4'>

                        {/* Avatar + identity */}
                        <div className='flex flex-col items-center text-center lg:items-start lg:text-left gap-2 shrink-0'>
                            <img
                                src={src}
                                alt={name}
                                className='w-28 h-28 rounded-full object-cover shadow-sm shadow-white border'
                            />
                            <div>
                                <div className='font-bold text-lg leading-tight'>{name}</div>
                                <div className='text-sm text-slate-400'>SID: {sid}</div>
                            </div>
                            <div className={`border rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5 text-white ${studentTheme.badge}`}>
                                <StudentStatusIcon fontSize="inherit" />
                                {studentTheme.label}
                            </div>
                        </div>

                        {/* Ledger / Account standing */}
                        <div className={`flex flex-col border rounded-md p-3 ${payTheme.ledgerBg} w-full lg:w-auto lg:min-w-[260px]`}>
                            <div className='flex justify-between items-center border-b border-slate-700/60 pb-2 mb-2'>
                                <span className='text-xs font-semibold text-slate-400 tracking-wide uppercase'>Account Ledger</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${payTheme.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${payTheme.dot}`} />
                                    {payTheme.label.toUpperCase()}
                                </span>
                            </div>

                            <div className='text-xs space-y-1.5'>
                                <div className='flex justify-between'>
                                    <span className='text-slate-400'>Last Paid</span>
                                    <span className='font-semibold text-slate-200'>
                                        {lastPayment ? `${formatDate(lastPayment)}${lastPaidDays !== null ? ` (${relativeDayLabel(lastPaidDays)})` : ''}` : 'N/A'}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-slate-400'>Valid Till</span>
                                    <span className={`font-semibold ${validTillDays !== null && validTillDays < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                                        {nextPayment ? `${formatDate(nextPayment)}${validTillDays !== null ? ` (${relativeDayLabel(validTillDays)})` : ''}` : 'N/A'}
                                    </span>
                                </div>

                                {hasDue && (
                                    <div className='flex justify-between text-rose-400 font-semibold pt-1 border-t border-slate-700/60'>
                                        <span>Due Amount</span>
                                        <span>{formatCurrency(paymentDue)} &middot; {dueDays} {dueDays === 1 ? 'day' : 'days'} overdue</span>
                                    </div>
                                )}
                                {hasAdvance && (
                                    <div className='flex justify-between text-emerald-400 font-semibold pt-1 border-t border-slate-700/60'>
                                        <span>Advance Credit</span>
                                        <span>{formatCurrency(advanceAmount)} &middot; {creditDays} {creditDays === 1 ? 'day' : 'days'} covered</span>
                                    </div>
                                )}
                                {!hasDue && !hasAdvance && (
                                    <div className='flex justify-between text-emerald-400 font-semibold pt-1 border-t border-slate-700/60'>
                                        <span>Settled</span>
                                        <span>No due, no advance</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admission / shift / seat */}
                        <div className='flex flex-col gap-1 text-sm lg:text-right lg:items-end shrink-0'>
                            <span className='flex items-center gap-1.5 lg:flex-row-reverse'>
                                <Calendar size={14} className='text-slate-400' />
                                <span className='font-semibold'>Admission:</span>
                                <span className='text-gray-300'>{addmissionDate ? formatDate(addmissionDate) : 'N/A'}</span>
                            </span>
                            <span className='flex items-center gap-1.5 lg:flex-row-reverse'>
                                <Armchair size={14} className='text-slate-400' />
                                <span className='font-semibold'>Seat:</span>
                                <span className='text-gray-300'>{seatNumber || 'Other'}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${isSeatAllotted ? 'border-emerald-600 text-emerald-400' : 'border-slate-500 text-slate-400'}`}>
                                    {isSeatAllotted ? 'Allotted' : 'Not Allotted'}
                                </span>
                            </span>
                            <span className='flex items-center gap-1.5 lg:flex-row-reverse'>
                                <Clock size={14} className='text-slate-400' />
                                <span className='font-semibold'>Shift:</span>
                                <span className='text-gray-300'>{shift || 'N/A'} {time ? `(${time})` : ''}</span>
                            </span>
                            <span className='flex items-center gap-1.5 lg:flex-row-reverse'>
                                <IndianRupee size={14} className='text-slate-400' />
                                <span className='font-semibold'>Cycle Fee:</span>
                                <span className='text-gray-300'>{formatCurrency(paymentAmount)}</span>
                            </span>
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div className='border border-gray-700 p-3 rounded-md mt-3'>
                        <div className='text-xs font-semibold text-slate-400 tracking-wide uppercase mb-2'>Personal Details</div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5'>
                            {personalDetails.map(({ icon: Icon, label, value }) => (
                                <div key={label} className='flex items-start gap-2 text-sm'>
                                    <Icon size={14} className='text-slate-400 mt-0.5 shrink-0' />
                                    <span>
                                        <span className='text-slate-400'>{label}: </span>
                                        <span className='text-gray-100 font-medium'>{value}</span>
                                    </span>
                                </div>
                            ))}
                            <div className='flex items-start gap-2 text-sm'>
                                <Users size={14} className='text-slate-400 mt-0.5 shrink-0' />
                                <span>
                                    <span className='text-slate-400'>Gender: </span>
                                    <span className='text-gray-100 font-medium'>{gender || 'N/A'}</span>
                                </span>
                            </div>
                        </div>

                        {locationDetails.length > 0 && (
                            <div className='flex items-start gap-2 text-sm mt-2 pt-2 border-t border-gray-700/60'>
                                <MapPin size={14} className='text-slate-400 mt-0.5 shrink-0' />
                                <span className='text-gray-100'>
                                    {locationDetails.map(d => d.value).join(', ')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className='flex flex-wrap justify-end gap-2 mt-3'>
                        {normalizedStudentStatus !== 'trash' &&
                            <button
                                onClick={() => setShowDeleteDialog(true)}
                                className='p-2 rounded-md flex justify-center items-center text-white bg-[#962041] hover:bg-[#8e54e9e6]'>
                                <Trash size={17} className='mr-2' />Delete Student
                            </button>
                        }
                        <Link to={`/student-admin-dashboard/${studentId}`}>
                            <button className='p-2 w-full rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                                <ReceiptText size={17} className='mr-2' />Payment Detail
                            </button>
                        </Link>
                        <Link to={`/student-update/${studentId}`}>
                            <button className='p-2 w-full rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                                <UserCog size={17} className='mr-2' />Update Student
                            </button>
                        </Link>
                        <Link to={`/make-payment/${studentId}`}>
                            <button type='submit' className='p-2 rounded-md flex justify-center items-center text-white bg-green-800 hover:bg-green-700'>
                                {loading ? <div className='flex items-center justify-center'><span className='mr-2'>Please Wait..</span><CircularLoading size={25} /></div> :
                                    <div className='flex items-center'>
                                        <IndianRupee size={17} className='mr-2' />Make Payment</div>}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='bg-white p-4 rounded-md shadow-md'>
                        <h2 className='text-lg font-semibold'>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this student?</p>
                        <div className='flex justify-end mt-4'>
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                className='mr-2 p-2 rounded-md bg-gray-300 hover:bg-gray-400'>
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className='p-2 rounded-md bg-red-600 text-white hover:bg-red-700'>
                                {loading ? 'Deleting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}