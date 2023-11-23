import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";
const verifyToken = async(req, res, next) => {
  let token = req.headers.authorization

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }
  try{
    const _token=token.replace(/^Bearer\s/, '')
  const decoded= jwt.verify(_token, process.env.API_AUTH_SECRET);
  console.log("token",_token)
  const isValidToken = await validateToken(decoded.id, _token);
  console.log("isValidToken",isValidToken)
  if(!isValidToken){
    return res.status(401).send({
      message: "Token is not valid"
    });
  }
  req.userId = decoded.id;
  next();
}catch(error){
  if(error instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  else if(error instanceof jwt.TokenExpiredError){
    return res.status(401).json({ message: 'Token expired' });
  }
  return res.status(500).json({ message: 'Internal Server Error' });
}
};

const validateToken = async (userId, token) => {
  try{
await redisClient.connect();
  try {
    console.log("connected")
   console.log("Promise")
    const result= await redisClient.sIsMember(`user_tokens:${userId}`, token);
    return result;
  } finally {
    await redisClient.disconnect(); 
  }
}catch(err){
  console.log(err)
}
};


export {verifyToken}