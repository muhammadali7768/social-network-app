import jwt from "jsonwebtoken";
import { RedisClient } from "../config/redis";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../interfaces/user.interface";
import { NotAuthorizedError } from "../errors/not-authorized.error";
import { BadRequestError } from "../errors/bad-request.error";
const redisClient = RedisClient.getInstance().getRedisClient();

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
    throw new NotAuthorizedError();
  }
  try {
    const decoded = await validateToken(token);
    if (decoded === null) {
      throw new NotAuthorizedError();
    }
    req.currentUser = decoded;
    next();
  } catch (error) {
    throw new BadRequestError("Unable to validate the user provided token");
  }
};

const validateToken = async (token: string) => {
  const _token = token.replace(/^Bearer\s/, "");
  try {
    const decoded = (await jwt.verify(
      _token,
      process.env.API_AUTH_SECRET!
    )) as IUser;
    const result = await redisClient.sIsMember(
      `user_tokens:${decoded.id}`,
      _token
    );
    if (result) {
      return decoded;
    }
    return null;
  } catch (error) {
    console.error("Error validating token:", error);
    return null;
  }
};

export { verifyToken, validateToken };
