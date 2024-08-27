import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJs, ArcElement, Tooltip, Legend } from 'chart.js';
import client from '../services/axiosClient';

ChartJs.register(ArcElement, Tooltip, Legend);

export default function PiChart() {
    const [allPayment, setAllPayment] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalPendingAmount, setTotalPendingAmount] = useState(0);
    const [pieData, setPieData] = useState([]);

    useEffect(() => {
        const getAllPayment = async () => {
            try {
                const response = await client.get("/api/payment/getallpayment");
                setAllPayment(response.data);

                // Get current month and year
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                // Filter payments for the current month
                const currentMonthPayments = response.data.filter(payment => {
                    const paymentDate = new Date(payment.payment_date);
                    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
                });

                // Calculate total amount collected in the current month
                const total = currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
                setTotalAmount(total);

            } catch (error) {
                console.log(error);
            }
        };

        const getAllStudents = async () => {
            try {
                const response = await client.get("/api/student/getallstudent");

                // Filter students with pending payments
                const pendingPayments = response.data.filter(student => student.status === "Pending");

                // Calculate total pending amount
                const totalPending = pendingPayments.reduce((sum, student) => sum + student.paymentAmount, 0);
                setTotalPendingAmount(totalPending);

                // Update pieData state with totalAmount and totalPendingAmount
                setPieData([totalAmount, totalPending]);

            } catch (error) {
                console.log(error);
            }
        };

        getAllPayment();
        getAllStudents();
    }, [totalAmount, totalPendingAmount]);

    const chartData = {
        labels: [`Collected Amount ${totalAmount}`, `Pending Amount ${totalPendingAmount}`], // Adjust according to your data structure
        datasets: [
            {
                label: 'Payment Data',
                data: pieData,
                backgroundColor: [
                    'rgba(136, 214, 108, 0.65)',
                    'rgba(255, 104, 104, 0.65)',
                ],
                borderColor: [
                    'rgba(136, 214, 108, 1)',
                    'rgba(255, 104, 104, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Payment Data',
            },
        },
    };
    return (
        <div className='bg-white p-4 shadow-lg rounded-md' >
            <Pie className='w-[100%]' data={chartData} options={options} />
        </div>
    );
}