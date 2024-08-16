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

export default function PaymentDetailTable({ data }) {
    const adminId = useSelector(state => state.admin.currentAdmin._id);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const baseUrl = process.env.BASE_URL
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
        !data ? <div>No Data Found</div> : <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell align="center" style={{ width: '70px' }}>SID</StyledTableCell>
                        <StyledTableCell align="center" style={{ width: '50px' }}>Profile Picture</StyledTableCell>
                        <StyledTableCell align="center" style={{ width: '100px' }}>Name</StyledTableCell>
                        <StyledTableCell align="center" style={{ width: '50px' }}>Payment Date</StyledTableCell>
                        <StyledTableCell align="center" style={{ width: '50px' }}>Amount</StyledTableCell>
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
                                            src={`${baseUrl}/uploads/${relatedData.image}`}
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
                            </StyledTableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}