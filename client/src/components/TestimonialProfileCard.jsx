import { Star } from 'lucide-react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect, useState } from 'react';
import client from '../services/axiosClient';


export default function TestimonialProfileCard({ sid, name, img, id }) {

    const [open, setOpen] = useState(false);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);
    const [reviewData, setReviewData] = useState({});
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        const reviewData = () => {
            setReviewData({
                review: review,
                studentId: id
            })
        }
        reviewData()
    }, [id, review]);

    const handleReviewSubmit = async () => {
        try {
            setLoading(true);
            const response = await client.post('/api/testimonial/add-testimonial', reviewData);
            console.log(response.data.message);
            setLoading(false);
            handleClose();
        } catch (error) {
            console.log(error)

            setLoading(false);
        }
    }


    return (
        <>
            <div className='border shadow-xl p-3 w-44'>
                <div className='flex flex-col items-center justify-center'>
                    <img src={img} className='w-24 rounded-full' />
                    <div className='font-bold text-center'>
                        {sid}
                    </div>
                    <div className='font-semibold font-inter'>
                        {name}
                    </div>
                    <button onClick={handleClickOpen} className='mt-2 p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                        <div className='flex items-center'>
                            <Star size={17} className='mr-2' />
                            Write Review
                        </div>
                    </button>
                </div>
            </div >

            <Dialog

                open={open}
                onClose={handleClose}
                PaperProps={{
                    onSubmit: (event) => {
                        event.preventDefault();
                        handleClose();
                    },
                }}
            >
                <DialogTitle>Write Your Review</DialogTitle>
                <DialogContent>

                    <DialogContentText>
                        <div className='w-96 mb-4'>
                            <div className='flex flex-col items-center justify-center'>
                                <img src={img} className='w-24 rounded-full' />
                                <div className='font-bold text-center'>
                                    {sid}
                                </div>
                                <div className='font-semibold font-inter'>
                                    {name}
                                </div>
                            </div>
                        </div >
                    </DialogContentText>
                    <textarea
                        autoFocus
                        required
                        rows="10"
                        cols="50"
                        placeholder='Write your review here.....'
                        type="text"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}

                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" onClick={handleReviewSubmit}>
                        {loading ? 'Loading...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
