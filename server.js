const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "LOGIN")));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/todo_app";

// MongoDB connection options
const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, mongoOptions)
  .then(() => {
    console.log("Connected to MongoDB successfully");
    console.log(`Database: ${MONGO_URI}`);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log("Make sure MongoDB is running on your system");
    console.log(
      "You can install MongoDB from: https://www.mongodb.com/try/download/community"
    );
    process.exit(1);
  });

// MongoDB connection event handlers
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error during MongoDB connection closure:", err);
    process.exit(1);
  }
});

// Import routes
const taskRoutes = require("./routes/taskRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

// API Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/categories", categoryRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    uptime: process.uptime(),
  });
});

// Serve the main dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "LOGIN", "dashboard.html"));
});

// Error handling middleware
const { errorHandler, notFound } = require("./middleware/errorHandler");
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at:`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`Tasks: http://localhost:${PORT}/api/tasks`);
  console.log(`Categories: http://localhost:${PORT}/api/categories`);
  console.log(`\n API Documentation:`);
  console.log(`  GET    /api/tasks - Get all tasks`);
  console.log(`  POST   /api/tasks - Create new task`);
  console.log(`  GET    /api/tasks/:id - Get task by ID`);
  console.log(`  PUT    /api/tasks/:id - Update task`);
  console.log(`  DELETE /api/tasks/:id - Delete task`);
  console.log(`  GET    /api/tasks/stats - Get task statistics`);
  console.log(`  GET    /api/tasks/search - Search tasks`);
  console.log(`  GET    /api/tasks/today - Get today's tasks`);
  console.log(`  GET    /api/tasks/status/:status - Get tasks by status`);
  console.log(`  GET    /api/categories - Get all categories`);
  console.log(`  POST    /api/categories - Create new category`);
  console.log(`  PUT    /api/categories/:id - Update category`);
  console.log(`  DELETE    /api/categories/:id - Delete category`);
  console.log(`  GET    /api/tasks/category/:category - Get tasks by category`);
});
