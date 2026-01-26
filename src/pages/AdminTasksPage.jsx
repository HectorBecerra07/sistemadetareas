// src/pages/AdminTasksPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
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
  Card,
  CardContent,
  useTheme,
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

const priorityColors = {
  baja: 'success',
  media: 'warning',
  alta: 'error',
};

const AdminTasksPage = () => {
  const { currentUser } = useUser();
  const theme = useTheme();
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
        const updatedTask = await updateAdminTask(taskId, taskData);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );
      } else {
        const newTask = await createAdminTask(taskData);
        setTasks((prev) => [...prev, newTask]);
      }
    } catch (err) {
      setError('Error al guardar la tarea.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdminTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError('Error al eliminar la tarea.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Panel de Tareas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión completa de todas las tareas del sistema.
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}> {/* Remove padding from CardContent */}
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Título</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha límite</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Prioridad</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => {
                  const user = getUser(task.userId);
                  return (
                    <TableRow key={task.id} hover>
                      <TableCell>
                        <Typography variant="body2">{user?.name || 'N/A'}</Typography>
                        <Typography variant="caption" color="text.secondary">{user?.email || ''}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                          {task.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}</TableCell>
                      <TableCell>
                        <Chip 
                            label={task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                            size="small"
                            color={priorityColors[task.priority] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={task.completed ? 'Completada' : 'Pendiente'} size="small" color={task.completed ? 'success' : 'info'} />
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
        </CardContent>
      </Card>
      
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
