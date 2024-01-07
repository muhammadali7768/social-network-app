import jwt from "jsonwebtoken";
import { RedisClient } from "../config/redis";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../interfaces/user.interface";
import { NotAuthorizedError } from "../errors/not-authorized.error";
import { BadRequestError } from "../errors/bad-request.error";
const redisClient = RedisClient.getInstance().getRedisClient();
import cookie from "cookie";

declare global {
  namespace Express {
    interface Request {
      currentUser?: IUser;
    }
  }
}
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  
  console.log("Middleware Token",req.cookies.token)
  //  let token = req.headers.authorization;
  if (!req.cookies?.token) {
    throw new NotAuthorizedError();
  }
  let token = req.cookies?.token ;

  try {
    const decoded = await validateToken(token);
    console.log("Decoded before", decoded)
    if (decoded === null) {
      throw new NotAuthorizedError();
    }
    req.currentUser = decoded;
    console.log("Decoded", decoded)
    next();
  } catch (error) {
    throw new NotAuthorizedError();
  }
};

const validateToken = async (token: string) => {
 
  try {
    const decoded = (await jwt.verify(
      token,
      process.env.API_AUTH_SECRET!
    )) as IUser;
    const result = await redisClient.hExists(
      `user_tokens:${decoded.id}`, token
    );
    console.log("RESULT",result)
    if (result) {
      return decoded;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export { verifyToken, validateToken };
