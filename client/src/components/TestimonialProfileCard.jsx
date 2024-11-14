import { Star } from 'lucide-react';

export default function TestimonialProfileCard({ id, name, img }) {
    return (
        <>
            <div className='border shadow-xl p-3 w-44'>
                <div className='flex flex-col items-center justify-center'>
                    <img src={img} className='w-24 rounded-full' />
                    <div className='font-bold text-center'>
                        {id}
                    </div>
                    <div className='font-semibold font-inter'>
                        {name}
                    </div>
                    <button type='submit' className='mt-2 p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                        <div className='flex items-center'>
                            <Star size={17} className='mr-2' />
                            Write Review
                        </div>
                    </button>
                </div>
            </div >
        </>
    )
}
