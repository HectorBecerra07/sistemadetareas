// src/pages/AdminTasksPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';

import { useUser } from '../context/UserContext';
import { fetchTasks, fetchUsers, updateTask, deleteTask } from '../services/api';

const AdminTasksPage = () => {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tasksRes, usersRes] = await Promise.all([
          fetchTasks(),
          fetchUsers(),
        ]);
        setTasks(tasksRes);
        setUsers(usersRes);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las tareas o usuarios.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (!currentUser) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Debes iniciar sesión.</Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">
          Solo un administrador puede acceder al panel de tareas.
        </Alert>
      </Box>
    );
  }

  const handleStartEdit = (task) => {
    setEditingId(task.id);
    setDraft({
      title: task.title,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      userId: task.userId,
      completed: task.completed,
    });
  };

  const handleDraftChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (id) => {
    const original = tasks.find((t) => t.id === id);
    if (!original) return;

    const updated = {
      ...original,
      title: draft.title,
      dueDate: draft.dueDate ? new Date(draft.dueDate).toISOString() : original.dueDate,
      userId: draft.userId,
      completed: draft.completed,
    };

    try {
      await updateTask(id, {
        title: updated.title,
        dueDate: updated.dueDate,
        userId: updated.userId,
        completed: updated.completed,
      }, currentUser?.token);

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
      setEditingId(null);
      setDraft({});
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al guardar la tarea.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id, currentUser?.token);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al eliminar la tarea.');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const getUserName = (userId) =>
    users.find((u) => u.id === userId)?.name || 'Desconocido';

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h5" gutterBottom>
        Panel de Tareas (Administrador)
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Aquí puedes asignar, editar, cambiar fecha, marcar como completada o eliminar cualquier tarea.
      </Typography>

      <Paper sx={{ p: 1.5 }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Fecha límite</TableCell>
              <TableCell>Completada</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => {
              const isEditing = editingId === task.id;

              return (
                <TableRow key={task.id}>
                  {/* Usuario asignado */}
                  <TableCell sx={{ minWidth: 140 }}>
                    {isEditing ? (
                      <Select
                        size="small"
                        value={draft.userId}
                        onChange={(e) =>
                          handleDraftChange('userId', e.target.value)
                        }
                        fullWidth
                      >
                        {users.map((u) => (
                          <MenuItem key={u.id} value={u.id}>
                            {u.name}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      getUserName(task.userId)
                    )}
                  </TableCell>

                  {/* Título */}
                  <TableCell sx={{ minWidth: 200 }}>
                    {isEditing ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={draft.title}
                        onChange={(e) =>
                          handleDraftChange('title', e.target.value)
                        }
                      />
                    ) : (
                      task.title
                    )}
                  </TableCell>

                  {/* Fecha límite */}
                  <TableCell sx={{ minWidth: 140 }}>
                    {isEditing ? (
                      <TextField
                        size="small"
                        type="date"
                        value={draft.dueDate}
                        onChange={(e) =>
                          handleDraftChange('dueDate', e.target.value)
                        }
                      />
                    ) : task.dueDate ? (
                      new Date(task.dueDate).toLocaleDateString()
                    ) : (
                      'Sin fecha'
                    )}
                  </TableCell>

                  {/* Completada */}
                  <TableCell>
                    {isEditing ? (
                      <Checkbox
                        checked={draft.completed}
                        onChange={(e) =>
                          handleDraftChange('completed', e.target.checked)
                        }
                      />
                    ) : (
                      <Checkbox checked={task.completed} disabled />
                    )}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="right">
                    {isEditing ? (
                      <Tooltip title="Guardar cambios">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSave(task.id)}
                        >
                          <SaveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Editar tarea">
                        <IconButton
                          size="small"
                          onClick={() => handleStartEdit(task)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Eliminar tarea">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(task.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
            );
            })}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminTasksPage;
