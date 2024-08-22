import React, { useEffect, useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import client from '../services/axiosClient'
import { Armchair } from 'lucide-react';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function UpdateSeat() {
    const [time, setTime] = useState("")
    const [seatNumber, setSeatNumber] = useState("")
    const [shift, setShift] = useState("")
    const [seatData, setSeatData] = useState({})


    useEffect(() => {
        const fetchSeatData = async () => {
            if (seatNumber) {
                try {
                    const res = await client.get(`/api/seat/getseatbynumber/${seatNumber}`);
                    setSeatData(res.data);
                } catch (error) {
                    console.error('Error fetching seat data:', error);
                }
            }
        };

        fetchSeatData();
    }, [seatNumber]);
    console.log(seatData)
    return (
        <>
            <Breadcrumbs title="Admin" subTitle="Update Seats" />

            <h1 className='font-[inter] text-semibold p-2 border-l-green-700 border-l-4'>Update Seat</h1>

            <div className='my-4 p-4'>
                <div className='grid grid-cols-1 gap-4'>
                    <div>
                        <label>Seat Number</label>
                        <input type='text' placeholder='Enter Seat Number' className='border p-2 rounded-md w-full' value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className='p-5 mx-10 shadow-xl'>
                <div className='grid grid-cols-2 md:grid-cols-9 gap-10 items-center justify-between'>
                    <div className='border p-1'>
                        <div className={`p-7 flex justify-center ${seatData && seatData.availability && seatData.availability.morning ? "bg-green-400" : "bg-red-400"}  rounded-lg`}>
                            <Armchair size={40} color={`${seatData && seatData.availability && seatData.availability.morning ? '#166534' : '#7f1d1d'}`} />
                        </div>
                        <div className='font-[inter] text-xs font-semibold flex flex-col items-center'>
                            <span>
                                Morning
                            </span>
                            <span>
                                7AM-11AM
                            </span>
                        </div>
                        <div>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                defaultValue={seatData && seatData.availability && seatData.availability.morning ? "vacant" : "occupied"}
                                name="radio-buttons-group"
                            >
                                <FormControlLabel value="occupied" control={<Radio />} label="Occupied" />
                                <FormControlLabel value="vacant" control={<Radio />} label="Vacant" />
                            </RadioGroup>
                        </div>
                    </div>
                    <div>
                        <div className={`p-7 flex justify-center ${seatData && seatData.availability && seatData.availability.afternoon ? "bg-green-400" : "bg-red-400"}  rounded-lg`}>
                            <Armchair size={40} color={`${seatData && seatData.availability && seatData.availability.afternoon ? '#166534' : '#7f1d1d'}`} />
                        </div>
                        <div className='font-[inter] text-xs font-semibold flex flex-col items-center'>
                            <span>
                                Afternoon
                            </span>
                            <span>
                                11PM-03AM
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className={`p-7 flex justify-center ${seatData && seatData.availability && seatData.availability.evening ? "bg-green-400" : "bg-red-400"}  rounded-lg`}>
                            <Armchair size={40} color={`${seatData && seatData.availability && seatData.availability.evening ? '#166534' : '#7f1d1d'}`} />
                        </div>
                        <div className='font-[inter] text-xs font-semibold flex flex-col items-center'>
                            <span>
                                Evening
                            </span>
                            <span>
                                03PM-07PM
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className={`p-7 flex justify-center ${seatData && seatData.availability && seatData.availability.night ? "bg-green-400" : "bg-red-400"}  rounded-lg`}>
                            <Armchair size={40} color={`${seatData && seatData.availability && seatData.availability.night ? '#166534' : '#7f1d1d'}`} />
                        </div>
                        <div className='font-[inter] text-xs font-semibold flex flex-col items-center'>
                            <span>
                                Night
                            </span>
                            <span>
                                07PM-11PM
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className={`p-7 flex justify-center ${seatData && seatData.availability && seatData.availability.morningLong ? "bg-green-400" : "bg-red-400"}  rounded-lg`}>
                            <Armchair size={40} color={`${seatData && seatData.availability && seatData.availability.morningLong ? '#166534' : '#7f1d1d'}`} />
                        </div>
                        <div className='font-[inter] text-xs font-semibold flex flex-col items-center'>
                            <span>
                                Full Morning
                            </span>
                            <span>
                                07AM-07PM
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className={`p-7 flex justify-center ${seatData && seatData.availability && seatData.availability.doubleMorning ? "bg-green-400" : "bg-red-400"}  rounded-lg`}>
                            <Armchair size={40} color={`${seatData && seatData.availability && seatData.availability.doubleMorning ? '#166534' : '#7f1d1d'}`} />
                        </div>
                        <div className='font-[inter] text-xs font-semibold flex flex-col items-center'>
                            <span>
                                Mor + After
                            </span>
                            <span>
                                07AM-03PM
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className={`p-7 flex justify-center ${seatData && seatData.availability && seatData.availability.doubleEvening ? "bg-green-400" : "bg-red-400"}  rounded-lg`}>
                            <Armchair size={40} color={`${seatData && seatData.availability && seatData.availability.doubleEvening ? '#166534' : '#7f1d1d'}`} />
                        </div>
                        <div className='font-[inter] text-xs font-semibold flex flex-col items-center'>
                            <span>
                                After + Eve
                            </span>
                            <span>
                                11AM-07PM
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className={`p-7 flex justify-center ${seatData && seatData.availability && seatData.availability.nightLong ? "bg-green-400" : "bg-red-400"}  rounded-lg`}>
                            <Armchair size={40} color={`${seatData && seatData.availability && seatData.availability.nightLong ? '#166534' : '#7f1d1d'}`} />
                        </div>
                        <div className='font-[inter] text-xs font-semibold flex flex-col items-center'>
                            <span>
                                Full Night
                            </span>
                            <span>
                                07PM-07AM
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className={`p-7 flex justify-center ${seatData && seatData.availability && seatData.availability.fullDay ? "bg-green-400" : "bg-red-400"}  rounded-lg`}>
                            <Armchair size={40} color={`${seatData && seatData.availability && seatData.availability.fullDay ? '#166534' : '#7f1d1d'}`} />
                        </div>
                        <div className='font-[inter] text-xs font-semibold flex flex-col items-center'>
                            <span>
                                Fullday
                            </span>
                            <span>
                                24 Hours
                            </span>
                        </div>
                    </div>

                </div >
            </div >
        </>
    )
}
