import prisma from "../config/db";
import { Request, Response } from "express";
import { RedisClient } from "../config/redis";
import { NotFoundError } from "../errors/not-found.error";
// Get All Users
const users = (req: Request, res: Response) => {
  prisma.user
    .findMany({
      select: {
        id: true,
        username: true,
        email: true,
      },
    })
    .then(async (users) => {
      if (!users) {
        throw new NotFoundError("users not found")
      }

      res.status(200).send({ users: users });
    });
};

const getOnlineUsers = async (req: Request, res: Response) => {
  const redisClient = RedisClient.getInstance();
  const onlineUsers = await redisClient.getOnlineUsers("online_users");
  return res.json({ users: onlineUsers });
};

export { users, getOnlineUsers };
