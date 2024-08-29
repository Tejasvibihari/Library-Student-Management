import React from 'react';
import { AirVent, Wifi, BookHeart, Vault } from 'lucide-react';

export default function FeaturesCard({ heading, no }) {
    return (
        <div className="flex items-center p-5 bg-white shadow-md rounded-lg gap-4">
            <div className={`p-4 flex justify-center items-center rounded-md ${no === 1 ? 'bg-blue-100' :
                no === 2 ? 'bg-red-100' :
                    no === 3 ? 'bg-green-100' :
                        no === 4 ? 'bg-yellow-100' : 'bg-gray-500'
                }`}>
                {no === 1 ? <AirVent size={30} className="text-blue-500 text-3xl" />
                    : no === 2 ? <Vault size={30} className="text-red-500 text-3xl" />
                        : no === 3 ? <Wifi size={30} className="text-green-500 text-3xl" />
                            : no === 4 ? <BookHeart size={30} className="text-yellow-500 text-3xl" /> : null}
            </div>
            <h2 className="text-xl font-semibold border-l-4 pl-2 border-l-red-600">{heading}</h2>
        </div>
    );
}