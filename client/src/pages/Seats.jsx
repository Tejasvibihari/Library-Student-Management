import React, { useState, useEffect } from 'react'
import SideBar from '../components/Sidebar'
import Breadcrumbs from '../components/Breadcrumbs'
import Seat from '../components/ui/Seat'
import client from '../services/axiosClient'
import CircularLoading from '../components/ui/CircularLoading';
import { UserPlus } from 'lucide-react';

export default function Seats() {
    const [shift, setShift] = useState('')
    const [time, setTime] = useState('')
    const [seatShift, setSeatShift] = useState('')
    const [allSeat, setAllSeat] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const handleShiftChange = () => {
            if (time === "07:00AM - 11:00AM") {
                setSeatShift("morning")
                console.log("morning")
            } else if (time === "11:00AM - 03:00PM") {
                setSeatShift("afternoon")
                console.log("afternoon")
            } else if (time === "03:00PM - 07:00PM") {
                setSeatShift("evening")
            } else if (time === "07:00PM - 11:00PM") {
                setSeatShift("night")
            } else if (time === "07:00PM - 07:00AM") {
                setSeatShift("nightLong")
            } else if (time === "07:00AM - 03:00PM") {
                setSeatShift("doubleMorning")
            } else if (time === "11:00AM - 07:00PM") {
                setSeatShift("doubleEvening")
            } else {
                setSeatShift("fullDay")
            }
        }
        handleShiftChange()

    }, [time])
    useEffect(() => {
        const getAllSeat = async () => {
            try {
                const res = await client.get('/api/seat/getAllSeat')
                console.log(res.data.allSeats)
                setAllSeat(res.data.allSeats)
            } catch (error) {
                console.log(error)
            }
        }
        getAllSeat()
    }, [])
    const getAvailableSeats = async () => {

    };
    const seatRanges = [
        [0, 11],
        [12, 23],
        [24, 35],
        [36, 47],
        ["G48", "G58"],
        ["G59", "G66"],
        ["G67", "G72"]
    ];
    return (
        <>
            <SideBar>
                <Breadcrumbs title="Admin" subTitle="Seats" />
                <div className='border p-2 rounded-sm mb-4 bg-white shadow-md'>
                    <h3>Shift</h3>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-2 pb-4 items-center'>
                        <div className='flex flex-col'>
                            <label>Shift</label>
                            <select required className="p-2 border rounded-md w-full" value={shift} onChange={(e) => setShift(e.target.value)}>
                                <option value="" disabled selected>Select One</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Evening">Evening</option>
                                <option value="Night">Night</option>
                                <option value="Double">Double</option>
                                <option value="24 Hours">24 Hours</option>
                            </select>
                        </div>
                        <div className='flex flex-col'>
                            <label htmlFor="time">Time</label>
                            <select required className="p-2 border rounded-md w-full" value={time} onChange={(e) => setTime(e.target.value)}>
                                <option value="" disabled selected>Select One</option>
                                {shift === "Morning" && <option value="morning">07:00AM - 11:00AM</option>}
                                {shift === "Morning" && <option value="morningLong">07:00AM - 07:00AM</option>}
                                {shift === "Afternoon" && <option value="afternoon">11:00AM - 03:00PM</option>}
                                {shift === "Evening" && <option value="evening">03:00PM - 07:00PM</option>}
                                {shift === "Night" && <option value="night">07:00PM - 11:00PM</option>}
                                {shift === "Night" && <option value="nightLong">07:00PM - 07:00AM</option>}
                                {shift === "Double" && <option value="doubleMorning">07:00AM - 03:00PM</option>}
                                {shift === "Double" && <option value="doubleEvening">11:00AM - 07:00PM</option>}
                                {shift === "24 Hours" && <option value="fullDay">24 Hours</option>}
                            </select>
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-7'>
                    {seatRanges.map((range, index) => (
                        <div key={index} className='border items-center flex flex-col justify-start p-2 bg-white shadow-lg'>
                            {allSeat && allSeat
                                .filter(seat => seat.seatNumber >= range[0] && seat.seatNumber <= range[1])
                                .map((s, i) => (
                                    <Seat key={i} seatNumber={s.seatNumber} available={s.availability[time]} />
                                ))}
                        </div>
                    ))}
                </div>
            </SideBar >
        </>
    )
}
