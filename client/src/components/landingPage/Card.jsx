import React from 'react'
import './card.css'
export default function Card({ img, heading, paragraph }) {
    return (
        <div>
            <main>
                <div className="card">
                    <img src={img} alt="" />
                    <div className="card-content">
                        <h2 className='border-l-4 pl-2 border-l-green-600'>
                            {heading}
                        </h2>
                        <p>
                            {paragraph}
                        </p>
                        {/* <a href="#" className="button">
                            Find out more
                            <span className="material-symbols-outlined">
                                arrow_right_alt
                            </span>
                        </a> */}
                    </div>
                </div>
            </main>
        </div>
    )
}
