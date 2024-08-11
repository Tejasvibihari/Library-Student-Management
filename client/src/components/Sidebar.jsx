import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, MailPlus, LayoutDashboard, UserPlus, IndianRupee } from 'lucide-react';
import Profile from './Profile'; // Adjust the import based on your file structure

const SideBar = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleToggle = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`bg-[#1c2c3f] text-white ${open ? 'w-64' : 'w-17'} transition-all duration-300`}>
        <div className="flex justify-between items-center p-4">
          <span className={`${open ? 'block' : 'hidden'} font-bold text-xl font-[inter]`}>Library Management</span>
          <button onClick={handleToggle} className="md:hidden">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <hr />
        <nav className="flex flex-col p-2 font-[inter]">
          <Link to="/" className="flex items-center p-2 hover:bg-[#283e58] hover:border-l-4 border-green-950">
            <LayoutDashboard className="w-6 h-6 mr-2" />
            <span className={`${open ? 'block' : 'hidden'}`}>Dashboard</span>
          </Link>
          <Link to="/admin-student-admission" className="flex items-center p-2 hover:bg-[#283e58] hover:border-l-4 border-red-950">
            <UserPlus className="w-6 h-6 mr-2" />
            <span className={`${open ? 'block' : 'hidden'}`}>Student Admission</span>
          </Link>
          <Link to="/student-detail" className="flex items-center p-2 hover:bg-[#283e58] hover:border-l-4 border-yellow-400">
            <User className="w-6 h-6 mr-2" />
            <span className={`${open ? 'block' : 'hidden'}`}>Student Detail</span>
          </Link>
          <Link to="/email" className="flex items-center p-2 hover:bg-[#283e58] hover:border-l-4 border-lime-400">
            <MailPlus className="w-6 h-6 mr-2" />
            <span className={`${open ? 'block' : 'hidden'}`}>Email</span>
          </Link>
          <Link to="/make-payment" className="flex items-center p-2 hover:bg-[#283e58] hover:border-l-4 border-purple-950">
            <IndianRupee className="w-6 h-6 mr-2" />
            <span className={`${open ? 'block' : 'hidden'}`}>Make Payment</span>
          </Link>
          <Link to="/payment-detail" className="flex items-center p-2 hover:bg-[#283e58] hover:border-l-4 border-purple-950">
            <IndianRupee className="w-6 h-6 mr-2" />
            <span className={`${open ? 'block' : 'hidden'}`}>Payment Detail</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="flex justify-between items-center bg-[#8e54e9] p-1 shadow-md">
          {/* <button onClick={handleToggle} className="md:hidden">
            <Menu className="w-6 h-6" />
          </button> */}
          <Profile />
        </header>
        <main className="p-4 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SideBar;
