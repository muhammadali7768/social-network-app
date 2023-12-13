import prisma from "../config/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request,Response } from "express";
import { RedisClient } from "../config/redis";
import { IUser } from "../interfaces/users.interface";
const redisClient=RedisClient.getInstance().getRedisClient(); 
const register = (req:Request, res:Response) => {
  // Save User to Database
  prisma.user
    .create({
      data: {
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
      },
    })
    .then((user) => {
      res.send({ message: "User registered successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Login
const login = (req:Request, res:Response) => {
  prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  })
    .then(async(user) => {
      if (!user) {
        return res
          .status(404)
          .send({ message: "Email or password does not match!" });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          message: "Email or password does not match!",
        });
      }
      const {password,...userWithoutPassword}=user
      const usr:IUser= userWithoutPassword;
      let {token, refreshToken}=await generateTokens(usr)
       res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken: token,
        refreshToken:refreshToken
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};


const refreshToken=async(req:Request, res:Response) => {
  console.log("Refresh token is called")
  const refToken = req.body.token;
  console.log(req.body)

  if (!refToken) return res.sendStatus(401);
  try {
    const user = jwt.verify(refToken, process.env.REFRESH_TOKEN_SECRET!) as IUser;
    let {token, refreshToken} = await generateTokens(user);
    res.send({ token, refreshToken });
  } catch (err) {
    console.log("Error", err)
    res.sendStatus(403);
  }
};


// Get User
const user = async(req:Request, res:Response)=> {
  var token = req.headers.authorization;
  if (token) {
    // verifies secret and checks if the token is expired
    jwt.verify(
      token.replace(/^Bearer\s/, ""),
      process.env.API_AUTH_SECRET!,
      async(err, decoded) =>{
        if (err) {
          return res.status(401).send({ message: "unauthorized" });
        } else {
          return res.send(decoded);
        }
      }
    );
  } else {
    return res.status(401).send({ message: "unauthorized" });
  }
};

const logout = async(req:Request, res:Response) => {
  const token = req.headers.authorization;
  if(!token){
    return res.status(401).send({error: "No token provided"});
    }
  
  console.log(req.currentUser);
  console.log("token", token); 
  try {
    await redisClient.sRem(`user_tokens:${req.currentUser?.id}`, token.replace(/^Bearer\s/, ""));  
    res.send({ message: "Logout user successfully" });
  } catch (error) {
    console.error("Error removing token:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

const generateTokens=async(user:IUser)=>{
  var token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.API_AUTH_SECRET!,
    {
      expiresIn: 86400, // 24 hours
    }
  );
  const refreshToken = jwt.sign({ id: user.id, email: user.email, username: user.username },
    process.env.REFRESH_TOKEN_SECRET!);
    await redisClient.sAdd(`user_tokens:${user.id}`, token);
    return {token, refreshToken}
}

export { login, register, user, logout, refreshToken };
