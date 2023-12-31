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
    const decoded = await validateToken(token);
    if (decoded ===null) {
      return res.status(401).send({
        message: "Token is not valid",
      });
    }
    req.currentUser = decoded;
    next();
  } catch (error) {
   
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const validateToken = async (token: string) => {
  const _token = token.replace(/^Bearer\s/, "");
   try {
    const decoded =await jwt.verify(
      _token,
      process.env.API_AUTH_SECRET!
    ) as IUser;
    const result = await redisClient.sIsMember(`user_tokens:${decoded.id}`, _token);
    if(result){
      return decoded
    }
    return null;
  } catch (error) {
    // if (error instanceof jwt.JsonWebTokenError) {
    //   return res.status(401).json({ message: "Invalid token" });
    // } else if (error instanceof jwt.TokenExpiredError) {
    //   return res.status(401).json({ message: "Token expired" });
    // }
    console.error("Error validating token:", error);
    return null
  }
};

export { verifyToken, validateToken };
