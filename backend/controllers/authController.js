import prisma from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { redisClient } from "../config/redis.js";
const register = (req, res) => {
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
const login = (req, res) => {
  prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  })
    .then(async(user) => {
      if (!user) {
        return res
          .status(404)
          .send({ message: "Email or Password does not match!" });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          message: "Email or Password does not match!",
        });
      }
    
      let {token, refreshToken}=await generateTokens(user)
      await redisClient.sAdd(`user_tokens:${user.id}`, token);
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


const refreshToken=async(req, res) => {
  const refToken = req.body.token;
  console.log(req.body)

  if (!refToken) return res.sendStatus(401);
  try {
    const user = jwt.verify(refToken, process.env.REFRESH_TOKEN_SECRET);
    let {token, refreshToken} = await generateTokens(user);

    res.json({ token, refreshToken });
  } catch (err) {
    console.log("Error", err)
    res.sendStatus(403);
  }
};


// Get User
const user = async(req, res)=> {
  var token = req.headers.authorization;
  if (token) {
    // verifies secret and checks if the token is expired
    jwt.verify(
      token.replace(/^Bearer\s/, ""),
      process.env.API_AUTH_SECRET,
      async(err, decoded) =>{
        if (err) {
          return res.status(401).json({ message: "unauthorized" });
        } else {
          let {token, refreshToken}= await generateTokens(decoded)
          return res.json({ ...decoded, accessToken: token, refreshToken: refreshToken });
        }
      }
    );
  } else {
    return res.status(401).json({ message: "unauthorized" });
  }
};

const logout = async(req, res) => {
  const token = req.headers.authorization;
  console.log(req.userId);
  console.log("token", token);  
  try {
    await redisClient.sRem(`user_tokens:${req.userId}`, token.replace(/^Bearer\s/, ""));  
    res.json({ message: "Logout user successfully" });
  } catch (error) {
    console.error("Error removing token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateTokens=async(user)=>{
  var token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.API_AUTH_SECRET,
    {
      expiresIn: 86400, // 24 hours
    }
  );
  const refreshToken = jwt.sign({ id: user.id, email: user.email, username: user.username },
    process.env.REFRESH_TOKEN_SECRET);
    return {token, refreshToken}
}

export { login, register, user, logout, refreshToken };
