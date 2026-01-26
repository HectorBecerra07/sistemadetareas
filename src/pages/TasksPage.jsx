import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Checkbox,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useUser } from '../context/UserContext';
import { fetchTasks, createTask, updateTask, deleteTask, fetchUsers } from '../services/api';
import TaskFormModal from '../components/TaskFormModal';

const priorityColors = {
  baja: 'success',
  media: 'warning',
  alta: 'error',
};

const TasksPage = () => {
  const { currentUser } = useUser();
  const [userTasks, setUserTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all | pending | completed

  useEffect(() => {
    const loadInitialData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [fetchedTasks, fetchedUsers] = await Promise.all([
            fetchTasks(),
            currentUser.role === 'admin' ? fetchUsers() : Promise.resolve([])
        ]);
        
        setUserTasks(fetchedTasks);
        if (currentUser.role === 'admin') {
            setUsers(fetchedUsers);
        }

        setError(null);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [currentUser]);

  const handleToggleComplete = async (taskId) => {
    const task = userTasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const updated = await updateTask(taskId, { completed: !task.completed });
      setUserTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? updated : t))
      );
    } catch (err) {
      setError('Error al actualizar la tarea.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setUserTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      setError('Error al eliminar la tarea.');
    }
  };

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
        const updated = await updateTask(taskId, taskData);
        setUserTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updated : t))
        );
      } else {
        const newTask = await createTask({ ...taskData, userId: currentUser.id });
        setUserTasks((prev) => [...prev, newTask]);
      }
    } catch (err) {
      setError('Error al guardar la tarea.');
    }
  };

  const handleFilterChange = (event, newValue) => {
    setFilter(newValue);
  };

  const filteredTasks = userTasks
    .filter((task) => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Grid item>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Mis Tareas
          </Typography>
        </Grid>
        <Grid item>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateModal}>
            Crear Tarea
          </Button>
        </Grid>
      </Grid>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={filter} onChange={handleFilterChange} centered>
            <Tab label="Todas" value="all" />
            <Tab label="Pendientes" value="pending" />
            <Tab label="Completadas" value="completed" />
          </Tabs>
        </Box>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ p: 4 }}>
              No hay tareas en esta categoría.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {filteredTasks.map((task) => (
                <Card key={task.id} variant="outlined">
                  <CardContent>
                    <Grid container alignItems="center">
                      <Grid item xs={1}>
                        <Tooltip title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}>
                          <Checkbox
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task.id)}
                          />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography
                          variant="h6"
                          sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                        >
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {task.dueDate
                            ? `Vence: ${new Date(task.dueDate).toLocaleDateString()}`
                            : 'Sin fecha límite'}
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sx={{ textAlign: 'center' }}>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={priorityColors[task.priority] || 'default'}
                        />
                      </Grid>
                      <Grid item xs={1} sx={{ textAlign: 'right' }}>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleOpenEditModal(task)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
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

export default TasksPage;
