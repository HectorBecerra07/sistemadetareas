import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useUser } from '../context/UserContext';
import { fetchTasks, createTask, deleteTask, updateTask } from '../services/api';
import EventFormModal from '../components/EventFormModal';

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
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';

import TodayIcon from '@mui/icons-material/Today';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
const CalendarPage = () => {
    const { currentUser } = useUser();
    const [events, setEvents] = useState([]);
    const [view, setView] = useState('month');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [newEventSlot, setNewEventSlot] = useState(null);
    const [editEventData, setEditEventData] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        const loadTasksForCalendar = async () => {
            try {
                setLoading(true);
                const userTasks = await fetchTasks();
                const mappedEvents = userTasks
                    .filter(task => task.dueDate) // Solo incluir tareas con fecha
                    .map(task => ({
                        id: task.id,
                        title: task.title,
                        start: task.startTime && task.dueDate
                                ? moment(task.dueDate).set({
                                    hour: moment(task.startTime).hour(),
                                    minute: moment(task.startTime).minute(),
                                    second: moment(task.startTime).second(),
                                }).toDate()
                                : new Date(task.dueDate),
                        end: task.endTime && task.dueDate
                                ? moment(task.dueDate).set({
                                    hour: moment(task.endTime).hour(),
                                    minute: moment(task.endTime).minute(),
                                    second: moment(task.endTime).second(),
                                }).toDate()
                                : new Date(task.dueDate),
                        resource: { completed: task.completed, description: task.description || '', priority: task.priority, completedAt: task.completedAt },
                    }));
                setEvents(mappedEvents);
                setError(null);
            } catch (err) {
                setError('No se pudieron cargar los eventos del calendario.');
            } finally {
                setLoading(false);
            }
        };
        loadTasksForCalendar();
    }, [currentUser]);
    const eventStyleGetter = (event) => {
        const isCompleted = event.resource.completed;
        const priority = event.resource.priority; // 'baja', 'media', 'alta'

        let backgroundColor = '';
        let borderColor = 'transparent';

        if (isCompleted) {
            const isLateCompletion = moment(event.resource.completedAt).isAfter(moment(event.start), 'day');
            if (isLateCompletion) {
                backgroundColor = 'linear-gradient(135deg, #ffc107, #ff9800)'; // Late Completed (Orange)
                borderColor = '#f57c00'; // Dark orange border
            } else {
                backgroundColor = 'linear-gradient(135deg, #66bb6a, #388e3c)'; // Completed On Time (Darker Green)
                borderColor = '#2e7d32'; // Dark green border
            }
        } else {
            switch (priority) {
                case 'baja':
                    backgroundColor = 'linear-gradient(135deg, #90caf9, #2196f3)'; // Baja (Blue)
                    break;
                case 'media':
                    backgroundColor = 'linear-gradient(135deg, #ffeb3b, #fbc02d)'; // Media (Amber)
                    break;
                case 'alta':
                    backgroundColor = 'linear-gradient(135deg, #ef5350, #d32f2f)'; // Alta (Red)
                    break;
                default:
                    backgroundColor = 'linear-gradient(135deg, #bdbdbd, #757575)'; // Default (Grey - for pending without specific priority)
                    break;
            }
        }

        const style = {
            background: backgroundColor,
            borderRadius: '8px',
            opacity: 0.95, // Increased opacity for better visibility
            color: 'white', // Change text color to white for better contrast
            border: `1px solid ${borderColor}`, // Add border
            display: 'block',
            padding: '2px 4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            fontWeight: 600, // Bolder font weight
            fontSize: '0.9rem', // Slightly larger font size
        };
        return { style };
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
                      <Typography variant="h6" sx={{ mx: 2 }}>
                          {moment(date).format('MMMM YYYY')}
                      </Typography>
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
                       <Button variant={view === 'agenda' ? 'contained' : 'outlined'} onClick={() => onView('agenda')}>Agenda</Button>
                  </ButtonGroup>
              </Box>
          );
        };    
      const handleSelectEvent = (event) => {
        setSelectedEvent(event);
      };
    
      const handleSelectSlot = (slotInfo) => {
        setNewEventSlot({ start: slotInfo.start, end: slotInfo.end });
      };

      const [currentDate, setCurrentDate] = useState(new Date());
    
      if (loading || !currentUser) {
        return (
          <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        );
      }
    
      return (
        <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
    
          <Typography variant="h4" gutterBottom>
            Calendario de {currentUser.name}
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
            {/* Leyenda */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2, flexWrap: 'wrap' }}
            >
              <Typography variant="subtitle1">Leyenda:</Typography>
              <Chip label="Completada" sx={{ bgcolor: '#66bb6a', color: 'white', fontWeight: 500 }} />
              <Chip label="Completada con Retraso" sx={{ bgcolor: '#ff9800', color: 'white', fontWeight: 500 }} />
              <Chip label="Prioridad Baja" sx={{ bgcolor: '#2196f3', color: 'white', fontWeight: 500 }} />
              <Chip label="Prioridad Media" sx={{ bgcolor: '#fbc02d', color: 'white', fontWeight: 500 }} />
              <Chip label="Prioridad Alta" sx={{ bgcolor: '#d32f2f', color: 'white', fontWeight: 500 }} />
              <Chip label="Sin Prioridad" sx={{ bgcolor: '#757575', color: 'white', fontWeight: 500 }} />
            </Stack>
    
            {events.length === 0 ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column', // Added for vertical alignment
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  p: 3, // Added padding
                }}
              >
                <TodayIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Aún no tienes tareas con fecha asignada. <br />
                  Crea algunas tareas para verlas aquí en el calendario.
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
                selectable
                onSelectSlot={handleSelectSlot}
                tooltipAccessor={(event) =>
                  `${event.title} - ${
                    event.resource.completed ? 'Completada' : 'Pendiente'
                  }`
                }
              />
            )}
          </Paper>
    
          {/* Diálogo de detalle de evento */}
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
                    Fecha:{' '}
                    {moment(selectedEvent.start).format('DD/MM/YYYY')}
                  </Typography>
                  {selectedEvent.start && !selectedEvent.allDay && (
                    <Typography variant="body2" gutterBottom>
                      Hora de inicio: {moment(selectedEvent.start).format('HH:mm')}
                    </Typography>
                  )}
                  {selectedEvent.end && !selectedEvent.allDay && (
                    <Typography variant="body2" gutterBottom>
                      Hora de fin: {moment(selectedEvent.end).format('HH:mm')}
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
                <DialogActions>
                  <Button onClick={() => setSelectedEvent(null)}>Cerrar</Button>
                  {!selectedEvent.resource.completed && (
                    <Button 
                      onClick={async () => {
                        if (!selectedEvent) return;
                        try {
                            await updateTask(selectedEvent.id, { completed: true });
                            // Refetch events
                            const userTasks = await fetchTasks();
                            const mappedEvents = userTasks
                                .filter(task => task.dueDate)
                                .map(task => ({
                                    id: task.id,
                                    title: task.title,
                                    start: task.startTime && task.dueDate
                                            ? moment(task.dueDate).set({
                                                hour: moment(task.startTime).hour(),
                                                minute: moment(task.startTime).minute(),
                                                second: moment(task.startTime).second(),
                                            }).toDate()
                                            : new Date(task.dueDate),
                                    end: task.endTime && task.dueDate
                                            ? moment(task.dueDate).set({
                                                hour: moment(task.endTime).hour(),
                                                minute: moment(task.endTime).minute(),
                                                second: moment(task.endTime).second(),
                                            }).toDate()
                                            : new Date(task.dueDate),
                                    allDay: !(task.startTime && task.endTime),
                                    resource: { completed: task.completed, description: task.description || '', priority: task.priority },
                                }));
                            setEvents(mappedEvents);
                            setSelectedEvent(null);
                        } catch (err) {
                            setError('No se pudo marcar la tarea como completada.');
                        }
                      }}
                      variant="contained"
                      color="success"
                    >
                      Marcar como Completada
                    </Button>
                  )}
                  <Button 
                    onClick={() => { setEditEventData(selectedEvent); setSelectedEvent(null); }}
                    disabled={moment(selectedEvent.start).isBefore(moment(), 'day')} // Disable if task is in the past
                  >
                    Editar
                  </Button>
                  <Button 
                    onClick={async () => {
                      if (!selectedEvent) return;
                      try {
                        await deleteTask(selectedEvent.id);
                        const userTasks = await fetchTasks(); // Refetch events after deletion
                        const mappedEvents = userTasks
                            .filter(task => task.dueDate)
                            .map(task => ({
                                id: task.id,
                                title: task.title,
                                start: task.startTime && task.dueDate
                                        ? moment(task.dueDate).set({
                                            hour: moment(task.startTime).hour(),
                                            minute: moment(task.startTime).minute(),
                                            second: moment(task.startTime).second(),
                                        }).toDate()
                                        : new Date(task.dueDate),
                                end: task.endTime && task.dueDate
                                        ? moment(task.dueDate).set({
                                            hour: moment(task.endTime).hour(),
                                            minute: moment(task.endTime).minute(),
                                            second: moment(task.endTime).second(),
                                        }).toDate()
                                        : new Date(task.dueDate),
                                allDay: !(task.startTime && task.endTime),
                                resource: { completed: task.completed, description: task.description || '', priority: task.priority },
                            }));
                        setEvents(mappedEvents);
                        setSelectedEvent(null);
                      } catch (err) {
                        setError('No se pudo eliminar el evento.');
                      }
                    }} 
                    color="error"
                  >
                    Eliminar
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {newEventSlot && (
            <EventFormModal
              open={Boolean(newEventSlot)}
              handleClose={() => setNewEventSlot(null)}
              handleCreateEvent={async (eventData) => {
                try {
                  await createTask({ ...eventData, userId: currentUser.id });
                  // Refetch events
                  const userTasks = await fetchTasks();
                  const mappedEvents = userTasks
                    .filter(task => task.dueDate)
                    .map(task => ({
                      id: task.id,
                      title: task.title,
                      start: task.startTime && task.dueDate
                              ? moment(task.dueDate).set({
                                  hour: moment(task.startTime).hour(),
                                  minute: moment(task.startTime).minute(),
                                  second: moment(task.startTime).second(),
                                }).toDate()
                              : new Date(task.dueDate),
                      end: task.endTime && task.dueDate
                              ? moment(task.dueDate).set({
                                  hour: moment(task.endTime).hour(),
                                  minute: moment(task.endTime).minute(),
                                  second: moment(task.endTime).second(),
                                }).toDate()
                              : new Date(task.dueDate),
                      allDay: !(task.startTime && task.endTime),
                      resource: { completed: task.completed, description: task.description || '', priority: task.priority },
                    }));
                  setEvents(mappedEvents);
                  setNewEventSlot(null);
                } catch (err) {
                  setError('No se pudo crear el evento.');
                }
              }}
              slotInfo={newEventSlot}
            />
          )}

          {editEventData && (
            <EventFormModal
              open={Boolean(editEventData)}
              handleClose={() => setEditEventData(null)}
              handleUpdateEvent={async (id, eventData) => {
                try {
                  await updateTask(id, eventData);
                  // Refetch events
                  const userTasks = await fetchTasks();
                  const mappedEvents = userTasks
                    .filter(task => task.dueDate)
                    .map(task => ({
                      id: task.id,
                      title: task.title,
                      start: task.startTime && task.dueDate
                              ? moment(task.dueDate).set({
                                  hour: moment(task.startTime).hour(),
                                  minute: moment(task.startTime).minute(),
                                  second: moment(task.startTime).second(),
                                }).toDate()
                              : new Date(task.dueDate),
                      end: task.endTime && task.dueDate
                              ? moment(task.dueDate).set({
                                  hour: moment(task.endTime).hour(),
                                  minute: moment(task.endTime).minute(),
                                  second: moment(task.endTime).second(),
                                }).toDate()
                              : new Date(task.dueDate),
                      allDay: !(task.startTime && task.endTime),
                      resource: { completed: task.completed, description: task.description || '', priority: task.priority },
                    }));
                  setEvents(mappedEvents);
                  setEditEventData(null);
                } catch (err) {
                  setError('No se pudo actualizar el evento.');
                }
              }}
              initialEventData={editEventData}
            />
          )}
        </Box>
      );
    };
    
export default CalendarPage;
