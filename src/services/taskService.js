const { v4: uuidv4 } = require("uuid");
const db = require("../db/database");

// Helper: push operation into sync_queue
function enqueueSync(taskId, operation, data) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO sync_queue (task_id, operation, data) VALUES (?, ?, ?)`,
      [taskId, operation, JSON.stringify(data)],
      function (err) {
        if (err) reject(err);
        else resolve(true);
      }
    );
  });
}

// ✅ Get all tasks
function getAllTasks() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM tasks WHERE is_deleted = 0", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ✅ Get single task by ID
function getTaskById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM tasks WHERE id = ? AND is_deleted = 0",
      [id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

// ✅ Create task
async function createTask({ title, description }) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO tasks (id, title, description, completed, created_at, updated_at, is_deleted, sync_status) 
       VALUES (?, ?, ?, ?, ?, ?, 0, 'pending')`,
      [id, title, description || "", 0, now, now],
      async function (err) {
        if (err) reject(err);
        else {
          const task = {
            id,
            title,
            description: description || "",
            completed: 0,
            created_at: now,
            updated_at: now,
            is_deleted: 0,
            sync_status: "pending",
          };

          // enqueue for sync
          await enqueueSync(id, "create", task);

          resolve(task);
        }
      }
    );
  });
}

// ✅ Update task
async function updateTask(id, { title, description, completed }) {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();

    db.run(
      `UPDATE tasks 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           completed = COALESCE(?, completed),
           updated_at = ?,
           sync_status = 'pending'
       WHERE id = ? AND is_deleted = 0`,
      [
        title,
        description,
        completed !== undefined ? (completed ? 1 : 0) : null,
        now,
        id,
      ],
      async function (err) {
        if (err) reject(err);
        else if (this.changes === 0) resolve(null);
        else {
          const updatedTask = {
            id,
            title,
            description,
            completed,
            updated_at: now,
          };

          // enqueue for sync
          await enqueueSync(id, "update", updatedTask);

          resolve(updatedTask);
        }
      }
    );
  });
}

// ✅ Soft delete task
async function deleteTask(id) {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();

    db.run(
      `UPDATE tasks SET is_deleted = 1, sync_status = 'pending', updated_at = ? WHERE id = ?`,
      [now, id],
      async function (err) {
        if (err) reject(err);
        else if (this.changes === 0) resolve(false);
        else {
          const deletedTask = { id, updated_at: now };

          // enqueue for sync
          await enqueueSync(id, "delete", deletedTask);

          resolve(true);
        }
      }
    );
  });
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
