import prisma from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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
    .then((user) => {
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
          // accessToken: null,
          message: "Email or Password does not match!",
        });
      }
      var token = jwt.sign(
        { id: user.id, email: user.email, name: user.username },
        process.env.API_AUTH_SECRET,
        {
          expiresIn: 86400, // 24 hours
        }
      );

      const refreshToken = jwt.sign({ id: user.id, email: user.email, name: user.username },
         process.env.REFRESH_TOKEN_SECRET);

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

// Get User
const user = function (req, res) {
  var token = req.headers.authorization;
  if (token) {
    // verifies secret and checks if the token is expired
    jwt.verify(
      token.replace(/^Bearer\s/, ""),
      process.env.API_AUTH_SECRET,
      function (err, decoded) {
        if (err) {
          return res.status(401).json({ message: "unauthorized" });
        } else {
          return res.json({ user: decoded });
        }
      }
    );
  } else {
    return res.status(401).json({ message: "unauthorized" });
  }
};

const logout = (req, res, next) => {
  console.log("logout is called");
  res.json({ message: "logout user successfully" });
};

export { login, register, user, logout };
