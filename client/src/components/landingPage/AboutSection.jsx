import React from 'react'

export default function AboutSection() {
    return (
        <>
            <div id='about' className='my-20 max-w-5xl mx-auto'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-10 justify-center items-center'>
                    <div className='text-right p-4'>
                        <h1 className='font-bold text-xl mb-4 font-[inter] text-right tracking-[.2em] border-r-4 pr-2 border-r-green-600'>
                            ABOUT US
                        </h1>
                        <h4 className='text-gray-500 font-semibold text-right'>
                            Discover a serene study and co-working space with modern amenities, dedicated zones, high-speed Wi-Fi, and a supportive community.
                        </h4>
                        <p className='text-[#707070] text-right my-10'>
                            Our self-study and co-working space offers a calm and focused
                            environment with all essentials—high-speed Wi-Fi,
                            quiet study zones, and comfortable workspaces. Join
                            a community that values productivity, collaboration,
                            and personal growth
                        </p>
                        <a href='https://maps.app.goo.gl/7kiBWukk7FyoA2xeA' target="_blank" className='bg-black text-white px-10 py-3 font-semibold font-[inter] hover:bg-white hover:text-black border-2 border-black transition-all'>
                            VISIT NOW
                        </a>
                    </div>
                    <div className='p-4'>
                        <img src='./img/studyAbout.jpg' />
                    </div>

                </div>
            </div>
        </>
    )
}
