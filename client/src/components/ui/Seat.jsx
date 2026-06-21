import React from 'react'
import { Armchair } from 'lucide-react';
export default function Seat({ seatNumber, available }) {
    return (
        <>
            <div className='flex flex-col justify-center items-center w-fit my-2'>
                <div className={`p-2 rounded-md ${available === true ? "bg-green-300" : "bg-red-300"} w-fit shadow-sm`}>
                    <Armchair size={15} color={available ? "#095816" : "#580909"} />
                </div>
                <span className='font-[inter] text-xs font-semibold'>{seatNumber}</span>
            </div >
        </>
    )
}
