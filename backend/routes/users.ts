import { users } from "../controllers/user.controller";
import { Router } from "express";
import  {verifyToken}  from "../middleware/auth.middleware";

const usersRouter=Router();

usersRouter.get('/all', verifyToken, users);

export default usersRouter