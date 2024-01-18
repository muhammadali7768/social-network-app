import prisma from "../config/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { RedisClient } from "../config/redis";
import { IUser } from "../interfaces/user.interface";
import { InternalServerError } from "../errors/internal-server.error";
import { BadRequestError } from "../errors/bad-request.error";
import { NotAuthorizedError } from "../errors/not-authorized.error";
const redisClient = RedisClient.getInstance().getRedisClient();

// Register
const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  
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

    let { token, refreshToken } = await generateTokens(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).send({id: user.id, email: user.email, username:user.username});
 
};

// Login
const login = async (req: Request, res: Response) => {
 
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    console.log("Login route user User", user)
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
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
    });

};

const refreshToken = async (req: Request, res: Response) => {
  console.log("Refresh token is called");
  const refToken = req.cookies.refreshToken;
  const oldToken = req.cookies.token;

  if (!refToken) throw new NotAuthorizedError();
 
    const user = (await jwt.verify(
      refToken,
      process.env.REFRESH_TOKEN_SECRET!
    )) as IUser;

    //Delete old tokens for which we have refreshed the tokens
    const isDeleted = await redisClient.hDel(
      `user_tokens:${user.id}`,
      oldToken
    );
   
    if (!isDeleted) {
      console.log(`IS Deleted token for user id: ${user.id}`, isDeleted);
      throw new NotAuthorizedError();
    }

    let { token, refreshToken } = await generateTokens(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).send({});

};

// Get User
const user = async (req: Request, res: Response) => {
  let token = req.cookies?.token;
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
  let token = req.cookies.token;

  if (!token) {
    throw new NotAuthorizedError();
  }

  try {
    console.log("user", req.currentUser);
    await redisClient.hDel(`user_tokens:${req.currentUser?.id}`, token);
    res.status(200).send({});
  } catch (error) {
    throw new NotAuthorizedError();
  }
};

const generateTokens = async (user: IUser) => {
  var token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.API_AUTH_SECRET!,
    {
      // expiresIn: 86400, // 24 hours
      expiresIn: 300, //5 minutes for testing purposes
    }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.REFRESH_TOKEN_SECRET!
  );
  await redisClient.hSet(`user_tokens:${user.id}`, token, refreshToken);
  return { token, refreshToken };
};

export { login, register, user, logout, refreshToken };
