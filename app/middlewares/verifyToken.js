const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers["authorization"];
  const token = tokenHeader && tokenHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
      data: {},
    });
  } else {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "Token expired",
            data: {},
          });
        } else {
          return res.status(401).json({
            success: false,
            message: "Failed to authenticate token",
            data: {},
          });
        }
      } else {
        req.decoded = decoded;
        next();
      }
    });
  }
};

module.exports = verifyToken;
