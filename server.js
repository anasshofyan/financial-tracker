const express = require("express");
const mongoosee = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();

const app = express();
const secretKey = process.env.SECRET_KEY;
const port = process.env.PORT || 5000;

// MongoDB connection
mongoosee.set("strictQuery", false);
mongoosee.connect(process.env.DB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoosee.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

// Middleware for logging
const logMiddleware = (req, res, next) => {
  console.debug(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

// Middleware for logging responses
const responseLogMiddleware = (req, res, next) => {
  res.on("finish", () => {
    console.debug(
      `[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode}`
    );
  });
  next();
};

// Use Middlewares
app.use(bodyParser.json());
app.use(logMiddleware);
app.use(responseLogMiddleware);

// Middleware for verifying JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    res.status(401).json({
      success: false,
      message: "No token provided",
      data: {},
    });
  } else {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(401).json({
          success: false,
          message: "Invalid token",
          data: {},
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  }
};

// Use Routes
const userRouter = require("./routes/userRoutes");
app.use("/users", userRouter);

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
