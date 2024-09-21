import { useState } from "react";
import { Link } from "react-router-dom";
import { MenuIcon, LogOutIcon, ArrowBigUpDash } from "lucide-react";
import { MenuLinkItems } from './MenuList'
import CircularLoading from "./CircularLoading";
import client from "../../services/axiosClient";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const MenuLinks = () => {
  const [showMenu, setShowMenu] = useState(false);
  const handleOnToggleShowMenu = () => setShowMenu((prev) => !prev);
  const [loading, setLoading] = useState(false)
  const [alertStatus, setAlertStatus] = useState("")
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const instantUpdate = async () => {
    try {
      setLoading(true)
      const response = await client.post('/api/update/update-student')
      console.log(response)
      setAlertStatus(response.data.message)
      setLoading(false)
      handleClick()
    } catch (error) {
      console.log(error)
      setLoading(false)
      if (error.response && error.response.data && error.response.data.message) {
        setAlertStatus(error.response.data.message);
        handleClick()
      } else if (error.message) {
        setAlertStatus(error.message);
        handleClick()
      } else {
        setAlertStatus('An unknown error occurred');
        handleClick()
      }
    }
  }

  return (
    <>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          {...alertStatus === "Updated Success" ? { severity: "success" } : { severity: "error" }}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertStatus}
        </Alert>
      </Snackbar>
      <div className="inline-flex items-center gap-3 py-2">
        <div onClick={handleOnToggleShowMenu} className="cursor-pointer">
          <MenuIcon className="w-4 h-4" />
        </div>
        <div className="flex items-center justify-center h-8 w-8 bg-black text-white font-bold rounded-full">
          BL
          {/* <img src="./img/biharilogo.png" /> */}
        </div>
        <Link to="/admin-dashboard" className="inline-flex flex-col gap-1">
          <p className="text-base leading-none font-semibold">Bihari Library</p>
          <p className="text-xxs leading-none text-zinc-400">
            A unit of Bihari Traders
          </p>
        </Link>
      </div>
      {showMenu && (
        <div
          onClick={handleOnToggleShowMenu}
          className="fixed top-0 left-0 z-20 h-[100svh] w-full bg-zinc-900/20"
        />
      )}
      <div
        className={`fixed top-0 left-0 z-20 h-[100svh] max-w-xs w-full p-2 border-r border-r-zinc-200 flex flex-col bg-white transition-transform duration-200 origin-left ${showMenu ? "scale-x-100" : "scale-x-0"
          }`}
      >
        <Link
          to="/admin-dashboard"
          onClick={handleOnToggleShowMenu}
          className="inline-flex flex-col gap-1 p-2"
        >
          <p className="text-base leading-none font-semibold">Bihari Library</p>
          <p className="text-xxs leading-none text-zinc-400">
            Powered by Bihari Organization
          </p>
        </Link>
        <div className="flex-1 overflow-y-auto flex flex-col gap-6 py-2">
          {MenuLinkItems.map((item) => (
            <ul key={item.label} className="flex flex-col">
              {item.items.map((child) => (
                <li key={child.id}>
                  <div className="group w-full">
                    <Link
                      to={child.href}
                      onClick={handleOnToggleShowMenu}
                      className='w-full flex gap-2 px-2 items-center hover:bg-gray-100 p-2 hover:border-l-4 border-green-600 transition-all'
                    >
                      <child.icon className="w-4 h-4 group-hover:text-red-700 transition-all" />
                      {child.name}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ))}
        </div>
        <hr className="bg-gray-400 h-[2px] my-4" />
        <div className="my-2">
          <button onClick={instantUpdate} className='p-2 w-full border rounded-md flex justify-center items-center text-white bg-[#8e54e9] hover:bg-[#8e54e9e6]'>

            {loading ? <div className='flex items-center justify-center'><span className='mr-2'>Please Wait..</span><CircularLoading size={25} /></div> :
              <div className='flex items-center justify-center w-full'>
                <ArrowBigUpDash size={17} className='mr-2' />Instatnt System Update</div>}
          </button>
        </div>
        <div
          onClick={handleOnToggleShowMenu}
          className="mt-auto w-full gap-2 px-2 text-red-600 flex items-center cursor-pointer"
        >

          <LogOutIcon className="w-4 h-4" />
          Sign out
        </div>
      </div>
    </>
  );
};
export default MenuLinks;