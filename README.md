# task-sync-api
<img width="1920" height="1080" alt="Screenshot (61)" src="https://github.com/user-attachments/assets/1c62d251-99f8-42d6-8a70-f4be6816902e" />
<img width="1920" height="1080" alt="Screenshot (60)" src="https://github.com/user-attachments/assets/8f3b86e4-1635-4692-ba46-176bdd504c85" />
<img width="1920" height="1080" alt="Screenshot (59)" src="https://github.com/user-attachments/assets/dff4279c-166d-43dd-af34-2e6aed930060" />
# 📝 Task Sync API (Offline-First Task Manager)

This is a backend API for a **personal task management app** that supports offline-first functionality.  
Users can create, update, and delete tasks offline, and once online, their changes are synced with the server.  

---

## 🚀 Features

- Task CRUD operations (create, read, update, delete)
- Offline-first design with **sync queue**
- Soft delete support (`is_deleted` flag)
- Sync status tracking (`pending`, `synced`, `error`)
- SQLite database support
- REST API endpoints with Express.js

---

## 📂 Project Structure
src/
├── db/
│ └── database.js # Database setup (SQLite)
├── routes/
│ ├── tasks.js # Task routes (CRUD)
│ └── sync.js # Sync routes
├── services/
│ ├── taskService.js # Task business logic
│ └── syncService.js # Sync queue + conflict resolution
└── server.js # Express server

---

## ⚙️ Installation & Setup

1. Clone repository:
   ```sh
   git clone https://github.com/sarvanipotnuru/task-sync-api.git
   cd task-sync-api
npm install
npm start

