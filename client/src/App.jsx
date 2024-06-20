import SignUp from './pages/Signup'
import SignIn from './pages/SignIn'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ResetPasswordForm from './components/adminAuth/AdminResetPasswordForm'
import VerifyPasswordForm from './components/adminAuth/AdminVerifyPasswordForm'
import Home from './pages/Home'
import Email from './pages/Email'



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
          {/* Sidebar menu Start  */}
          <Route path="/" element={<Home />} />
          <Route path="/email" element={<Email />} />
          {/* Sidebar menu End */}


        </Routes>
      </BrowserRouter>
    </>
  )
}
