const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

const protect = (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, "secretkey");

    // 3. Attach user info to request
    req.user = decoded; // { id, role }

    next();
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
};

module.exports = { protect };