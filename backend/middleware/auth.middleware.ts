import jwt from "jsonwebtoken";
import { RedisClient } from "../config/redis";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../interfaces/users.interface";

const redisClient=RedisClient.getInstance().getRedisClient(); 

declare global {
  namespace Express {
    interface Request {
      currentUser?: IUser;
    }
  }
}
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }
  try {
    const _token = token.replace(/^Bearer\s/, "");
    const decoded = jwt.verify(
      _token,
      process.env.API_AUTH_SECRET!
    ) as IUser;
    console.log("token", _token);
    const isValidToken = await validateToken(decoded.id, _token);
    console.log("isValidToken", isValidToken);
    if (!isValidToken) {
      return res.status(401).send({
        message: "Token is not valid",
      });
    }
    req.currentUser = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const validateToken = async (userId: number, token: string) => {
  try {
    const result = await redisClient.sIsMember(`user_tokens:${userId}`, token);
    return result;
  } catch (error) {
    console.error("Error validating token:", error);
  }
};

export { verifyToken };
