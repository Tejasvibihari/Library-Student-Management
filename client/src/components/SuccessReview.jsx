// src/components/AdmissionSuccess.js
import { Star } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const AdmissionSuccess = () => {
    const googleReviewLink = "https://g.page/r/Ce_dQ16U52_SEBM/review";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg text-center">
                <h1 className="text-4xl font-bold text-green-500">🎉 Admission Successful!</h1>
                <p className="mt-4 text-lg text-gray-600">
                    Welcome to Bihari Library! Your admission has been confirmed.
                </p>

                {/* <div className="mt-6 text-left">
                    <h3 className="text-xl font-semibold text-gray-800">Your Admission Details:</h3>
                    <ul className="mt-4 text-gray-700">
                        <li><strong>Student ID:</strong> YourStudentID</li>
                        <li><strong>Name:</strong> YourName</li>
                        <li><strong>Shift:</strong> YourShift</li>
                    </ul>
                </div> */}

                <p className="mt-6 text-lg text-gray-700">
                    We would appreciate your feedback! Please leave us a review on Google.
                </p>

                <div className="flex flex-col my-4">
                    <a
                        href={googleReviewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className='p-2 w-md border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>
                        <div className='flex items-center'>
                            <Star size={17} className='mr-2' />Leave a Google Review</div>
                    </a>

                    <Link
                        to="/student-signin"
                        className="mt-2 flex items-center justify-center text-blue-500 underline hover:text-blue-600 transition-colors"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdmissionSuccess;
