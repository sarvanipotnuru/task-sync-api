const express = require("express");
const router = express.Router();
const taskService = require("../services/taskService");

// ✅ GET all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ GET single task
router.get("/:id", async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ POST create task
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const task = await taskService.createTask({ title, description });
    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ PUT update task
router.put("/:id", async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const updated = await taskService.updateTask(req.params.id, { title, description, completed });

    if (!updated) return res.status(404).json({ error: "Task not found" });
    res.json({ success: true, task: updated });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ DELETE soft delete task
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await taskService.deleteTask(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Task not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
