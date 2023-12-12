import authRouter from "./auth";
import usersRouter from "./users";
import express from "express";

const router=express.Router();

router.use("/api/auth",authRouter)
router.use("/api/users", usersRouter);

export default router;