import React from 'react'
import Card from './Card'

const data = [
    {
        img: './img/seatbook.jpg',
        heading: 'Reserved Seat',
        paragraph: 'Every student is allocated a reserved seat for their designated shift, ensuring a dedicated space for focused study. This system guarantees comfort and organization throughout the day'
    },
    {
        img: './img/locker.jpg',
        heading: 'Free Locker',
        paragraph: 'Each student receives access to a free locker to securely store their personal belongings, providing convenience and ensuring a clutter-free study environment'
    },
    {
        img: './img/seatbook.jpg',
        heading: 'Seat Booking',
        paragraph: 'Book your seat in advance.'
    }
]
export default function Services() {
    return (
        <>
            <div id='service' className='my-10'>
                <div className='px-16'>
                    <h1 className='font-bold text-2xl mb-4 font-[inter] md:text-right tracking-[.2em] md:border-r-4 md:pr-2 md:border-r-red-600 md:border-l-0 border-l-4 border-r-4 pl-2 border-l-red-600 border-r-red-600 text-center'>
                        Our Services
                    </h1>
                </div>
                <div className='grid gird-cols-1 md:grid-cols-3'>
                    {data.map((item, index) => {
                        return (
                            <Card key={index} img={item.img} heading={item.heading} paragraph={item.paragraph} />
                        )
                    })}
                </div>
            </div>
        </>
    )
}
