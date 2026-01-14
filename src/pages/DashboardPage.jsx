import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';

import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';

import { useUser } from '../context/UserContext';
import { fetchTasks, fetchMessages } from '../services/api';

const DashboardPage = () => {
  const { currentUser } = useUser();
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    totalConversations: 0,
  });
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
    <Box
      sx={{
        minHeight: '70vh',
        background: 'linear-gradient(135deg, #e3f2fd, #fce4ec)',
        borderRadius: 3,
        p: 3,
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Hola de nuevo, {currentUser.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Este es un resumen rápido de tus tareas y mensajes.
        </Typography>
      </Box>

      {/* Tarjetas principales */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Tareas pendientes
                  </Typography>
                  <Typography variant="h3" component="div">
                    {stats.pendingTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cosas por hacer aún.
                  </Typography>
                </Box>
                <Avatar
                  sx={{ bgcolor: '#ffb74d', width: 48, height: 48 }}
                >
                  <AssignmentIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Tareas completadas
                  </Typography>
                  <Typography variant="h3" component="div">
                    {stats.completedTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Buen trabajo, sigue así.
                  </Typography>
                </Box>
                <Avatar
                  sx={{ bgcolor: '#81c784', width: 48, height: 48 }}
                >
                  <CheckCircleIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Conversaciones activas
                  </Typography>
                  <Typography variant="h3" component="div">
                    {stats.totalConversations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chats con otros usuarios.
                  </Typography>
                </Box>
                <Avatar
                  sx={{ bgcolor: '#64b5f6', width: 48, height: 48 }}
                >
                  <ChatBubbleIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen de progreso */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Progreso de tareas
              </Typography>
              <Typography variant="h4" component="div">
                {completionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {totalTasks === 0
                  ? 'Todavía no tienes tareas registradas.'
                  : `Has completado ${stats.completedTasks} de ${totalTasks} tareas.`}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{ mt: 1, height: 8, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sección adicional / futuro: últimas tareas, etc. */}
      {/* Aquí podrías agregar una lista de "Tareas recientes" o "Últimos mensajes" */}
    </Box>
  );
};

export default DashboardPage;
