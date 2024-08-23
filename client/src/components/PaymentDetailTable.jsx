import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import client from '../services/axiosClient';
import Avatar from '@mui/material/Avatar';
import formatDate from '../utils/FormateDate';
import CircularLoading from './ui/CircularLoading';
import { Trash, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function PaymentDetailTable({ data }) {
    const adminId = useSelector(state => state.admin.currentAdmin._id);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = React.useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [alertMessage, setAlertMessage] = useState('')
    const handleSnackClick = () => {
        setSnackOpen(true);
    };

    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackOpen(false);
    };
    const handleDialogOpen = (_id) => {
        setSelectedStudentId(_id);
        setOpen(true);
    };

    const handleDialogClose = () => {
        setOpen(false);
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await client.delete(`/api/payment/deletePayment/${selectedStudentId}`);
            console.log(res.data.message)
            setStudentData(prevData => prevData.filter(student => student._id !== selectedStudentId));
            setAlertMessage(res.data.message)
            setOpen(false);
            handleSnackClick()

        } catch (error) {
            console.error('Error deleting student:', error);
            handleSnackClick()
        }
    };

    useEffect(() => {
        const getStudent = async () => {
            try {
                const response = await client.get("/api/student/getallstudent", {
                    params: { admin: adminId }
                });

                setStudentData(response.data);
                console.log(response.data);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };
        getStudent();
    }, [adminId]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
                <CircularLoading size={30} />
            </div>
        );
    }

    return (
        <>
            <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
                <Alert
                    onClose={handleSnackClose}
                    severity={alertMessage === "Payment deleted successfully" ? "success" : "error"}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alertMessage}
                </Alert>
            </Snackbar >
            {!data ? <div>No Data Found</div> : <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell align="center" style={{ width: '70px' }}>SID</StyledTableCell>
                            <StyledTableCell align="center" style={{ width: '50px' }}>Profile Picture</StyledTableCell>
                            <StyledTableCell align="center" style={{ width: '100px' }}>Name</StyledTableCell>
                            <StyledTableCell align="center" style={{ width: '50px' }}>Payment Date</StyledTableCell>
                            <StyledTableCell align="center" style={{ width: '50px' }}>Amount</StyledTableCell>
                            <StyledTableCell align="center" style={{ width: '50px' }}>Action</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => {
                            const relatedData = studentData.find(item => item.sid === row.sid);
                            return (
                                <StyledTableRow key={row._id}>
                                    <StyledTableCell align="center" component="th" scope="row">
                                        {row.sid}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {relatedData ? (
                                            <Avatar
                                                alt={relatedData.name}
                                                src={`https://api.biharilibrary.in/uploads/${relatedData.image}`}
                                                sx={{ width: 56, height: 56 }}
                                                variant="rounded"
                                            />
                                        ) : 'N/A'}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {relatedData ? relatedData.name : 'N/A'}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{formatDate(row.payment_date)}</StyledTableCell>
                                    <StyledTableCell align="center">{row.amount}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <div className="flex justify-center items-center cursor-pointer">
                                            <Link to="#" onClick={() => handleDialogOpen(row._id)}>
                                                <Trash color='red' />
                                            </Link>
                                        </div>
                                    </StyledTableCell>
                                </StyledTableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            }
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleDialogClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Confirm Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        Are you sure you want to delete this payment detail? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <div className='flex justify-end'>
                        <button onClick={handleDialogClose} className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                            {loading ? <div className='flex items-center justify-center'><span className='mr-2'>Please Wait..</span><CircularLoading size={25} /></div> :
                                <div className='flex items-center'>
                                    <X size={17} className='mr-2' />No</div>}
                        </button>
                    </div>
                    <div className='flex justify-end'>
                        <button onClick={handleConfirmDelete} className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                            {loading ? <div className='flex items-center justify-center'><span className='mr-2'>Please Wait..</span><CircularLoading size={25} /></div> :
                                <div className='flex items-center'>
                                    <Trash size={17} className='mr-2' />Yes Delete</div>}
                        </button>
                    </div>
                </DialogActions>
            </Dialog>
        </>
    );
}