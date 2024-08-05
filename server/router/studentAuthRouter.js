import express from 'express'
import { SignIn } from '../controllers/studentAuth.js'



const router = express.Router()


router.post('/signin', SignIn);
// router.post('/logout', StudenstLogOut);


export default router