const db = require("../db/database");

const BATCH_SIZE = process.env.SYNC_BATCH_SIZE || 50;

const syncService = {
  async runSync() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM sync_queue ORDER BY id LIMIT ?`,
        [BATCH_SIZE],
        async (err, rows) => {
          if (err) return reject(err);
          if (rows.length === 0) return resolve({ message: "Nothing to sync" });

          let processed = [];

          for (const row of rows) {
            try {
              // ✅ Use "row.data" not "row.task_data"
              const taskData = JSON.parse(row.data);

              // Check if task exists
              const existing = await new Promise((res, rej) => {
                db.get(
                  `SELECT * FROM tasks WHERE id = ?`,
                  [row.task_id],
                  (e, r) => (e ? rej(e) : res(r))
                );
              });

              if (row.operation === "create") {
                if (!existing) {
                  await new Promise((res, rej) => {
                    db.run(
                      `INSERT INTO tasks 
                        (id, title, description, completed, created_at, updated_at, is_deleted, sync_status) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, 'synced')`,
                      [
                        taskData.id,
                        taskData.title,
                        taskData.description,
                        taskData.completed || 0,
                        taskData.created_at,
                        taskData.updated_at,
                        taskData.is_deleted || 0,
                      ],
                      (e) => (e ? rej(e) : res())
                    );
                  });
                }
              } else if (row.operation === "update") {
                if (!existing || taskData.updated_at > existing.updated_at) {
                  await new Promise((res, rej) => {
                    db.run(
                      `UPDATE tasks 
                       SET title=?, description=?, completed=?, updated_at=?, is_deleted=?, sync_status='synced' 
                       WHERE id=?`,
                      [
                        taskData.title,
                        taskData.description,
                        taskData.completed,
                        taskData.updated_at,
                        taskData.is_deleted,
                        taskData.id,
                      ],
                      (e) => (e ? rej(e) : res())
                    );
                  });
                }
              } else if (row.operation === "delete") {
                await new Promise((res, rej) => {
                  db.run(
                    `UPDATE tasks 
                     SET is_deleted=1, sync_status='synced', updated_at=? 
                     WHERE id=?`,
                    [taskData.updated_at, taskData.id],
                    (e) => (e ? rej(e) : res())
                  );
                });
              }

              // ✅ Remove from sync_queue after success
              await new Promise((res, rej) => {
                db.run(`DELETE FROM sync_queue WHERE id=?`, [row.id], (e) =>
                  e ? rej(e) : res()
                );
              });

              processed.push(row.id);
            } catch (error) {
              console.error("❌ Sync failed for row:", row.id, error);

              // Retry count +1
              db.run(
                `UPDATE sync_queue 
                 SET retry_attempts = retry_attempts + 1 
                 WHERE id = ?`,
                [row.id]
              );
            }
          }

          resolve({ message: "Sync completed", processed });
        }
      );
    });
  },

  async getStatus() {
    return new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as pending FROM sync_queue`, [], (err, row) => {
        if (err) reject(err);
        else
          resolve({
            pending: row.pending,
            lastChecked: new Date().toISOString(),
          });
      });
    });
  },
};

module.exports = syncService;
