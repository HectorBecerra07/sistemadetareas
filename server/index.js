// server/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { users, tasks, messages } = require('./data');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// =============== AUTH ===============

// REGISTRO
app.post('/api/auth/register', (req, res) => {
  try {
    console.log('POST /api/auth/register body:', req.body);

    const body = req.body || {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos' });
    }

    const emailNorm = email.toLowerCase();

    const existingUser = users.find(
      (u) => String(u.email || '').toLowerCase() === emailNorm
    );

    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const newUser = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      name,
      email,
      password, // SOLO DEMO
    };

    users.push(newUser);

    const { password: _removed, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (err) {
    console.error('Error en /api/auth/register:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
  try {
    console.log('POST /api/auth/login body:', req.body);

    const body = req.body || {};
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan campos' });
    }

    const emailNorm = email.toLowerCase();

    const user = users.find(
      (u) =>
        String(u.email || '').toLowerCase() === emailNorm &&
        u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const { password: _removed, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Error en /api/auth/login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// =============== USERS (solo lectura) ===============
app.get('/api/users', (req, res) => {
  const safe = users.map(({ password, ...rest }) => rest);
  res.json(safe);
});

// =============== TASKS ===============
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, dueDate, userId } = req.body || {};
  if (!title || !dueDate || !userId) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const newTask = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    title,
    dueDate,
    completed: false,
    userId,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// =============== MESSAGES ===============
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const { from, to, text } = req.body || {};
  if (!from || !to || !text) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const newMessage = {
    id: messages.length ? messages[messages.length - 1].id + 1 : 1,
    from,
    to,
    text,
    createdAt: new Date().toISOString(),
  };

  messages.push(newMessage);
  res.status(201).json(newMessage);
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
