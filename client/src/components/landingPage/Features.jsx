import React from 'react';
import FeaturesCard from './FeaturesCard';


const data = [
    {
        heading: "Fully Air Conditioned",
        no: 1
    },
    {
        heading: "Hot & Cool Water",
        no: 2
    },
    {
        heading: "High Speed Wifi",
        no: 3
    },
    {
        heading: "Reading Room",
        no: 4
    }
]
export default function Features() {
    return (
        <div className="container mx-auto px-4 py-8 my-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.map((d, i) => {
                    return <FeaturesCard key={i} heading={d.heading} no={d.no} />
                })}
            </div>
        </div>
    );
}