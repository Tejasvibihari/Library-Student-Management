import { useSelector } from 'react-redux';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

export default function StudentProtectedRoute() {
    const { isAuthenticated } = useSelector(state => state.student);
    // console.log(currentAdmin.role)

    return (
        isAuthenticated === true ? <Outlet /> : <Navigate to="/student-signin" />
    )
}