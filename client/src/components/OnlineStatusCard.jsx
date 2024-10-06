import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import client from '../services/axiosClient';
import { useEffect, useState } from 'react';

export default function OnlineStatusCard() {
    const [allStudent, setAllStudent] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const handleFilter = async () => {
            setLoading(true)
            try {
                const response = await client.get("/api/student/getallstudent", {
                    params: {
                        status: "Pending",
                    }
                })
                setAllStudent(response.data)
                setLoading(false)
            } catch (error) {
                console.log(error)
                setLoading(false)
            }
        }
        handleFilter()
    }, [])


    // Avatar Green Dot 
    const StyledBadge = styled(Badge)(({ theme }) => ({
        '& .MuiBadge-badge': {
            backgroundColor: '#f44336',
            color: '#f44336',
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
            '&::after': {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                animation: 'ripple 1.2s infinite ease-in-out',
                border: '1px solid currentColor',
                content: '""',
            },
        },
        '@keyframes ripple': {
            '0%': {
                transform: 'scale(.8)',
                opacity: 1,
            },
            '100%': {
                transform: 'scale(5)',
                opacity: 0,
            },
        },
    }));
    return (
        <>
            <div className='w-full rounded-md shadow-sm bg-white h-[37rem] overflow-auto'>
                <div>
                    <div className='flex justify-between items-center p-3 border-b'>
                        <h1 className='text-lg font-semibold border-l-4 pl-1 border-red-800 font-[inter]'>Pending Student</h1>
                    </div>
                    {allStudent.length === 0 ?
                        <div className='flex items-center justify-center p-4 font-inter font-semibold'>
                            Nothing Pending Student Found
                        </div> :
                        allStudent.map((student, i) => {
                            return (
                                <div key={i} className='p-3 border-b hover:bg-gray-50 hover:border-l-2 hover:border-l-red-500 cursor-pointer'>
                                    <div className='flex items-center'>
                                        <div>
                                            <StyledBadge
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                variant="dot"
                                            >
                                                <Avatar alt={student.name} src={`https://api.biharilibrary.in/uploads/${student.image}`} />
                                            </StyledBadge>
                                        </div>
                                        <div >
                                            <h5 className='font-semibold text-sm pl-2 text-gray-800'>{student.name}</h5>
                                            <p className='font-normal text-xs pl-2 text-gray-600'>+91 {student.mobile}</p>
                                            <p className='font-normal text-xs pl-2 text-gray-600'>{student.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }

                </div>
            </div>
        </>
    )
}
