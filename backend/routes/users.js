import { users } from "../controllers/userController.js";
import { Router } from "express";
import  {verifyToken}  from "../middleware/authMiddleware.js";

const usersRouter=Router();

usersRouter.get('/users', verifyToken, users);

export default usersRouter