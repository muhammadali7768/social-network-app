import prisma from "../config/db";
import { Request, Response } from "express";
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



export { users };
