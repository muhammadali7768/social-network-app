import { Router } from 'express'

const authRouter = Router()

import {login,register, refreshToken} from '../controllers/authController.js';

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/refresh_token', refreshToken)

export default authRouter