import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './lib/prisma.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// CORS and Express JSON middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  'https://sistemadetareas.vercel.app',
  'https://sistemadetareas-3scdroi1m-darmax1.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// API routes
// =============== MIDDLEWARE ===============
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// =============== AUTH ===============
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const emailNorm = email.toLowerCase();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: emailNorm },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: emailNorm,
        password: hashedPassword,
      },
    });

    const { password: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const emailNorm = email.toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email: emailNorm },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const { password: _, ...safeUser } = user;

    const token = jwt.sign(safeUser, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ user: safeUser, token });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// =============== USERS (solo lectura) ===============
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  const { name, email, avatarUrl } = req.body;
  const userId = req.user.id;
  const newEmail = email ? email.toLowerCase() : undefined;

  try {
    if (newEmail && newEmail !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail },
      });
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está en uso' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email: newEmail,
        avatarUrl,
      },
    });

    const { password: _, ...safeUser } = updatedUser;

    const token = jwt.sign(safeUser, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ user: safeUser, token });
    
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
       return res.status(409).json({ error: 'El email ya está en uso.' });
    }
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

// =============== TASKS ===============
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { title, dueDate } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user.id,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, dueDate, completed } = req.body;

  try {
    const task = await prisma.task.findFirst({
      where: { id: parseInt(id, 10), userId: req.user.id },
    });

    if (!task) {
      return res
        .status(404)
        .json({ error: 'Tarea no encontrada o no autorizada' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completed,
      },
    });
    res.json(updatedTask);
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findFirst({
      where: { id: parseInt(id, 10), userId: req.user.id },
    });

    if (!task) {
      return res
        .status(404)
        .json({ error: 'Tarea no encontrada o no autorizada' });
    }

    await prisma.task.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send();
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(500).json({ error: 'Error al borrar la tarea' });
  }
});

// =============== MESSAGES ===============
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ from_user_id: req.user.id }, { to_user_id: req.user.id }],
      },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  const { to_user_id, text } = req.body;
  if (!to_user_id || !text) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  try {
    const message = await prisma.message.create({
      data: {
        from_user_id: req.user.id,
        to_user_id,
        text,
      },
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el mensaje' });
  }
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
// This needs to be the last route.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

export default app;