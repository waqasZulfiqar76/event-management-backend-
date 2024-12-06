const User = require("../model/UserModel.js");
const {
  hashPassword,
  generateToken,
  comparePassword,
} = require("../utils/AuthUtils.js");
const { paginate } = require("../utils/pagination.js");
const {
  validateUser,
  validateLogin,
} = require("../Validators/UserValidators.js");

// Signup Controller
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate input
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Check if an admin already exists in the system
    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ message: "Admin already exists. Only one admin allowed." });
      }
    }

    // Check if the user already exists with the provided email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // Default to 'user' if no role is provided
    });

    // Save the new user to the database
    await newUser.save();

    // Generate a token for the user
    const token = generateToken(newUser._id);

    // Respond with success message and token
    res.status(201).json({
      message: "User registered successfully.",
      newUser: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate the input data (email and password)
  const { error } = validateLogin(req.body);
  if (error) {
    console.log(error);
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role, user.name);

    // Respond with the token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        eventsJoined: user.eventsJoined,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Controller to get all users
exports.getAllUsers = async (req, res) => {
  const { page, limit, title, category, location } = req.query; // Extract query parameters

  try {
    // Pass query filters if needed, or use empty object
    const filter = { title, category, location };

    const data = await paginate(User, page, limit, filter);

    res.status(200).json({
      success: true,
      data: data.results,
      pagination: data.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Controller to get a specific user by ID
exports.getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
      .populate("eventsCreated")
      .populate("eventsJoined"); // Find user by ID
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// user created events
exports.getCreatedEvents = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
      .populate({
        path: "eventsCreated",
        populate: {
          path: "organizer", // Populate the organizer field within each event
          select: "name email",
        },
      })
      .select("eventsCreated");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ createdEvents: user.eventsCreated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// user joined events
exports.getJoinedEvents = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
      .populate({
        path: "eventsJoined",
        populate: {
          path: "organizer",
          select: "name email",
        },
      })
      .select("eventsJoined");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ joinedEvents: user.eventsJoined });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    //  Get total events count
    const totalEvents = await Event.countDocuments();

    //  Get the count of upcoming events
    const upcomingEventsCount = await Event.countDocuments({
      date: { $gt: new Date() }, // Filter events where the date is greater than the current date
    });

    const joinedEventsCount = await Event.countDocuments({
      attendees: { $gt: [] }, // Filter events where the attendees array is not empty
    });

    res.status(200).json({
      totalUsers,
      totalEvents,
      upcomingEventsCount,
      joinedEventsCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// get user dashboard counts
exports.getUserDashboardStats = async (req, res) => {
  const { userId } = req.params; // Extract user ID from URL params

  try {
    //  Find the user by ID and populate their created and joined events
    const user = await User.findById(userId)
      .populate("eventsCreated")
      .populate("eventsJoined");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  Total events created by the user
    const totalCreatedEvents = user.eventsCreated.length;

    //  Total events joined by the user
    const totalJoinedEvents = user.eventsJoined.length;

    //  Upcoming events created by the user
    const upcomingCreatedEvents = user.eventsCreated.filter(
      (event) => new Date(event.date) > new Date()
    ).length;

    //  Upcoming events the user has joined
    const upcomingJoinedEvents = user.eventsJoined.filter(
      (event) => new Date(event.date) > new Date()
    ).length;

    // Send the stats as a response
    res.status(200).json({
      totalCreatedEvents,
      totalJoinedEvents,
      upcomingCreatedEvents,
      upcomingJoinedEvents,
    });
  } catch (error) {
    console.error("Error fetching user dashboard stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
