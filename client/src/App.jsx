import React from 'react'
import SignUp from './pages/Signup'
import SignIn from './pages/SignIn'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ResetPasswordForm from './components/adminAuth/AdminResetPasswordForm'
import VerifyPasswordForm from './components/adminAuth/AdminVerifyPasswordForm'

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
        </Routes>
      </BrowserRouter>
    </>
  )
}
