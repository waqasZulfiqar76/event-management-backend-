const jwt = require("jsonwebtoken");
const User = require("../model/UserModel");
const { HTTP_STATUS_CODES } = require("../utils/HttpCodes");

// Middleware to check if the user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(HTTP_STATUS_CODES.UNAUTHORIZED)
        .json({ message: "Authentication required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user by the decoded userId
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res
        .status(HTTP_STATUS_CODES.UNAUTHORIZED)
        .json({ message: "User not found" });
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication Error:", err);
    return res
      .status(HTTP_STATUS_CODES.UNAUTHORIZED)
      .json({ message: "Authentication failed, invalid token" });
  }
};

// Middleware to check if the user has an admin role
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(HTTP_STATUS_CODES.UNAUTHORIZED)
      .json({ message: "Unauthorized, user not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(HTTP_STATUS_CODES.FORBIDDEN)
      .json({ message: "Forbidden, access restricted to Super-Admin" });
  }

  next();
};

// Middleware to check if the user has one of the authorized roles
exports.checkUserRole = (roles = []) => {
  // `roles` is an array of allowed roles (e.g., ['Super-Admin', 'Product-Owner'])
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(HTTP_STATUS_CODES.UNAUTHORIZED)
        .json({ message: "Unauthorized, user not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(HTTP_STATUS_CODES.FORBIDDEN)
        .json({ message: "Forbidden, insufficient permissions" });
    }

    next(); // User is authorized, proceed
  };
};
