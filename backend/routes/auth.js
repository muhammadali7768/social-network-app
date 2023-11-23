import { Router } from 'express'
import  {verifyToken}  from "../middleware/authMiddleware.js";

const authRouter = Router()

import {login,register, refreshToken, user, logout} from '../controllers/authController.js';

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/refresh_token', refreshToken)
authRouter.get('/user', verifyToken, user)
authRouter.get("/logout",verifyToken, logout)

export default authRouter