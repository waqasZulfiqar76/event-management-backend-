const Joi = require("joi");

// User validation schema
const validateUser = (userData) => {
  const schema = Joi.object({
    name: Joi.string().required().trim().min(3).max(50),
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required().min(6).max(100),
    eventsJoined: Joi.array().items(Joi.string().hex().length(24)),
  });

  return schema.validate(userData);
};
// User login validation schema
const validateLogin = (loginData) => {
  const schema = Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required().min(6).max(100), // Minimum length of 6 characters for password
  });

  return schema.validate(loginData);
};

module.exports = { validateUser, validateLogin };
