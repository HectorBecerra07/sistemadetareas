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
  Tooltip,
  Alert,
  CircularProgress,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import { useUser } from '../context/UserContext';
import { 
  fetchUsers, 
  fetchAdminTasks,
  createAdminTask,
  updateAdminTask,
  deleteAdminTask
} from '../services/api';
import TaskFormModal from '../components/TaskFormModal';

const AdminTasksPage = () => {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
        setLoading(false);
        return;
    };
    const loadData = async () => {
      try {
        setLoading(true);
        const [tasksRes, usersRes] = await Promise.all([
          fetchAdminTasks(),
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
  }, [isAdmin]);

  const handleOpenCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = async (taskData, taskId) => {
    try {
      if (taskId) {
        // Update logic for Admin
        const updatedTask = await updateAdminTask(taskId, taskData);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );
      } else {
        // Create logic for Admin
        const newTask = await createAdminTask(taskData);
        setTasks((prev) => [...prev, newTask]);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al guardar la tarea.');
    }
  };


  const handleDelete = async (id) => {
    try {
      await deleteAdminTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al eliminar la tarea.');
    }
  };

  if (!currentUser || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
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

  const getUser = (userId) => users.find((u) => u.id === userId);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Panel de Tareas (Administrador)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aquí puedes asignar, editar, y gestionar todas las tareas del sistema.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
        >
          Crear Tarea
        </Button>
      </Box>

      <Paper sx={{ p: 1.5 }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Fecha límite</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => {
              const user = getUser(task.userId);
              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <Typography variant="body2">{user?.name || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">{user?.email || ''}</Typography>
                  </TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}</TableCell>
                  <TableCell>
                    <Chip 
                        label={task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                        size="small"
                        color={task.priority === 'alta' ? 'error' : task.priority === 'media' ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={task.completed ? 'Completada' : 'Pendiente'} size="small" color={task.completed ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Editar tarea">
                            <IconButton size="small" onClick={() => handleOpenEditModal(task)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar tarea">
                            <IconButton size="small" color="error" onClick={() => handleDelete(task.id)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
            );
            })}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>
      
      {isModalOpen && (
        <TaskFormModal
            open={isModalOpen}
            handleClose={handleCloseModal}
            onSave={handleSaveTask}
            users={users}
            initialData={selectedTask}
        />
      )}
    </Box>
  );
};

export default AdminTasksPage;
