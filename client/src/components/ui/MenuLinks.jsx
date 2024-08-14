import { useState } from "react";
import { Link } from "react-router-dom";
import { MenuIcon, LogOutIcon } from "lucide-react";
import { MenuLinkItems } from './MenuList'

const MenuLinks = () => {
  const [showMenu, setShowMenu] = useState(false);

  const handleOnToggleShowMenu = () => setShowMenu((prev) => !prev);

  return (
    <>
      <div className="inline-flex items-center gap-3 py-2">
        <div onClick={handleOnToggleShowMenu}>
          <MenuIcon className="w-4 h-4" />
        </div>
        <div className="flex items-center justify-center h-8 w-8 bg-black text-white font-bold rounded-full">
          BL
        </div>
        <Link to="/" className="inline-flex flex-col gap-1">
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
          to="/"
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
              <p className="px-2 text-zinc-400">{item.label}</p>
              {item.items.map((child) => (
                <li key={child.id}>
                  <Link
                    to={child.href}
                    onClick={handleOnToggleShowMenu}
                    className='w-full flex gap-2 px-2 items-center hover:bg-gray-100 p-2'
                  >
                    <child.icon className="w-4 h-4" />
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
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