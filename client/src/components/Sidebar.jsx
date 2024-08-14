import { User2 } from "lucide-react";
import MenuLinks from "./ui/MenuLinks";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Sidebar() {
    const { isAuthenticated, currentAdmin } = useSelector(state => state.admin);

    if (!isAuthenticated || currentAdmin.role !== 'admin') {
        return null; // Don't render the sidebar if the user is not authenticated or not an admin
    }

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
        </nav>
    );
}