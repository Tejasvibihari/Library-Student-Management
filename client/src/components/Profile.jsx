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
        className="flex items-center justify-center  ring-2 px-2 py-4 focus:ring-opacity-40 "
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
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
 <div className='mx-2 px-2 '>
    <MenuItem onClick={handleClose} className="hover:bg-gray-200 mx-2">
        
          <span>  <PersonOutlineIcon className='w-4 h-4 mr-2' /></span>
               <span className='text-center'>Profile</span>
      </MenuItem>
</div>
        <Divider/>
<MenuItem onClick={handleClose} className="hover:bg-gray-200">
  <div className='flex items-center'>
    <HelpOutlineIcon className='w-6 h-6 mr-2'/>
    <span>Help</span>
  </div>
        </MenuItem>
        <Divider/>
<MenuItem onClick={handleClose} className="hover:bg-gray-200">
  <div className='flex items-center'>
    <LogoutIcon className='w-6 h-6 mr-2'/>
    <span>Logout</span>
  </div>
        </MenuItem>
     
      </Menu>
     </div>
  );
}

export default Profile;
