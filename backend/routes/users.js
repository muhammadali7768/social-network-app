import { users } from "../controllers/userController.js";
import { Router } from "express";

const usersRouter=Router();

usersRouter.get('/users', users);

export default usersRouter