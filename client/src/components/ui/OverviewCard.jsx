import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, MonitorCheck, ShieldAlert, ShieldX } from 'lucide-react';
// import { CalendarArrowDown } from 'lucide-react';
import { IndianRupee } from 'lucide-react';
export default function OverviewCard({ title, value, icon, link }) {
    const [currentValue, setCurrentValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value, 10);
        if (start === end) return;

        let incrementTime = (end - start) / 20; // Adjust the speed of the animation here

        let timer = setInterval(() => {
            start += 1;
            setCurrentValue(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);
    return (
        <>
            <div className='p-4 bg-white border-green-700 border-solid border-[1px] shadow-lg rounded-md'>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <p className='text-[#818995] font-semibold font-[inter] text-sm my-2 border-l-green-900 border-l-4 pl-1'>
                            {title}
                        </p>
                        <div className='text-[#1b2c3f] font-bold font-[inter] text-xl my-2'>
                            {value}
                        </div>
                    </div>
                    <div className='flex justify-end rounded-lg items-center'>
                        <div className={`${icon === 'all' ? 'bg-green-400' : icon === 'active' ? 'bg-blue-400' : icon === 'pending' ? "bg-yellow-400" : "bg-red-400"} p-4 rounded-lg`}>
                            {icon === "all" ? <Users color="#034f16" size={30} /> : icon === "active" ? <MonitorCheck color="#1707ed" size={30} /> : icon === "pending" ? <ShieldAlert color="#574105" size={30} /> : icon === "rupee" ? <IndianRupee color="#6f0b0b" size={30} /> : <ShieldX color="#6f0b0b" size={30} />}
                        </div>

                    </div>
                </div>
                <div className='flex justify-end'>
                    <Link to={`/${link}`} className='text-[#818995] font-semibold font-[inter] text-sm underline'>
                        View More
                    </Link>
                </div>
            </div >
        </>
    )
}
