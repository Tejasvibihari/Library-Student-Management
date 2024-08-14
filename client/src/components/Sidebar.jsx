// import { buttonVariants } from "../ui/button";
import { User2 } from "lucide-react";
import MenuLinks from "./ui/MenuLinks";
import { Link } from "react-router-dom";
// import Notifications from "./notifications";

export default function Sidebar() {
    // const location = useLocation();
    // // const isSignInPage = location.pathname === "/sign-in";

    // if (isSignInPage) {
    //     return null;
    // }

    return (
        <nav>
            <div className="h-12 p-2 flex items-center justify-between border-b border-b-zinc-200">
                <MenuLinks />
                <div className="md:flex flex items-center gap-2 ">
                    {/* <Notifications /> */}
                    <Link to="/profile" className='flex items-center border p-2'>
                        <User2 className="w-4 h-4 md:me-1" />
                        <span className="hidden md:flex">Profile</span>
                    </Link>
                </div>
            </div>
        </nav >
    );
}
