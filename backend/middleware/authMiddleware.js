import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  let token = req.headers.authorization

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }
  try{
  const decoded= jwt.verify(token.replace(/^Bearer\s/, ''), process.env.API_AUTH_SECRET);
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

export {verifyToken}