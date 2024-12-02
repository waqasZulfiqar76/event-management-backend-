const User = require("../model/UserModel.js");
const { hashPassword, generateToken, comparePassword } = require("../utils/AuthUtils.js");
const { validateUser, validateLogin } = require("../Validators/UserValidators.js");

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
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);


    // Respond with the token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        eventsJoined: user.eventsJoined,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

