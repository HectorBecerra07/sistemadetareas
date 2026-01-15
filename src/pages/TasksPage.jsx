import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';

import { useUser } from '../context/UserContext';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/api';
import CreateTaskModal from '../components/CreateTaskModal';

const TasksPage = () => {
  const { currentUser } = useUser();
  const [allTasks, setAllTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all | pending | completed

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await fetchTasks();
        setAllTasks(fetchedTasks);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(
          'No se pudieron cargar las tareas. Asegúrate de que el servidor backend se está ejecutando.'
        );
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setUserTasks(allTasks.filter((task) => task.userId === currentUser.id));
    } else {
      setUserTasks([]);
    }
  }, [currentUser, allTasks]);

  const handleToggleComplete = async (taskId) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const updatedTask = await updateTask(
        taskId,
        { completed: !task.completed },
        currentUser?.token // TODO: Manejar token de forma segura
      );
      setAllTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
      );
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al actualizar la tarea.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId, currentUser?.token); // TODO: Manejar token
      setAllTasks((prev) => prev.filter((task) => task.id !== taskId));
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al eliminar la tarea.');
    }
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleAddTask = async (newTaskData) => {
    if (!currentUser) return;
    try {
      const taskWithUser = { ...newTaskData, userId: currentUser.id };
      const newlyCreatedTask = await createTask(taskWithUser);
      setAllTasks((prevTasks) => [...prevTasks, newlyCreatedTask]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al crear la tarea.');
    }
  };

  const handleFilterChange = (event, newValue) => {
    setFilter(newValue);
  };

  const pendingCount = userTasks.filter((t) => !t.completed).length;
  const completedCount = userTasks.filter((t) => t.completed).length;
  const totalCount = userTasks.length;

  const baseFiltered = userTasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // all
  });

  // Ordenar por fecha límite (más próxima primero). Las que no tienen fecha se van al final.
  const filteredTasks = [...baseFiltered].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!currentUser || loading) {
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

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          mb: 2,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Mis Tareas
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`Total: ${totalCount}`} size="small" />
            <Chip
              label={`Pendientes: ${pendingCount}`}
              size="small"
              color="warning"
            />
            <Chip
              label={`Completadas: ${completedCount}`}
              size="small"
              color="success"
            />
          </Stack>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Crear tarea
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Filtros */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={filter}
            onChange={handleFilterChange}
            variant="fullWidth"
          >
            <Tab label="Todas" value="all" />
            <Tab label="Pendientes" value="pending" />
            <Tab label="Completadas" value="completed" />
          </Tabs>
        </Box>

        {filteredTasks.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No hay tareas para mostrar con el filtro seleccionado.
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredTasks.map((task) => {
              const hasDueDate = Boolean(task.dueDate);
              const due = hasDueDate ? new Date(task.dueDate) : null;
              if (due) due.setHours(0, 0, 0, 0);

              const isOverdue =
                !task.completed && hasDueDate && due < today;

              let statusChip;
              if (task.completed) {
                statusChip = (
                  <Chip
                    label="Completada"
                    size="small"
                    color="success"
                    sx={{ ml: 1 }}
                  />
                );
              } else if (isOverdue) {
                statusChip = (
                  <Chip
                    label="Vencida"
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                  />
                );
              } else {
                statusChip = (
                  <Chip
                    label="Pendiente"
                    size="small"
                    color="warning"
                    sx={{ ml: 1 }}
                  />
                );
              }

              return (
                <ListItem
                  key={task.id}
                  secondaryAction={
                    <Tooltip title="Eliminar tarea">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  }
                  disablePadding
                >
                  <ListItemButton dense>
                    <Tooltip
                      title={
                        task.completed
                          ? 'Marcar como pendiente'
                          : 'Marcar como completada'
                      }
                    >
                      <Checkbox
                        edge="start"
                        checked={task.completed}
                        tabIndex={-1}
                        disableRipple
                        onChange={() => handleToggleComplete(task.id)}
                      />
                    </Tooltip>

                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              textDecoration: task.completed
                                ? 'line-through'
                                : 'none',
                            }}
                          >
                            {task.title}
                          </Typography>
                          {statusChip}
                        </Box>
                      }
                      secondary={
                        hasDueDate
                          ? `Fecha límite: ${new Date(
                              task.dueDate
                            ).toLocaleDateString()}`
                          : 'Sin fecha límite'
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      <CreateTaskModal
        open={modalOpen}
        handleClose={handleCloseModal}
        handleAddTask={handleAddTask}
      />
    </Box>
  );
};

export default TasksPage;
