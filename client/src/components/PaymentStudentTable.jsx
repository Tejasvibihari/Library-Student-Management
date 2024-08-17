import * as React from 'react';
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useSelector } from 'react-redux';
import client from '../services/axiosClient';
import Avatar from '@mui/material/Avatar';
import { IndianRupee } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import formatDate from '../utils/FormateDate';
const columns = [
    { id: 'sid', label: 'SID', minWidth: 70 },
    { id: 'image', label: 'Image', minWidth: 50 },
    {
        id: 'name',
        label: 'Name',
        minWidth: 150,
        align: 'center',
    },

    {
        id: 'shift',
        label: 'Shift',
        minWidth: 100,
        align: 'center',
    },
    {
        id: 'lastPayment',
        label: 'Last Payment',
        minWidth: 100,
        align: 'center',
    },
    {
        id: 'paymentDate',
        label: 'Payment Date',
        minWidth: 150,
        align: 'center',
    },
    {
        id: 'amount',
        label: 'Amount',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'status',
        label: 'Status',
        minWidth: 100,
        align: 'center',
    },
    {
        id: 'action',
        label: 'Action',
        minWidth: 100,
        align: 'center',
    },
];


export default function PaymentStudentTable({ allStudent }) {
    const [page, setPage] = React.useState(0);
    const [loading, setLoading] = useState(false)
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const adminId = useSelector(state => state.admin.currentAdmin._id)
    // const [allStudent, setAllStudent] = useState('')

    const [status, setStatus] = useState('Pending');
    

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };


    // useEffect(() => {
    //     const getAllStudent = async () => {
    //         try {
    //             const response = await client.get("/api/student/getallstudent", {
    //                 params: { admin: adminId }
    //             })
    //             setAllStudent(response.data)
    //         } catch (error) {
    //             console.log(error)
    //         }
    //     }
    //     getAllStudent()
    // }, [adminId])

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allStudent && allStudent.map((data, i) => {
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                                    <TableCell align="center" >
                                        {data.sid}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Avatar
                                            alt="Remy Sharp"
                                            src={`https://api.biharilibrary.in/uploads/${data.image}`}
                                            sx={{ width: 56, height: 56 }}
                                            variant="rounded"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {data.name}
                                    </TableCell>
                                    <TableCell align="center">
                                        {data.time}
                                    </TableCell>
                                    <TableCell align="center">
                                        {data.lastPayment ? formatDate(data.lastPayment) : 'N/A'}
                                    </TableCell>
                                    <TableCell align="center">
                                        {data.nextPayment ? formatDate(data.nextPayment) : 'N/A'}
                                    </TableCell>
                                    <TableCell align="center">
                                        {data.paymentAmount}
                                    </TableCell>
                                    <TableCell align="center">
                                        <div className={`border text-white rounded-full p-1 text-xs text-center ${!data.nextPayment || data.nextPayment < new Date() ? "border-yellow-600 bg-yellow-800" : "border-green-600 bg-green-800"}  flex items-center justify-center`}>
                                            {/* {data.nextPayment < new Date() ? "Pending" : "Active"} */}
                                            {!data.nextPayment || data.nextPayment < new Date() ? "Payment Due" : "Active"}
                                        </div>
                                    </TableCell>
                                    <TableCell align="center">
                                        <div className='flex justify-end'>
                                            <Link to={`/make-payment/${data._id}`}>
                                                <button type='submit' className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                                                    {loading ? <div className='flex items-center justify-center'><span className='mr-2'>Please Wait..</span><CircularLoading size={25} /></div> :
                                                        <div className='flex items-center'>
                                                            <IndianRupee size={17} className='mr-2' />Make Payment</div>}
                                                </button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 30, 40, 50, 75, 100]}
                component="div"
                // count={allStudent.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}
