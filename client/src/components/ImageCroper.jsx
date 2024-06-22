import React, { useRef, useState } from "react";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; // Import CSS for ReactCrop
import Button from '@mui/material/Button';
import setCanvasPreview from "./setCanvasPreview"; // Assume this function exists

const ASPECT_RATIO = 1;
const MIN_WIDTH = 200;

export default function ImageCroper({ onImageCrop, closecroper }) {
    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const [imgSrc, setImageSrc] = useState('');
    const [crop, setCrop] = useState(null);

    // const handleCroppedImage = (imageDataUrl) => {
    //     setCroppedImage(imageDataUrl);
    //     console.log("Received cropped image:", imageDataUrl);
    // };

    const onSelectFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const imageUrl = reader.result?.toString() || '';
            setImageSrc(imageUrl);
        });
        reader.readAsDataURL(file);
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const cropWidthInPercent = (MIN_WIDTH / width) * 100;
        const crop = {
            unit: "%",
            width: cropWidthInPercent,
            aspect: ASPECT_RATIO
        };
        setCrop(crop);
    };

    const handleCropButtonClick = () => {
        if (imgRef.current && previewCanvasRef.current) {
            const canvas = previewCanvasRef.current;
            setCanvasPreview(
                imgRef.current,
                canvas,
                crop
            );

            const dataUrl = canvas.toDataURL();
            onImageCrop(dataUrl);
            closecroper()
        }
    };

    return (
        <div>
            <div className="flex flex-col gap-4">
                <div className="w-full sm:w-3/4 md:w-1/2 lg:w-full xl:w-full my-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onSelectFile}
                        className="w-full text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-gray-700 file:text-sky-300 hover:file:bg-gray-600"
                    />
                </div>
                {imgSrc && (
                    <div className="flex flex-col items-center justify-center w-full sm:w-3/4 md:w-1/2 lg:w-full xl:w-full h-96 bg-gray-100 border-gray-300">
                        <ReactCrop
                            crop={crop}
                            circularCrop
                            keepSelection
                            aspect={ASPECT_RATIO}
                            minWidth={MIN_WIDTH}
                            onChange={(percentCrop) => setCrop(percentCrop)}
                        >
                            <img
                                ref={imgRef}
                                src={imgSrc}
                                onLoad={onImageLoad}
                                alt="upload"
                                style={{ maxHeight: "24rem" }}
                            />
                        </ReactCrop>
                        <Button className="my-1" onClick={handleCropButtonClick}>
                            Crop Image
                        </Button>
                    </div>
                )}
            </div>
            {crop && (
                <canvas
                    ref={previewCanvasRef}
                    className="mt-4"
                    style={{
                        display: "none",
                        border: "1px solid black",
                        objectFit: "contain",
                        width: 150,
                        height: 150,
                    }}
                />
            )}
        </div>
    );
}