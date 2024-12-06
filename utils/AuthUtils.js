const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to hash password using bcrypt
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

// Function to compare password with hashed password
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Function to generate JWT token
const generateToken = (userId, role, name) => {
  const token = jwt.sign({ userId, role, name }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
};
