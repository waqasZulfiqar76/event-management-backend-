const User = require("../model/UserModel.js");
const {
  hashPassword,
  generateToken,
  comparePassword,
} = require("../utils/AuthUtils.js");
const {
  validateUser,
  validateLogin,
} = require("../Validators/UserValidators.js");

// Signup Controller
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "User registered successfully.",
      newUser: newUser,
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
    const token = generateToken(user._id);

    // Respond with the token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,

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
