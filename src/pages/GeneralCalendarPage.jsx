import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useUser } from '../context/UserContext';
import { fetchAdminTasks } from '../services/api';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import TodayIcon from '@mui/icons-material/Today';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Grid from '@mui/material/Grid';

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
  const [allEvents, setAllEvents] = useState([]);
  const [view, setView] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('all');

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
            start: new Date(task.dueDate),
            end: new Date(task.dueDate),
            allDay: true,
            resource: {
              completed: task.completed,
              userName,
              userId: task.userId,
              description: task.description || '',
            },
          };
        });

        setAllEvents(mappedEvents);
        setError(null);
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
    const isCompleted = event.resource.completed;
    const style = {
      background: isCompleted
        ? 'linear-gradient(135deg, #a5d6a7, #66bb6a)'
        : 'linear-gradient(135deg, #ef9a9a, #e57373)',
      borderRadius: '8px',
      opacity: 0.9,
      color: '#000',
      border: 'none',
      display: 'block',
      padding: '2px 4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      fontWeight: 500,
      fontSize: '0.85rem',
    };
    return { style };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const CustomToolbar = (toolbar) => {
    const { date, onView, onNavigate } = toolbar;

    const years = Array.from({ length: 11 }, (_, i) => moment().year() - 5 + i);
    const months = moment.months();

    return (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="outlined" size="small" onClick={() => onNavigate('TODAY')}>Hoy</Button>
                <IconButton onClick={() => onNavigate('PREV')}><ChevronLeftIcon /></IconButton>
                <IconButton onClick={() => onNavigate('NEXT')}><ChevronRightIcon /></IconButton>
                
                <FormControl size="small" variant="outlined">
                    <Select value={moment(date).month()} onChange={(e) => onNavigate(moment(date).month(e.target.value).toDate())}>
                        {months.map((month, index) => <MenuItem key={index} value={index}>{month}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl size="small" variant="outlined">
                    <Select value={moment(date).year()} onChange={(e) => onNavigate(moment(date).year(e.target.value).toDate())}>
                        {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
            <ButtonGroup variant="outlined" size="small">
                 <Button variant={view === 'month' ? 'contained' : 'outlined'} onClick={() => onView('month')}>Mes</Button>
                 <Button variant={view === 'week' ? 'contained' : 'outlined'} onClick={() => onView('week')}>Semana</Button>
                 <Button variant={view === 'day' ? 'contained' : 'outlined'} onClick={() => onView('day')}>Día</Button>
            </ButtonGroup>
        </Box>
    );
  };

  const [currentDate, setCurrentDate] = useState(new Date());

  if (loading) {
    return (
      <Box sx={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        Calendario General de Tareas
      </Typography>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          borderRadius: 3,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {/* Filtros y leyenda */}
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
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
            <Chip label="Completada" sx={{ bgcolor: '#a5d6a7', fontWeight: 500 }} />
            <Chip label="Pendiente" sx={{ bgcolor: '#ef9a9a', fontWeight: 500 }} />
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
            onSelectEvent={handleSelectEvent}
            tooltipAccessor={(event) =>
              `[${event.resource.userName}] ${
                event.title
              } - ${event.resource.completed ? 'Completada' : 'Pendiente'}`
            }
          />
        )}
      </Paper>

      {/* Diálogo de detalles del evento */}
      <Dialog
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>Detalle de tarea</DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>{selectedEvent.title}</Typography>
              <Typography variant="body2" gutterBottom>
                Usuario:{' '}
                <strong>{selectedEvent.resource.userName}</strong>
              </Typography>
              <Typography variant="body2" gutterBottom>
                Fecha:{' '}
                {moment(selectedEvent.start).format('DD/MM/YYYY')}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Estado:{' '}
                {selectedEvent.resource.completed ? 'Completada' : 'Pendiente'}
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
