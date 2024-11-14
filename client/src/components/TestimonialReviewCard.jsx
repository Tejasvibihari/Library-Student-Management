import { Star, Trash } from 'lucide-react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect, useState } from 'react';
import client from '../services/axiosClient';
import CircularLoading from './ui/CircularLoading';

export default function TestimonialReviewCard({ sid, name, img, id, review, onDelete }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await client.delete(`/api/testimonial/delete-testimonial/${id}`);
            onDelete(id); // Call the onDelete function passed as a prop
        } catch (error) {
            console.error('Error deleting review:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='border shadow-xl p-3 w-96 max-w-auto'>
            <div className='flex flex-col items-center gap-2 justify-center'>
                <img src={img} className='w-24 rounded-full' />
                <div className='font-bold text-center'>
                    {sid}
                </div>
                <div className='font-semibold font-inter'>
                    {name}
                </div>
                <div className='text-center'>
                    {review}
                </div>
                {/* <button
                    className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'
                    onClick={handleDelete}
                    disabled={loading}
                >
                    {loading ? (
                        <div className='flex items-center justify-center'>
                            <span className='mr-2'>Please Wait..</span>
                            <CircularLoading size={25} />
                        </div>
                    ) : (
                        <div className='flex items-center'>
                            <Trash size={17} className='mr-2' />Delete Review
                        </div>
                    )}
                </button> */}
            </div>
        </div>
    );
}