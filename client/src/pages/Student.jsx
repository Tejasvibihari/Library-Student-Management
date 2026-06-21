import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import { Smartphone, MapPin, Mail, Fingerprint, Receipt, Wallet, Percent, FileSpreadsheet } from 'lucide-react';
import { useSelector } from 'react-redux';
import client from '../services/axiosClient';
import formatDate from '../utils/FormateDate';
import CircularLoading from '../components/ui/CircularLoading';
import { Link } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export default function StudentDashboard() {
    const user = useSelector(state => state.student.currentStudent);
    const [account, setAccount] = useState(null);
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

    useEffect(() => {
        const fetchStudentAccountData = async () => {
            if (!user?.sid) return;
            setLoading(true);
            try {
                // Fetch student account live summary
                const accountRes = await client.get(`/api/v2/student/account/${user.sid}`);
                setAccount(accountRes.data);

                // Fetch student payment history
                const payRes = await client.get(`/api/v2/payment/history/${user.sid}`);
                setPayments(payRes.data || []);

                // Fetch student invoices
                const invRes = await client.get(`/api/v2/invoice/getinvoicebysid/${user.sid}`);
                setInvoices(invRes.data || []);
            } catch (error) {
                console.error("Error fetching student profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentAccountData();
    }, [user]);

    const handleOpenInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setInvoiceModalOpen(true);
    };

    const handleCloseInvoice = () => {
        setSelectedInvoice(null);
        setInvoiceModalOpen(false);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <CircularLoading size={50} />
                    <p className="mt-2 text-slate-500 font-medium">Loading Your Library Account...</p>
                </div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 font-semibold">Account record not found. Please contact administration.</p>
            </div>
        );
    }

    const payStatus = account.statuses?.payment || 'due';
    const studStatus = account.statuses?.student || 'pending';

    return (
        <>
            <div className='p-4 shadow-sm bg-white border-b'>
                <Breadcrumbs title="Student" subTitle="Dashboard" />
            </div>

            <div className='bg-slate-50 min-h-screen p-4 space-y-6'>
                {/* Header Profile Card */}
                <div className='rounded-xl bg-white p-6 shadow-md border border-slate-100'>
                    <div className='flex flex-col md:flex-row gap-6 items-center md:items-start'>
                        <img 
                            className='w-32 h-32 rounded-full object-cover border-4 border-slate-100 shadow-sm' 
                            src={user.image ? `https://api.biharilibrary.in/uploads/${user.image}` : (user.gender === "Male" ? '/img/idDp.jpg' : '/img/femaledp.jpg')} 
                            alt={account.name}
                        />
                        <div className='flex-1 space-y-2 text-center md:text-left'>
                            <div className='flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start'>
                                <h1 className='text-2xl font-bold text-slate-800'>{account.name}</h1>
                                <span className='text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono font-bold'>SID: {account.sid}</span>
                            </div>
                            
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600 pt-2'>
                                <div className='flex items-center gap-2 justify-center md:justify-start'><Smartphone size={16} className="text-slate-400" /> {user.mobile}</div>
                                <div className='flex items-center gap-2 justify-center md:justify-start'><Mail size={16} className="text-slate-400" /> {user.email}</div>
                                <div className='flex items-center gap-2 justify-center md:justify-start'><MapPin size={16} className="text-slate-400" /> {user.address}</div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4 justify-center md:justify-start items-center">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase shadow-sm border ${
                                    studStatus === 'active' ? 'bg-green-50 border-green-200 text-green-700' :
                                    studStatus === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                    'bg-red-50 border-red-200 text-red-700'
                                }`}>
                                    Status: {studStatus}
                                </span>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase shadow-sm border ${
                                    payStatus === 'paid' ? 'bg-green-50 border-green-200 text-green-700' :
                                    payStatus === 'advance' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                    payStatus === 'partial' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                    'bg-red-50 border-red-200 text-red-700'
                                }`}>
                                    Payment: {payStatus}
                                </span>
                                
                                <Link className='ml-0 md:ml-4' to='/student-id'>
                                    <button className='px-4 py-1.5 rounded-full text-xs font-bold bg-[#8e54e9] hover:bg-[#7b46d1] text-white flex items-center gap-1 shadow-sm'>
                                        <Fingerprint size={14} /> View ID Card
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Quick Ledger Box */}
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 w-full md:w-80 space-y-3">
                            <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-1 text-sm flex items-center gap-1.5">
                                <Wallet size={16} className="text-slate-500" /> Account Summary
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Balance:</span>
                                    <span className={`font-bold ${account.account?.balanceAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Rs {account.account?.balanceAmount || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Advance Credit:</span>
                                    <span className="font-semibold text-green-600">Rs {account.account?.advanceAmount || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Dues Pending:</span>
                                    <span className="font-semibold text-red-600">Rs {account.account?.dueAmount || 0}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 border-dashed">
                                    <span className="text-slate-500">Validity Remaining:</span>
                                    <span className="font-bold text-green-700">{account.account?.creditDays || 0} Days</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 text-xs">
                                    <span className="text-slate-400">Valid Till:</span>
                                    <span className="font-semibold text-slate-700">{account.account?.validTill ? formatDate(account.account.validTill) : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='rounded-xl bg-white shadow-md border border-slate-100 p-6 space-y-4'>
                        <h2 className='font-bold text-lg text-slate-800 border-l-4 border-green-600 pl-3'>Personal Details</h2>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                            <div>
                                <span className='text-slate-400 block text-xs'>Father's Name</span>
                                <span className='font-semibold text-slate-700'>{user.father}</span>
                            </div>
                            <div>
                                <span className='text-slate-400 block text-xs'>Guardian Mobile</span>
                                <span className='font-semibold text-slate-700'>{user.guardian || '-'}</span>
                            </div>
                            <div>
                                <span className='text-slate-400 block text-xs'>Gender</span>
                                <span className='font-semibold text-slate-700'>{user.gender}</span>
                            </div>
                            <div>
                                <span className='text-slate-400 block text-xs'>Admission Date</span>
                                <span className='font-semibold text-slate-700'>{formatDate(user.admissionDate)}</span>
                            </div>
                        </div>
                    </div>

                    <div className='rounded-xl bg-white shadow-md border border-slate-100 p-6 space-y-4'>
                        <h2 className='font-bold text-lg text-slate-800 border-l-4 border-blue-600 pl-3'>Seat & Shift Allotment</h2>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                            <div>
                                <span className='text-slate-400 block text-xs'>Seat Assigned</span>
                                <span className='font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded'>{account.seat?.seatNumber || 'Other'}</span>
                            </div>
                            <div>
                                <span className='text-slate-400 block text-xs'>Shift Label</span>
                                <span className='font-semibold text-slate-700'>{account.shift?.label}</span>
                            </div>
                            <div>
                                <span className='text-slate-400 block text-xs'>Shift Timing</span>
                                <span className='font-semibold text-slate-700'>{account.shift?.displayTime}</span>
                            </div>
                            <div>
                                <span className='text-slate-400 block text-xs'>Monthly Payable</span>
                                <span className='font-semibold text-slate-700'>Rs {account.billing?.netCycleAmount}</span>
                            </div>
                            {account.billing?.fixedDiscountAmount > 0 && (
                                <div className="col-span-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                                    <span className='text-yellow-800 text-xs font-bold flex items-center gap-1'>
                                        <Percent size={13} /> Admission Shift Discount: Rs {account.billing.fixedDiscountAmount} applied every cycle
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ledger Payments History Table */}
                <div className='rounded-xl bg-white shadow-md border border-slate-100 p-6 space-y-4'>
                    <h2 className='font-bold text-lg text-slate-800 border-l-4 border-purple-600 pl-3 flex items-center gap-2'>
                        <FileSpreadsheet size={20} className="text-purple-600" /> Payment & Invoice Log
                    </h2>
                    <div className="overflow-x-auto">
                        <table className='min-w-full divide-y divide-slate-200 text-sm'>
                            <thead className='bg-slate-50'>
                                <tr>
                                    <th className='px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>Payment Date</th>
                                    <th className='px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>Billing Cycle</th>
                                    <th className='px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>Type</th>
                                    <th className='px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider'>Method</th>
                                    <th className='px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider'>Paid Amount</th>
                                    <th className='px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider'>Discount Received</th>
                                    <th className='px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider'>Account Balance</th>
                                    <th className='px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider'>Invoice</th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-slate-100'>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-8 text-slate-400 font-medium">No payment history found.</td>
                                    </tr>
                                ) : (
                                    payments.map((pay) => (
                                        <tr key={pay._id} className="hover:bg-slate-50/50">
                                            <td className='px-4 py-3 whitespace-nowrap'>{formatDate(pay.paymentDate)}</td>
                                            <td className='px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-600'>
                                                {formatDate(pay.cycleStart)} - {formatDate(pay.cycleEnd)}
                                            </td>
                                            <td className='px-4 py-3 whitespace-nowrap capitalize'>
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                    pay.paymentType === 'normal' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                    pay.paymentType === 'advance' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                    pay.paymentType === 'partial' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                                                    'bg-purple-50 text-purple-700 border border-purple-100'
                                                }`}>
                                                    {pay.paymentType.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className='px-4 py-3 whitespace-nowrap text-center capitalize'>{pay.method}</td>
                                            <td className='px-4 py-3 whitespace-nowrap text-right font-semibold text-slate-850'>Rs {pay.amountPaid}</td>
                                            <td className='px-4 py-3 whitespace-nowrap text-right text-slate-550'>
                                                {pay.oneTimeDiscountAmount > 0 ? `Rs ${pay.oneTimeDiscountAmount}` : '-'}
                                            </td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-right font-bold ${pay.balanceAfter >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                Rs {pay.balanceAfter}
                                            </td>
                                            <td className='px-4 py-3 whitespace-nowrap text-center'>
                                                {pay.invoice ? (
                                                    <button 
                                                        onClick={() => {
                                                            const invoiceObj = invoices.find(inv => inv.payment === pay._id || inv._id === pay.invoice);
                                                            if (invoiceObj) handleOpenInvoice(invoiceObj);
                                                        }} 
                                                        className="text-purple-600 hover:text-purple-800 inline-flex items-center gap-1 font-semibold hover:underline"
                                                    >
                                                        <Receipt size={16} /> View Invoice
                                                    </button>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Invoice Details Dialog Modal */}
            <Dialog open={invoiceModalOpen} onClose={handleCloseInvoice} maxWidth="sm" fullWidth>
                {selectedInvoice && (
                    <>
                        <DialogTitle className="bg-slate-900 text-white flex justify-between items-center py-4">
                            <span className="font-bold text-lg">Invoice Details</span>
                            <span className="text-xs bg-slate-700 px-2 py-1 rounded"># {selectedInvoice.invoiceNumber}</span>
                        </DialogTitle>
                        <DialogContent className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                                <div>
                                    <span className="text-slate-400 block text-xs">Issued To</span>
                                    <span className="font-semibold text-slate-700">{account.name} (SID: {account.sid})</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-400 block text-xs">Date Issued</span>
                                    <span className="font-semibold text-slate-700">{formatDate(selectedInvoice.issuedAt)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs">Billing Cycle</span>
                                    <span className="font-semibold text-slate-700">{formatDate(selectedInvoice.cycleStart)} - {formatDate(selectedInvoice.cycleEnd)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-400 block text-xs">Status</span>
                                    <span className="font-bold text-green-600 uppercase">{selectedInvoice.status}</span>
                                </div>
                            </div>

                            {/* Itemized Line Items */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-slate-700 text-sm">Line Items</h4>
                                <div className="border rounded-md overflow-hidden">
                                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-semibold text-slate-500">Description</th>
                                                <th className="px-3 py-2 text-right font-semibold text-slate-500">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {selectedInvoice.items?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-3 py-2 text-slate-600">{item.label}</td>
                                                    <td className={`px-3 py-2 text-right font-mono ${item.amount < 0 ? 'text-green-600' : 'text-slate-700'}`}>
                                                        {item.amount < 0 ? '-' : ''}Rs {Math.abs(item.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Invoice Summary */}
                            <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-1.5 border">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Gross Cycle Amount:</span>
                                    <span className="font-semibold">Rs {selectedInvoice.grossCycleAmount}</span>
                                </div>
                                {selectedInvoice.fixedDiscountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Fixed Shift Discount:</span>
                                        <span>- Rs {selectedInvoice.fixedDiscountAmount}</span>
                                    </div>
                                )}
                                {selectedInvoice.oneTimeDiscountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>One-Time Discount:</span>
                                        <span>- Rs {selectedInvoice.oneTimeDiscountAmount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                                    <span>Net Cycle Payable:</span>
                                    <span>Rs {selectedInvoice.netCycleAmount}</span>
                                </div>
                                <div className="flex justify-between text-green-700 font-bold border-b border-slate-200 pb-2">
                                    <span>Amount Received:</span>
                                    <span>Rs {selectedInvoice.amountPaid}</span>
                                </div>
                                <div className="flex justify-between pt-2 text-xs text-slate-500">
                                    <span>Remaining Due:</span>
                                    <span className="font-semibold text-red-600">Rs {selectedInvoice.dueAmountAfter || 0} ({selectedInvoice.dueDaysAfter || 0} days)</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Carried Advance Credit:</span>
                                    <span className="font-semibold text-green-600">Rs {selectedInvoice.advanceAmountAfter || 0} ({selectedInvoice.creditDaysAfter || 0} days)</span>
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions className="p-4 bg-slate-50 border-t">
                            <Button onClick={handleCloseInvoice} variant="outlined" color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
}
