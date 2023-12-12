import prisma from "../config/db";
import { Request, Response } from "express";

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

export { users };
