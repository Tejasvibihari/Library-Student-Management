import React, { useState, useEffect } from 'react';

const ReviewDialog = ({ open, onClose, review, studentId, onSave }) => {
    const [reviewData, setReviewData] = useState({ review: '', studentId: '' });

    useEffect(() => {
        if (open) {
            setReviewData({ review, studentId });
        }
    }, [open, review, studentId]);

    const handleSave = () => {
        onSave(reviewData);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="dialog">
            <textarea
                value={reviewData.review}
                onChange={(e) => setReviewData({ ...reviewData, review: e.target.value })}
            />
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};

export default ReviewDialog;