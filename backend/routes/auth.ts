import { Router } from 'express'
import  {verifyToken}  from "../middleware/auth.middleware";

const authRouter = Router()

import {login,register, refreshToken, user, logout} from '../controllers/auth.controller';

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/refresh_token', refreshToken)
authRouter.get('/curren-user', verifyToken, user)
authRouter.get("/logout",verifyToken, logout)

export default authRouter