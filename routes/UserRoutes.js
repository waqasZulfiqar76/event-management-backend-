const express = require("express");
const {
  signup,
  login,
  getCreatedEvents,
  getJoinedEvents,
  getUserDashboardStats,
} = require("../controller/UserController.js");
const router = express.Router();

// Route for user signup
router.post("/signup", signup);
router.post("/login", login);
router.get("/created-events/:userId", getCreatedEvents);
router.get("/joined-events/:userId", getJoinedEvents);
router.get("/user-stats/:userId", getUserDashboardStats);
module.exports = router;
