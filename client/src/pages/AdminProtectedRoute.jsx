import { useSelector } from 'react-redux';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

export default function AdminProtectedRoute() {
    const { isAuthenticated, currentAdmin } = useSelector(state => state.admin);


    return (
        currentAdmin.role === "admin" && isAuthenticated ? <Outlet /> : <Navigate to="/signup" />
    )
}