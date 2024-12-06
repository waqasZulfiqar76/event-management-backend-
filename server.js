require("dotenv").config();
const express = require("express");
const connectDB = require("./config/mongodb");
const userRoutes = require("./routes/UserRoutes.js");
const adminRoutes = require("./routes/AdminRoutes.js");
const eventRoutes = require("./routes/EventRoutes.js");

const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
