import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request.middleware";
import { body } from "express-validator";
const authRouter = Router();

import {
  login,
  register,
  refreshToken,
  user,
  logout,
} from "../controllers/auth.controller";

authRouter.post(
  "/register",
  [
    body("username").trim().isLength({min: 4, max:20}).withMessage("Username must be between 4 and 20 characters"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  register
);
authRouter.post("/login", [
  body("email").isEmail().withMessage("Email must be valid"),
  body("password")
  .trim()
  .notEmpty()
  .withMessage("You must provide a password")
],
validateRequest, login);
authRouter.get("/refresh_token", refreshToken);
authRouter.get("/current-user", verifyToken, user);
authRouter.get("/logout", verifyToken, logout);

export default authRouter;
