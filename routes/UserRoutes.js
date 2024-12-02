const express = require('express');
const { signup, login } = require('../controller/UserController.js');
const router = express.Router();

// Route for user signup
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
