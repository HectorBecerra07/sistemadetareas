// server/routes/admin.routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { authenticateToken, authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Middleware to apply auth to all admin routes
router.use(authenticateToken);
router.use(authenticateAdmin);

// =============== ADMIN USERS ===============
router.post('/users', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, email, contraseña, rol).' });
  }

  if (role !== 'admin' && role !== 'user') {
    return res.status(400).json({ error: 'El rol debe ser "admin" o "user".' });
  }

  const emailNorm = email.toLowerCase();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: emailNorm },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está en uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: emailNorm,
        password: hashedPassword,
        role: role,
      },
    });

    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);

  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ error: 'Error al crear el usuario.' });
  }
});

router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    try {
        const updateData = {
            name,
            email: email ? email.toLowerCase() : undefined,
            role,
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id, 10) },
            data: updateData,
        });

        const { password: _, ...safeUser } = updatedUser;
        res.json(safeUser);

    } catch (error) {
        if (error.code === 'P2002') { // Unique constraint violation (email)
            return res.status(409).json({ error: 'El email ya está en uso.' });
        }
        if (error.code === 'P2025') { // Record to update not found
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        console.error('Admin update user error:', error);
        res.status(500).json({ error: 'Error al actualizar el usuario.' });
    }
});


// =============== ADMIN TASKS ===============
router.get('/tasks', async (req, res) => {
  try {
    // Temporarily simplified to debug
    const tasks = await prisma.task.findMany();
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching admin tasks:", error);
    res.status(500).json({ error: 'Error al obtener todas las tareas' });
  }
});

router.post('/tasks', async (req, res) => {
  const { title, dueDate, userId, priority, startTime, endTime } = req.body;
  if (!title || !userId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (título, userId)' });
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: parseInt(userId, 10),
        priority: priority,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Admin create task error:', error);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

router.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, dueDate, completed, userId, priority, startTime, endTime } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completed,
        userId: userId ? parseInt(userId, 10) : undefined,
        priority,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        completedAt: completed === true ? new Date() : (completed === false ? null : undefined),
      },
    });
    res.json(updatedTask);
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    console.error('Admin update task error:', error);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

router.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.task.delete({
            where: { id: parseInt(id, 10) },
        });
        res.status(204).send();
    } catch (error) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        console.error('Admin delete task error:', error);
        res.status(500).json({ error: 'Error al borrar la tarea' });
    }
});

export default router;
