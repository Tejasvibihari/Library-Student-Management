import { NeatGradient } from "@firecms/neat";
import React, { useEffect, useRef, useState } from "react";
// import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import { Instagram, } from 'lucide-react';
import { Youtube } from 'lucide-react';
import { Facebook } from 'lucide-react';
import { Link } from "react-router-dom";


export default function StudentIdCard({ sid, name, father, mobile, preparingFor, addmissionDate, image, village }) {

    const canvasRef = useRef(null);
    const gradientRef = useRef(null);

    useEffect(() => {

        if (!canvasRef.current)
            return;

        gradientRef.current = new NeatGradient({
            ref: canvasRef.current,
            "colors": [
                {
                    "color": "#cdb4db",
                    "enabled": true
                },
                {
                    "color": "#ffc8dd",
                    "enabled": true
                },
                {
                    "color": "#ffafcc",
                    "enabled": true
                },
                {
                    "color": "#bde0fe",
                    "enabled": true
                },
                {
                    "color": "#a2d2ff",
                    "enabled": false
                }
            ],
            "speed": 4,
            "horizontalPressure": 4,
            "verticalPressure": 5,
            "waveFrequencyX": 2,
            "waveFrequencyY": 3,
            "waveAmplitude": 5,
            "shadows": 10,
            "highlights": 2,
            "colorBrightness": 1,
            "colorSaturation": 7,
            "wireframe": false,
            "colorBlending": 6,
            "backgroundColor": "#003FFF",
            "backgroundAlpha": 1,
            "resolution": 1
        });

        return gradientRef.current.destroy;

    }, [canvasRef.current]);

    return (
        <>
            <div className="flex items-center justify-center my-auto">
                <div className="relative rounded-md overflow-hidden shadow-lg">
                    <div className="w-72 h-[30rem]" style={{ backgroundImage: `url('/img/idbackground.png')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2  mt-4">
                        <div className="flex items-center justify-center">
                            <img src="./img/biharilogo.png" className="my-4 w-[170px]" />

                        </div>
                        {image ? <img src={image} className="rounded-full w-32 border-gray-400 border-4 mx-auto" /> :
                            <img src="./img/idDp.jpg" className="rounded-full w-32 border-gray-400 border-4 mx-auto" />}
                        <h2 className="text-center my-1 text-gray-700 font-normal">
                            {sid}
                        </h2>
                        <h2 className="text-center text-lg my-1 text-black font-semibold">
                            {name}
                        </h2>
                        <div className="flex w-52 flex-col">
                            <div className="flex justify-between items-center w-52">
                                <div className="font-semibold">
                                    S/O:
                                </div>
                                <div>
                                    {father}
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-52">
                                <div className="font-semibold">
                                    Mobile No:
                                </div>
                                <div>
                                    {mobile}
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-52">
                                <div className="font-semibold">
                                    Address:
                                </div>
                                <div className="">
                                    {village}
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-52">
                                <div className="font-semibold">
                                    Preparing For:
                                </div>
                                <div className="">
                                    {preparingFor}
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-52">
                                <div className="font-semibold">
                                    Addmission:
                                </div>
                                <div className="">
                                    {addmissionDate}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-around items-center w-60 mt-2">
                            <Link to="">
                                <div className="p-2 border rounded-full border-black">
                                    <Facebook size={24} />
                                </div>
                            </Link>
                            <Link to="">
                                <div className="p-2 border rounded-full border-black">
                                    <Instagram size={24} />
                                </div>
                            </Link>
                            <Link to="">
                                <div className="p-2 border rounded-full border-black">
                                    <Youtube size={24} />
                                </div>
                            </Link>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </>
    )
}
