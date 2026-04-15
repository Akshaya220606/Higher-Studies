// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const documentRoutes = require("./routes/documentRoutes");
const alumniRoutes = require("./routes/alumniRoutes");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// Convert incoming request body to JSON
app.use(express.json());

// Support URL-encoded and multipart form data
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Simple home route to check server status
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Admission & Alumni Tracking System API is running"
  });
});

// Register all route groups
app.use("/api/auth", authRoutes);
app.use("/api", applicationRoutes);
app.use("/api", documentRoutes);
app.use("/api", alumniRoutes);

// Handle unknown routes and application errors
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
