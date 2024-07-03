import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';


export default function Breadcrumbs({ title, subTitle }) {
    return (
        <>
            <div className='flex items-center justify-between my-5'>
                <h1 className='font-semibold text-lg text-[#333335] text-[inter]'>{title}</h1>
                <div className='flex space-x-2'>
                    <h2 className='text-[#845adf] text-sm'>{subTitle}</h2>
                    <KeyboardDoubleArrowRightIcon sx={{ fontSize: 20, color: "grey" }} />
                    <h2 className='text-[#333335] font-semibold text-sm'>{title}</h2>
                </div>
            </div>
        </>
    )
}
