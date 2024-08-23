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
          'rgba(232, 92, 13, 1)',
          'rgba(13, 124, 102, 1)',
          'rgba(46, 7, 63, 1)',
          'rgba(0, 113, 45, 1)',
          'rgba(128, 0, 0, 1)',
          'rgba(124, 0, 254, 1)',
          'rgba(255, 145, 0, 1)'
        ],
        borderColor: [
          'rgba(232, 92, 13, 1)',
          'rgba(13, 124, 102, 1)',
          'rgba(46, 7, 63, 1)',
          'rgba(0, 113, 45, 1)',
          'rgba(128, 0, 0, 1)',
          'rgba(124, 0, 254, 1)',
          'rgba(255, 145, 0, 1)'
        ],
        borderWidth: 0,
        borderRadius: 20,
        barThickness: 20,
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