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


export default function TestimonialReviewCard({ sid, name, img, id, review }) {

    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [reviewData, setReviewData] = useState({});





    return (
        <>
            <div className='border shadow-xl p-3 w-96 max-w-auto'>
                <div className='flex flex-row items-start gap-2 justify-start'>
                    <div className='flex flex-col'>
                        <img src={img} className='w-24 rounded-full' />
                        <div className='font-bold text-center'>
                            {sid}
                        </div>
                        <div className='font-semibold font-inter'>
                            {name}
                        </div>
                    </div>
                    <div className=''>
                        {review}
                    </div>
                </div>
            </div>
        </>
    )
}
