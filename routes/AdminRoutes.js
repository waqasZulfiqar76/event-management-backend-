const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/AuthMiddleware");
const {
  approveEvent,
  disapproveEvent,
  getAdminDashboardStats,
} = require("../controller/AdminController");

// Route to approve event (only accessible to admins)
router.put("/event/:eventId/approve", isAuthenticated, isAdmin, approveEvent);

// Route to disapprove event (only accessible to admins)
router.put(
  "/event/:eventId/disapprove",
  isAuthenticated,
  isAdmin,
  disapproveEvent
);

router.get("/admin-stats", getAdminDashboardStats);

module.exports = router;
