const express = require("express");
const cors = require("cors");
const db = require("./db/database"); // initializes database
const tasksRouter = require("./routes/tasks");
const syncRouter = require("./routes/sync");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/tasks", tasksRouter);
app.use("/api/sync", syncRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Task Sync API running 🚀 (JavaScript version)");
});

// Choose port from .env or default 4000
const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
