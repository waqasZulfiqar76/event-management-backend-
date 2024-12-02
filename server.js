require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
const userRoutes = require('./routes/UserRoutes.js');
const eventRoutes = require('./routes/EventRoutes.js');



const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(express.json());

connectDB()

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});