const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDB } = require('./src/config/db');
const employeeRoutes = require('./src/routes/EmployeeRoutes'); // Correctly import

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(helmet()); // Use Helmet for security headers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect to MongoDB
connectDB();

// Handle MongoDB events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected!');
});

mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

// Import routes
app.use("/api", employeeRoutes); // Use router directly

// Default route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to Express API" });
});

// Catch invalid endpoints
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
