import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useUser } from '../context/UserContext';
import { fetchAdminTasks } from '../services/api';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  ButtonGroup,
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

moment.locale('es');
const localizer = momentLocalizer(moment);

const messages = {
  allDay: 'Todo el día',
  previous: '<',
  next: '>',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango.',
  showMore: total => `+ Ver más (${total})`,
};

const GeneralCalendarPage = () => {
  const { users } = useUser();
  const theme = useTheme();
  const [allEvents, setAllEvents] = useState([]);
  const [view, setView] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!users || users.length === 0) return;

    const loadAllTasks = async () => {
      try {
        setLoading(true);
        const allTasks = await fetchAdminTasks();

        const mappedEvents = allTasks.map(task => {
          const user = users.find(u => u.id === task.userId);
          const userName = user ? user.name : 'Usuario desconocido';

          return {
            id: task.id,
            title: task.title,
            start: new Date(task.startTime || task.dueDate),
            end: new Date(task.endTime || task.dueDate),
            allDay: !task.startTime,
            resource: {
              ...task,
              userName,
            },
          };
        });

        setAllEvents(mappedEvents);
      } catch (err) {
        setError('No se pudieron cargar los eventos del calendario general.');
      } finally {
        setLoading(false);
      }
    };

    loadAllTasks();
  }, [users]);

  const events = useMemo(() => {
    if (selectedUserId === 'all') return allEvents;
    return allEvents.filter(
      ev => String(ev.resource.userId) === String(selectedUserId)
    );
  }, [allEvents, selectedUserId]);

  const eventStyleGetter = (event) => {
    const priority = event.resource.priority;
    const isCompleted = event.resource.completed;
    let backgroundColor = theme.palette.grey[500];

    if (isCompleted) {
        backgroundColor = theme.palette.success.main;
    } else {
        switch (priority) {
            case 'baja':
                backgroundColor = theme.palette.info.main;
                break;
            case 'media':
                backgroundColor = theme.palette.warning.main;
                break;
            case 'alta':
                backgroundColor = theme.palette.error.main;
                break;
        }
    }
    return { style: { backgroundColor, color: 'white', borderRadius: '5px', opacity: 0.8 } };
  };

  const CustomToolbar = ({ label, onNavigate, onView, view }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
            <IconButton onClick={() => onNavigate('PREV')}><ChevronLeftIcon /></IconButton>
            <Button onClick={() => onNavigate('TODAY')}>Hoy</Button>
            <IconButton onClick={() => onNavigate('NEXT')}><ChevronRightIcon /></IconButton>
        </Box>
        <Typography variant="h6">{label}</Typography>
        <ButtonGroup variant="outlined">
            <Button onClick={() => onView('month')} variant={view === 'month' ? 'contained' : 'outlined'}>Mes</Button>
            <Button onClick={() => onView('week')} variant={view === 'week' ? 'contained' : 'outlined'}>Semana</Button>
            <Button onClick={() => onView('day')} variant={view === 'day' ? 'contained' : 'outlined'}>Día</Button>
        </ButtonGroup>
    </Box>
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  
  return (
    <Box sx={{ height: 'calc(100vh - 128px)' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>Calendario General de Tareas</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, height: '100%' }}>
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="user-filter-label">Filtrar por usuario</InputLabel>
            <Select
              labelId="user-filter-label"
              label="Filtrar por usuario"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <MenuItem value="all">Todos los usuarios</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2">Leyenda:</Typography>
            <Chip label="Completada" color="success" />
            <Chip label="Pendiente (Baja)" color="info" />
            <Chip label="Pendiente (Media)" color="warning" />
            <Chip label="Pendiente (Alta)" color="error" />
          </Stack>
        </Box>

        {events.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No hay tareas para mostrar con el filtro actual.
            </Typography>
          </Box>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={messages}
            eventPropGetter={eventStyleGetter}
            components={{ toolbar: CustomToolbar }}
            view={view}
            onView={setView}
            date={currentDate}
            onNavigate={date => setCurrentDate(date)}
            onSelectEvent={event => setSelectedEvent(event)}
            tooltipAccessor={(event) =>
              `[${event.resource.userName}] ${
                event.title
              } - ${event.resource.completed ? 'Completada' : 'Pendiente'}`
            }
          />
        )}
      </Paper>

      <Dialog
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Detalle de Tarea</DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>{selectedEvent.title}</Typography>
              <Typography variant="body2" gutterBottom>
                Usuario: <strong>{selectedEvent.resource.userName}</strong>
              </Typography>
              <Typography variant="body2" gutterBottom>
                Fecha:{' '}
                {moment(selectedEvent.start).format('DD/MM/YYYY')}
              </Typography>
              {selectedEvent.resource.startTime && (
                <Typography variant="body2" gutterBottom>
                  Hora de inicio: {moment(selectedEvent.resource.startTime).format('HH:mm')}
                </Typography>
              )}
              {selectedEvent.resource.endTime && (
                <Typography variant="body2" gutterBottom>
                  Hora de fin: {moment(selectedEvent.resource.endTime).format('HH:mm')}
                </Typography>
              )}
              <Typography variant="body2" gutterBottom>
                Estado:{' '}
                {selectedEvent.resource.completed ? 'Completada' : 'Pendiente'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Prioridad:{' '}
                {selectedEvent.resource.priority}
              </Typography>
              {selectedEvent.resource.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Descripción: {selectedEvent.resource.description}
                </Typography>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GeneralCalendarPage;
