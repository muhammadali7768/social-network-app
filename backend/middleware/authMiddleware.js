import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  
  let token = req.headers.authorization

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token.replace(/^Bearer\s/, ''), process.env.API_AUTH_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

export {verifyToken}