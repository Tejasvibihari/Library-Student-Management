import SignUp from './pages/Signup'
import SignIn from './pages/SignIn'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ResetPasswordForm from './components/adminAuth/AdminResetPasswordForm'
import VerifyPasswordForm from './components/adminAuth/AdminVerifyPasswordForm'
import Home from './pages/Home'
import Email from './pages/Email'
import EmailEditor from './components/EmailEditor'
import StudentAdmission from './pages/StudentAdmission'
import ProtectedRoute from './pages/AdminProtectedRoute'
import AdminProtectedRoute from './pages/AdminProtectedRoute'
import StudentId from './pages/StudentId'
import StudentDetail from './pages/StudentDetail'
import StudentUpdate from './pages/StudentUpdate'
import MakePayment from './pages/MakePayment'
import IndividualPayment from './pages/IndividualPayment'

import StudentSignin from './pages/StudentSignin'
import Student from './pages/Student'



export default function App() {
  return (
    <>
      <BrowserRouter>

        <Routes>
          {/* Admin Authentication Start */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/resetpassword" element={<ResetPasswordForm />} />
          <Route path="/verifypassword" element={<VerifyPasswordForm />} />
          {/* Admin Authentication End */}

          <Route path="/student-signin" element={<StudentSignin />} />
          <Route path="/student-dashboard" element={<Student />} />

          {/* Sidebar menu Start  */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/student-admission" element={<StudentAdmission />} />
            <Route path="/student-update/:_id" element={<StudentUpdate />} />
            <Route path="/email" element={<Email />} />
            <Route path="/sendemail" element={<EmailEditor />} />
            <Route path="/student-detail" element={<StudentDetail />} />
            <Route path="/make-payment" element={<MakePayment />} />
            <Route path="/make-payment/:_id" element={<IndividualPayment />} />
          </Route>

          <Route element={<AdminProtectedRoute />}>
            <Route path="/studentId" element={<StudentId />} />
          </Route>


          {/* Sidebar menu End */}


        </Routes>
      </BrowserRouter>
    </>
  )
}
