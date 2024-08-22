import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJs, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import client from '../services/axiosClient';

// Register the necessary components with Chart.js
ChartJs.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart() {
  const [chartData, setChartData] = useState({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [
      {
        label: 'Student Admissions',
        data: Array(12).fill(0), // Initialize with zeros
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const response = await client.get('/api/student/get-admission-month');
        const admissions = response.data;

        // Process the data to count admissions per month
        const monthlyAdmissions = Array(12).fill(0);
        admissions.forEach(student => {
          const month = new Date(student.admissionDate).getMonth();
          monthlyAdmissions[month]++;
        });

        // Update the chart data
        setChartData(prevData => ({
          ...prevData,
          datasets: [
            {
              ...prevData.datasets[0],
              data: monthlyAdmissions,
            },
          ],
        }));
      } catch (error) {
        console.error('Error fetching admissions data:', error);
      }
    };

    fetchAdmissions();
  }, []);

  // Options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Student Admissions Per Month',
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className='chart-container'>
      <Bar data={chartData} options={options} />
    </div>
  );
}