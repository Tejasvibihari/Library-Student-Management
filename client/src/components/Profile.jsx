import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Avatar from '@mui/material/Avatar';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

function Profile() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative ml-auto">
      <button
        className="flex items-center justify-center py-2 px-3 border rounded-2xl  shadow-md"
        onClick={toggleDropdown}
      >
        <div className="flex items-center space-x-2">
          {/* Avatar */}
          <Avatar alt="Profile Avatar" src="/Avatar.png" />
          {/* Username */}
          <div className="text-sm font-semibold">John Doe</div>
        </div>
        {/* Dropdown icon */}
        <ChevronDown className="ml-2" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48  rounded-md shadow-lg border border-neutral-200">
          <div className="py-1">
                      {/* Profile option */}
            <button className="block w-full text-left px-4 py-2 text-sm text-neutral-900 hover:text-primary-500">
             <span> <PersonOutlineIcon className='w-6 h-6'/></span> Profile
            </button>
            {/* Help option */}
            <button className="block w-full text-left px-4 py-2 text-sm text-neutral-900 hover:text-primary-500">
             <span>< HelpOutlineIcon className='w-6 h-6' /></span> Help
            </button>
            {/* Logout option */}
            <button className="block w-full text-left px-4 py-2 text-sm text-neutral-900 hover:text-primary-500">
             <span>< LogoutIcon className='w-6 h-6' /></span> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
