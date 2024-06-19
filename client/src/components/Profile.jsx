import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';

function Profile() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
 

  return (
    <div className="relative ml-auto ">
      <button
        aria-controls="basic-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        className="flex items-center justify-center  ring-1  px-2 py-4 focus:ring-opacity-40 "
        onClick={handleClick }
      ><div className='flex items-center justify-center px-3'>
          <div className='p-1 rounded-full  '>
            <Avatar className='w-6 h-6'>
            
            </Avatar>
          </div>
          <div className='flex flex-col justify-start'>
             <div className='text-sm font-[inter] font-semibold'>
              Jhone Doe
            </div>
              <div className='text-slate-100 text-left'>Student </div>
         </div>
        </div>
      </button>
        <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'profile-button',
        }}
        PaperProps={{
          className: 'mt-2 rounded-lg shadow-lg border border-gray-200',
        }}
      >
        <MenuItem onClick={handleClose} className="hover:bg-gray-100 px-4 py-2 flex items-center">
          <PersonOutlineIcon className="w-6 h-6 mr-2 text-gray-700" />
          <span className="text-gray-700">Profile</span>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose} className="hover:bg-gray-100 px-4 py-2 flex items-center">
          <HelpOutlineIcon className="w-6 h-6 mr-2 text-gray-700" />
          <span className="text-gray-700">Help</span>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose} className="hover:bg-gray-100 px-4 py-2 flex items-center">
          <LogoutIcon className="w-6 h-6 mr-2 text-gray-700" />
          <span className="text-gray-700">Logout</span>
        </MenuItem>
      </Menu>
     </div>
  );
}

export default Profile;
