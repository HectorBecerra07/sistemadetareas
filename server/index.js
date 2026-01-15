// server/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const db = require('./database'); // Import the database connection

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// =============== AUTH ===============

// REGISTRO
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const emailNorm = email.toLowerCase();

  db.get('SELECT email FROM users WHERE email = ?', [emailNorm], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({ error: 'Error al hashear la contraseña' });
      }
      const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.run(sql, [name, emailNorm, hash], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name, email: emailNorm });
      });
    });
  });
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const emailNorm = email.toLowerCase();
  const sql = 'SELECT * FROM users WHERE email = ?';

  db.get(sql, [emailNorm], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    });
  });
});

// =============== USERS (solo lectura) ===============
app.get('/api/users', (req, res) => {
  db.all('SELECT id, name, email, role FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// =============== TASKS ===============
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // SQLite stores booleans as 0 or 1, so we convert them back for the frontend
    const tasks = rows.map(t => ({...t, completed: Boolean(t.completed)}));
    res.json(tasks);
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, dueDate, userId } = req.body;
  if (!title || !userId) { // dueDate can be optional
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'INSERT INTO tasks (title, dueDate, userId, completed) VALUES (?, ?, ?, 0)';
  db.run(sql, [title, dueDate, userId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, title, dueDate, userId, completed: false });
  });
});

app.put('/api/tasks/:id', (req, res) => {
  const { title, dueDate, completed } = req.body;
  const sql = 'UPDATE tasks SET title = ?, dueDate = ?, completed = ? WHERE id = ?';
  
  // Get the current task to merge with new data
  db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    const newTitle = title !== undefined ? title : task.title;
    const newDueDate = dueDate !== undefined ? dueDate : task.dueDate;
    const newCompleted = completed !== undefined ? completed : task.completed;
    
    db.run(sql, [newTitle, newDueDate, newCompleted, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: req.params.id, title: newTitle, dueDate: newDueDate, completed: newCompleted, userId: task.userId });
    });
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  const sql = 'DELETE FROM tasks WHERE id = ?';
  db.run(sql, [req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(204).send();
  });
});

// =============== MESSAGES ===============
app.get('/api/messages', (req, res) => {
    db.all('SELECT * FROM messages', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/messages', (req, res) => {
    const { from_user_id, to_user_id, text } = req.body;
    if (!from_user_id || !to_user_id || !text) {
        return res.status(400).json({ error: 'Faltan campos' });
    }

    const createdAt = new Date().toISOString();
    const sql = 'INSERT INTO messages (from_user_id, to_user_id, text, createdAt) VALUES (?, ?, ?, ?)';
    db.run(sql, [from_user_id, to_user_id, text, createdAt], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, from_user_id, to_user_id, text, createdAt });
    });
});


app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

