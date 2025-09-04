const express = require("express");
const router = express.Router();
const syncService = require("../services/syncService");

// ✅ Trigger sync
router.post("/", async (req, res) => {
  try {
    const result = await syncService.runSync();
    res.json({ message: "Sync completed", result });
  } catch (err) {
    res.status(500).json({ error: "Sync failed" });
  }
});

// ✅ Check sync status
router.get("/status", async (req, res) => {
  try {
    const status = await syncService.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: "Failed to get sync status" });
  }
});

module.exports = router;
