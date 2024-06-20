import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';

export default function OnlineStatusCard() {



    // Avatar Green Dot 
    const StyledBadge = styled(Badge)(({ theme }) => ({
        '& .MuiBadge-badge': {
            backgroundColor: '#44b700',
            color: '#44b700',
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
            '&::after': {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                animation: 'ripple 1.2s infinite ease-in-out',
                border: '1px solid currentColor',
                content: '""',
            },
        },
        '@keyframes ripple': {
            '0%': {
                transform: 'scale(.8)',
                opacity: 1,
            },
            '100%': {
                transform: 'scale(2.4)',
                opacity: 0,
            },
        },
    }));
    return (
        <>
            <div className='w-full border shadow-sm'>
                <div>
                    <div className='flex justify-between items-center p-3 border-b'>
                        <h1 className='text-lg font-semibold border-l-4 pl-1 border-green-800 font-[inter]'>Online Student</h1>
                    </div>
                    <div className='p-3 border-b'>
                        <div className='flex items-center'>
                            <div>
                                <StyledBadge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    variant="dot"
                                >
                                    <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                                </StyledBadge>
                            </div>
                            <div >
                                <h5 className='font-semibold text-sm pl-2 text-gray-800'>Tejasvi Kumar</h5>
                                <p className='font-normal text-xs pl-2 text-gray-600'>+91 6205731150</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
