import authRouter from "./auth.js";
import usersRouter from "./users.js";
import express from "express";

const router=express.Router();

router.use("/api/auth",authRouter)
router.use("/api", usersRouter);

export default router;