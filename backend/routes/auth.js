import { Router } from 'express'

const authRouter = Router()

import {login,register, refreshToken, user} from '../controllers/authController.js';

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/refresh_token', refreshToken)
authRouter.get('/user', user)

export default authRouter