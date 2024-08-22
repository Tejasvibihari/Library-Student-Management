import React, { useEffect, useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import client from '../services/axiosClient'
import { CopyCheck, Armchair } from 'lucide-react';
import CircularLoading from '../components/ui/CircularLoading'

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function UpdateSeat() {

    const [seatNumber, setSeatNumber] = useState("")
    const [seatData, setSeatData] = useState({})
    const [morningValue, setMorningValue] = useState("occupied");
    const [afternoonValue, setAfternoonValue] = useState("occupied");
    const [eveningValue, setEveningValue] = useState("occupied");
    const [nightValue, setNightValue] = useState("occupied");
    const [morningLongValue, setMorningLongValue] = useState("occupied");
    const [doubleMorningValue, setDoubleMorningValue] = useState("occupied");
    const [doubleEveningValue, setDoubleEveningValue] = useState("occupied");
    const [nightLongValue, setNightLongValue] = useState("occupied");
    const [fullDayValue, setFullDayValue] = useState("occupied");
    const [loading, setLoading] = useState(false)
    console.log(morningValue)

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

    useEffect(() => {
        if (seatData && seatData.availability) {
            setMorningValue(seatData.availability.morning ? "vacant" : "occupied");
            setAfternoonValue(seatData.availability.afternoon ? "vacant" : "occupied");
            setEveningValue(seatData.availability.evening ? "vacant" : "occupied");
            setNightValue(seatData.availability.night ? "vacant" : "occupied");
            setMorningLongValue(seatData.availability.morningLong ? "vacant" : "occupied");
            setDoubleMorningValue(seatData.availability.doubleMorning ? "vacant" : "occupied");
            setDoubleEveningValue(seatData.availability.doubleEvening ? "vacant" : "occupied");
            setNightLongValue(seatData.availability.nightLong ? "vacant" : "occupied");
            setFullDayValue(seatData.availability.fullDay ? "vacant" : "occupied");
        }

    }, [seatData]);

    const handleSeatUpdate = async () => {
        const availabilityData = {
            morning: morningValue === 'vacant',
            afternoon: afternoonValue === 'vacant',
            evening: eveningValue === 'vacant',
            night: nightValue === 'vacant',
            morningLong: morningLongValue === 'vacant',
            doubleMorning: doubleMorningValue === 'vacant',
            doubleEvening: doubleEveningValue === 'vacant',
            nightLong: nightLongValue === 'vacant',
            fullDay: fullDayValue === 'vacant'
        };

        try {
            setLoading(true);
            const response = await client.put(`/api/seat/updateSeat/${seatNumber}`, availabilityData);
            console.log(response);
            setLoading(false);
        } catch (error) {
            console.error('Error updating seat:', error);
            setLoading(false);
        }
    };
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
                    <div>
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
                                name="radio-buttons-group"
                                value={morningValue}
                                onChange={(e) => setMorningValue(e.target.value)}
                            >
                                <FormControlLabel value="occupied" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#F5004F",
                                        },
                                    }} />
                                } label="Occupied" />
                                <FormControlLabel value="vacant" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#399918",
                                        },
                                    }} />
                                } label="Vacant" />
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
                        <div>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                name="radio-buttons-group"
                                value={afternoonValue}
                                onChange={(e) => setAfternoonValue(e.target.value)}
                            >
                                <FormControlLabel value="occupied" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#F5004F",
                                        },
                                    }} />
                                } label="Occupied" />
                                <FormControlLabel value="vacant" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#399918",
                                        },
                                    }} />
                                } label="Vacant" />
                            </RadioGroup>
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
                        <div>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                name="radio-buttons-group"
                                value={eveningValue}
                                onChange={(e) => setEveningValue(e.target.value)}
                            >
                                <FormControlLabel value="occupied" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#F5004F",
                                        },
                                    }} />
                                } label="Occupied" />
                                <FormControlLabel value="vacant" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#399918",
                                        },
                                    }} />
                                } label="Vacant" />
                            </RadioGroup>
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
                        <div>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                name="radio-buttons-group"
                                value={nightValue}
                                onChange={(e) => setNightValue(e.target.value)}
                            >
                                <FormControlLabel value="occupied" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#F5004F",
                                        },
                                    }} />
                                } label="Occupied" />
                                <FormControlLabel value="vacant" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#399918",
                                        },
                                    }} />
                                } label="Vacant" />
                            </RadioGroup>
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
                        <div>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                name="radio-buttons-group"
                                value={morningLongValue}
                                onChange={(e) => setMorningLongValue(e.target.value)}
                            >
                                <FormControlLabel value="occupied" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#F5004F",
                                        },
                                    }} />
                                } label="Occupied" />
                                <FormControlLabel value="vacant" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#399918",
                                        },
                                    }} />
                                } label="Vacant" />
                            </RadioGroup>
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
                        <div>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                name="radio-buttons-group"
                                value={doubleMorningValue}
                                onChange={(e) => setDoubleMorningValue(e.target.value)}
                            >
                                <FormControlLabel value="occupied" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#F5004F",
                                        },
                                    }} />
                                } label="Occupied" />
                                <FormControlLabel value="vacant" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#399918",
                                        },
                                    }} />
                                } label="Vacant" />
                            </RadioGroup>
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
                        <div>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                name="radio-buttons-group"
                                value={doubleEveningValue}
                                onChange={(e) => setDoubleEveningValue(e.target.value)}
                            >
                                <FormControlLabel value="occupied" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#F5004F",
                                        },
                                    }} />
                                } label="Occupied" />
                                <FormControlLabel value="vacant" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#399918",
                                        },
                                    }} />
                                } label="Vacant" />
                            </RadioGroup>
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
                        <div>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                name="radio-buttons-group"
                                value={nightLongValue}
                                onChange={(e) => setNightLongValue(e.target.value)}
                            >
                                <FormControlLabel value="occupied" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#F5004F",
                                        },
                                    }} />
                                } label="Occupied" />
                                <FormControlLabel value="vacant" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#399918",
                                        },
                                    }} />
                                } label="Vacant" />
                            </RadioGroup>
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
                        <div>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                name="radio-buttons-group"
                                value={fullDayValue}
                                onChange={(e) => setFullDayValue(e.target.value)}
                            >
                                <FormControlLabel value="occupied" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#F5004F",
                                        },
                                    }} />
                                } label="Occupied" />
                                <FormControlLabel value="vacant" control={
                                    <Radio sx={{
                                        color: "#000000",
                                        '&.Mui-checked': {
                                            color: "#399918",
                                        },
                                    }} />
                                } label="Vacant" />
                            </RadioGroup>
                        </div>
                    </div>
                </div>
                <div className='flex justify-end mt-4'>
                    <button onClick={handleSeatUpdate} className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

                        {loading ? <div className='flex items-center justify-center'><span className='mr-2'>Please Wait..</span><CircularLoading size={25} /></div> :
                            <div className='flex items-center'>
                                <CopyCheck size={17} className='mr-2' />Update Seat</div>}
                    </button>
                </div>
            </div >
        </>
    )
}
