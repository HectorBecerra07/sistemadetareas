const sqlite3 = require('sqlite3').verbose();
const { users: mockUsers, tasks: mockTasks, messages: mockMessages } = require('./data');

const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDb();
  }
});

const initializeDb = () => {
  db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    )`, (err) => {
      if (err) {
        console.error("Error creating users table", err.message);
      } else {
        // Seed users
        const stmt = db.prepare("INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
        mockUsers.forEach(user => {
          stmt.run(user.id, user.name, user.email, user.password, user.role || 'user');
        });
        stmt.finalize();
      }
    });

    // Create tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      dueDate TEXT,
      completed BOOLEAN NOT NULL DEFAULT 0,
      userId INTEGER,
      FOREIGN KEY (userId) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error("Error creating tasks table", err.message);
      } else {
        // Seed tasks
        const stmt = db.prepare("INSERT OR IGNORE INTO tasks (id, title, dueDate, completed, userId) VALUES (?, ?, ?, ?, ?)");
        mockTasks.forEach(task => {
          stmt.run(task.id, task.title, task.dueDate, task.completed, task.userId);
        });
        stmt.finalize();
      }
    });

    // Create messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER,
      to_user_id INTEGER,
      text TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (from_user_id) REFERENCES users (id),
      FOREIGN KEY (to_user_id) REFERENCES users (id)
    )`, (err) => {
        if (err) {
            console.error("Error creating messages table", err.message);
        } else {
            // Seed messages
            const stmt = db.prepare("INSERT OR IGNORE INTO messages (id, from_user_id, to_user_id, text, createdAt) VALUES (?, ?, ?, ?, ?)");
            mockMessages.forEach(msg => {
                stmt.run(msg.id, msg.from, msg.to, msg.text, msg.createdAt);
            });
            stmt.finalize();
        }
    });
  });
};

module.exports = db;
