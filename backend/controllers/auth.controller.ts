import prisma from "../config/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { RedisClient } from "../config/redis";
import { IUser } from "../interfaces/users.interface";
import { InternalServerError } from "../errors/internal-server.error";
import { BadRequestError } from "../errors/bad-request.error";
import { NotAuthorizedError } from "../errors/not-authorized.error";
const redisClient = RedisClient.getInstance().getRedisClient();

// Register
const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    const isExist = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            username,
          },
        ],
      },
    });
    if (isExist) {
      throw new BadRequestError(
        "Email or username in use, try another email or username"
      );
    }

    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 8),
      },
    });
    res.status(201).send(user);
  } catch (error) {
    throw new InternalServerError("Unable to process user register request");
  }
};

// Login
const login = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (!user) {
      throw new BadRequestError("Email or password does not match!");
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      throw new BadRequestError("Email or password does not match!");
    }
    const { password, ...userWithoutPassword } = user;
    const usr: IUser = userWithoutPassword;
    let { token, refreshToken } = await generateTokens(usr);
    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      accessToken: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    throw new InternalServerError("Unable to process user login request");
  }
};

const refreshToken = async (req: Request, res: Response) => {
  console.log("Refresh token is called");
  const refToken = req.body.token;

  if (!refToken) throw new NotAuthorizedError();
  try {
    const user = (await jwt.verify(
      refToken,
      process.env.REFRESH_TOKEN_SECRET!
    )) as IUser;
    let { token, refreshToken } = await generateTokens(user);
    res.status(201).send({ token, refreshToken });
  } catch (err) {
    console.log("Refresh token verification error");
    throw new NotAuthorizedError();
  }
};

// Get User
const user = async (req: Request, res: Response) => {
  var token = req.headers.authorization;
  if (token) {
    try {
      const decoded = await jwt.verify(
        token.replace(/^Bearer\s/, ""),
        process.env.API_AUTH_SECRET!
      );
      if (decoded) return res.status(201).send(decoded);
      else throw new NotAuthorizedError();
    } catch (error) {
      throw new NotAuthorizedError();
    }
  } else {
    throw new NotAuthorizedError();
  }
};

const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) {
    throw new NotAuthorizedError()
  }
  try {
    await redisClient.sRem(
      `user_tokens:${req.currentUser?.id}`,
      token.replace(/^Bearer\s/, "")
    );
    res.status(200).send({});
  } catch (error) {
   throw new InternalServerError("Unable to logout user properly")
  }
};

const generateTokens = async (user: IUser) => {
  var token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.API_AUTH_SECRET!,
    {
      expiresIn: 86400, // 24 hours
    }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.REFRESH_TOKEN_SECRET!
  );
  await redisClient.sAdd(`user_tokens:${user.id}`, token);
  return { token, refreshToken };
};

export { login, register, user, logout, refreshToken };
