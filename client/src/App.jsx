import SignUp from './pages/Signup'
import SignIn from './pages/SignIn'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ResetPasswordForm from './components/adminAuth/AdminResetPasswordForm'
import VerifyPasswordForm from './components/adminAuth/AdminVerifyPasswordForm'
import Home from './pages/Home'
import Email from './pages/Email'
import EmailEditor from './components/EmailEditor'
import AdminStudentAdmission from './pages/AdminStudentAdmission'
import ProtectedRoute from './pages/AdminProtectedRoute'
import AdminProtectedRoute from './pages/AdminProtectedRoute'
import StudentId from './pages/StudentId'
import StudentDetail from './pages/StudentDetail'
import StudentUpdate from './pages/StudentUpdate'
import MakePayment from './pages/MakePayment'
import IndividualPayment from './pages/IndividualPayment'

import StudentSignin from './pages/StudentSignin'
import Student from './pages/Student'
import PaymentDetail from './pages/PaymentDetail'
import StudentAdmission from './pages/StudentAdmission'
import AdminStudentDashboard from './pages/AdminStudentDashboard'
import Seats from './pages/Seats'
import Sidebar from './components/Sidebar'
import StudentIdCard from './components/StudentIdCard'
import StudentProtectedRoute from './pages/StudentProtectedRoute'
import UpdateSeat from './pages/UpdateSeat'
import LandingPage from './pages/LandingPage'
import TrashStudent from './pages/TrashStudent'



export default function App() {
  return (
    <>
      <BrowserRouter>
        <Sidebar />
        <Routes>
          {/* Admin Authentication Start */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/resetpassword" element={<ResetPasswordForm />} />
          <Route path="/verifypassword" element={<VerifyPasswordForm />} />
          {/* Admin Authentication End */}

          <Route path="/student-admission" element={<StudentAdmission />} />
          <Route path="/student-signin" element={<StudentSignin />} />

          <Route element={<StudentProtectedRoute />}>
            <Route path="/student-dashboard" element={<Student />} />
            <Route path="/student-id" element={<StudentId />} />
          </Route>

          <Route path="/" element={<LandingPage />} />

          {/* Sidebar menu Start  */}

          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin-dashboard" element={<Home />} />
            <Route path="/admin-student-admission" element={<AdminStudentAdmission />} />
            <Route path="/student-update/:_id" element={<StudentUpdate />} />
            <Route path="/email" element={<Email />} />
            <Route path="/sendemail" element={<EmailEditor />} />
            <Route path="/student-detail" element={<StudentDetail />} />
            <Route path="/make-payment" element={<MakePayment />} />
            <Route path="/make-payment/:_id" element={<IndividualPayment />} />
            <Route path="/payment-detail" element={<PaymentDetail />} />
            <Route path="/student-admin-dashboard/:_id" element={<AdminStudentDashboard />} />
            <Route path="/seat" element={<Seats />} />
            <Route path="/update-seat" element={<UpdateSeat />} />
            <Route path="/trash" element={<TrashStudent />} />
          </Route>
          {/* </Sidebar> */}


          {/* Sidebar menu End */}


        </Routes>
      </BrowserRouter>
    </>
  )
}
