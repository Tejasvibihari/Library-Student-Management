import { useSelector } from 'react-redux';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

export default function AdminProtectedRoute() {
    const { isAuthenticated, currentAdmin } = useSelector(state => state.admin);
    // console.log(currentAdmin.role)

    return (
        isAuthenticated === true ? <Outlet /> : <Navigate to="/signin" />
    )
}