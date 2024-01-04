import prisma from "../config/db";
import { Request, Response } from "express";
import { RedisClient } from "../config/redis";
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
        return res.status(404).send({ message: "No Record Found" });
      }

      res.json({ users: users });
    });
};

const getOnlineUsers = async (req: Request, res: Response) => {
  const redisClient = RedisClient.getInstance();
  const onlineUsers = await redisClient.getOnlineUsers("online_users");
  return res.json({ users: onlineUsers });
};

export { users, getOnlineUsers };
