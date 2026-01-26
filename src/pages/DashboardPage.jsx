import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
} from '@mui/material';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useUser } from '../context/UserContext';
import { fetchTasks, fetchMessages } from '../services/api';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1, fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: color }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

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
          .slice(0, 5);
        setRecentTasks(upcoming);

        const userMessages = allMessages.filter(
          (m) => m.to_user_id === currentUser.id || m.from_user_id === currentUser.id
        );
        const conversations = new Set(
          userMessages.map((m) =>
            m.from_user_id === currentUser.id ? m.to_user_id : m.from_user_id
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Hola, {currentUser.name}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Aquí tienes un resumen de tu actividad.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tareas Pendientes" value={stats.pendingTasks} icon={<AssignmentIcon color="warning" />} color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tareas Completadas" value={stats.completedTasks} icon={<CheckCircleOutlineIcon color="success" />} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Conversaciones" value={stats.totalConversations} icon={<SpeakerNotesIcon color="info" />} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Box sx={{ width: 100, height: 100, mb: 2 }}>
                <CircularProgressbar
                  value={completionRate}
                  text={`${completionRate}%`}
                  styles={buildStyles({
                    textColor: 'inherit',
                    pathColor: 'primary.main',
                    trailColor: 'grey.300',
                  })}
                />
              </Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Progreso
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Tareas Próximas
              </Typography>
              <List>
                {recentTasks.length > 0 ? (
                  recentTasks.map(task => (
                    <ListItem key={task.id} disablePadding>
                      <ListItemIcon>
                        <Checkbox edge="start" tabIndex={-1} disableRipple />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title}
                        secondary={`Vence: ${new Date(task.dueDate).toLocaleDateString()}`}
                      />
                      <EventNoteIcon color="action" />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No tienes tareas próximas. ¡Buen trabajo!" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

