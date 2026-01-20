import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';

import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventNoteIcon from '@mui/icons-material/EventNote';

import { useUser } from '../context/UserContext';
import { fetchTasks, fetchMessages } from '../services/api';

const DashboardPage = () => {
  const { currentUser } = useUser();
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    totalConversations: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [allTasks, allMessages] = await Promise.all([
          fetchTasks(),
          fetchMessages(),
        ]);

        const userTasks = allTasks.filter(
          (t) => t.userId === currentUser.id
        );

        const upcoming = userTasks
          .filter((t) => !t.completed && t.dueDate)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 3);
        setRecentTasks(upcoming);
        
        const userMessages = allMessages.filter(
          (m) => m.to === currentUser.id || m.from === currentUser.id
        );
        const conversations = new Set(
          userMessages.map((m) =>
            m.from === currentUser.id ? m.to : m.from
          )
        );

        setStats({
          pendingTasks: userTasks.filter((t) => !t.completed).length,
          completedTasks: userTasks.filter((t) => t.completed).length,
          totalConversations: conversations.size,
        });
        setError(null);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el resumen del panel.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const totalTasks = stats.pendingTasks + stats.completedTasks;
  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round((stats.completedTasks / totalTasks) * 100);

  if (loading || !currentUser) {
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

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          color: 'white',
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Hola de nuevo, {currentUser.name}
        </Typography>
        <Typography variant="subtitle1">
          Este es un resumen rápido de tus tareas y mensajes. ¡A por ello!
        </Typography>
      </Paper>

      {/* Tarjetas principales */}
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Tareas pendientes
                </Typography>
                <Typography variant="h3" component="div">
                  {stats.pendingTasks}
                </Typography>
              </Box>
              <Box textAlign="right">
                <AssignmentIcon sx={{ fontSize: 60, color: 'warning.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Tareas completadas
                </Typography>
                <Typography variant="h3" component="div">
                  {stats.completedTasks}
                </Typography>
              </Box>
               <Box textAlign="right">
                <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Conversaciones
                </Typography>
                <Typography variant="h3" component="div">
                  {stats.totalConversations}
                </Typography>
              </Box>
              <Box textAlign="right">
                <SpeakerNotesIcon sx={{ fontSize: 60, color: 'info.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Progreso
              </Typography>
              <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                {completionRate}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{ height: 8, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {`Completadas ${stats.completedTasks} de ${totalTasks}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tareas Recientes */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid xs={12}>
            <Typography variant="h6" gutterBottom>
                Tareas Próximas
            </Typography>
            <Paper>
                <List>
                    {recentTasks.length > 0 ? (
                        recentTasks.map(task => (
                            <ListItem key={task.id}>
                                <ListItemIcon>
                                    <EventNoteIcon />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={task.title}
                                    secondary={`Vence: ${new Date(task.dueDate).toLocaleDateString()}`}
                                />
                                <Chip label="Pendiente" color="warning" size="small" />
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No tienes tareas próximas. ¡Buen trabajo!" />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

