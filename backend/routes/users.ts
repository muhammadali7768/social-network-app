import { users, getOnlineUsers } from "../controllers/user.controller";
import { Router } from "express";
import  {verifyToken}  from "../middleware/auth.middleware";

const usersRouter=Router();

usersRouter.get('/all', verifyToken, users);
usersRouter.get('/online-users', verifyToken, getOnlineUsers )

export default usersRouter