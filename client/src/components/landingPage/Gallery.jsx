import React from 'react';

export default function Gallery() {
    const images = [
        '/gallery/g1.jpg',
        '/gallery/g2.jpg',
        '/gallery/g3.jpg',
        '/gallery/g1.jpg',
        '/gallery/g1.jpg',
        '/gallery/g1.jpg',
        '/gallery/g1.jpg',
        '/gallery/g1.jpg',
        '/gallery/g1.jpg',
        '/gallery/g1.jpg',
        '/gallery/g1.jpg',
        '/gallery/g1.jpg',
    ];

    return (
        <section id="gallery" className="py-8">
            <div className="px-20">
                <h1 className='font-bold text-2xl mb-16 font-[inter] md:text-left tracking-[.2em] md:border-r-0 md:pl-2 md:border-l-teal-600 md:border-l-4 border-l-4 border-r-4 pl-2 border-l-red-600 border-r-red-600 text-center'>
                    Gallery
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {images.map((src, index) => (
                        <div key={index} className="relative w-full pb-full bg-gray-200">
                            <img
                                src={src}
                                alt={`Gallery Image ${index + 1}`}
                                className=" top-0 left-0 w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}