import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useUser } from '../context/UserContext';
import { fetchTasks, createTask, deleteTask, updateTask } from '../services/api';
import EventFormModal from '../components/EventFormModal';
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
  DialogActions,
  useTheme,
} from '@mui/material';
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
    const theme = useTheme();
    const [events, setEvents] = useState([]);
    const [view, setView] = useState('month');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [newEventSlot, setNewEventSlot] = useState(null);
    const [editEventData, setEditEventData] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (!currentUser) return;
        const loadTasksForCalendar = async () => {
            try {
                setLoading(true);
                const userTasks = await fetchTasks();
                const mappedEvents = userTasks
                    .filter(task => task.dueDate)
                    .map(task => ({
                        id: task.id,
                        title: task.title,
                        start: new Date(task.startTime || task.dueDate),
                        end: new Date(task.endTime || task.dueDate),
                        allDay: !task.startTime,
                        resource: { ...task },
                    }));
                setEvents(mappedEvents);
            } catch (err) {
                setError('No se pudieron cargar los eventos del calendario.');
            } finally {
                setLoading(false);
            }
        };
        loadTasksForCalendar();
    }, [currentUser]);

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
                <Button onClick={() => onView('agenda')} variant={view === 'agenda' ? 'contained' : 'outlined'}>Agenda</Button>
            </ButtonGroup>
        </Box>
    );

    const handleSave = async (data, id) => {
        try {
            if (id) {
                await updateTask(id, data);
            } else {
                await createTask({ ...data, userId: currentUser.id });
            }
            // Refetch
            const userTasks = await fetchTasks();
            const mappedEvents = userTasks
                .filter(task => task.dueDate)
                .map(task => ({
                    id: task.id,
                    title: task.title,
                    start: new Date(task.startTime || task.dueDate),
                    end: new Date(task.endTime || task.dueDate),
                    allDay: !task.startTime,
                    resource: { ...task },
                }));
            setEvents(mappedEvents);
            setEditEventData(null);
            setNewEventSlot(null);
        } catch (err) {
            setError('Error al guardar el evento.');
        }
    }

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ height: 'calc(100vh - 128px)' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>Calendario</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper sx={{ p: 2, height: '100%' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    messages={messages}
                    eventPropGetter={eventStyleGetter}
                    components={{ toolbar: CustomToolbar }}
                    onSelectEvent={event => setSelectedEvent(event)}
                    onSelectSlot={slot => setNewEventSlot(slot)}
                    selectable
                    view={view}
                    onView={setView}
                    date={currentDate}
                    onNavigate={date => setCurrentDate(date)}
                />
            </Paper>

            <Dialog open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)}>
                {selectedEvent && (
                    <>
                        <DialogTitle>{selectedEvent.title}</DialogTitle>
                        <DialogContent>
                            <Typography>Prioridad: {selectedEvent.resource.priority}</Typography>
                            <Typography>Estado: {selectedEvent.resource.completed ? 'Completada' : 'Pendiente'}</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSelectedEvent(null)}>Cerrar</Button>
                            <Button onClick={() => { setSelectedEvent(null); setEditEventData(selectedEvent.resource); }}>Editar</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {(newEventSlot || editEventData) && (
                <EventFormModal
                    open={Boolean(newEventSlot || editEventData)}
                    handleClose={() => { setNewEventSlot(null); setEditEventData(null); }}
                    onSave={handleSave}
                    initialData={
                      editEventData
                        ? { ...editEventData, start: new Date(editEventData.start), end: new Date(editEventData.end) }
                        : {
                            start: newEventSlot.start,
                            end: newEventSlot.end,
                            allDay: Boolean(newEventSlot.action === 'select' && !newEventSlot.slots.some(s => typeof s === 'string' && s.includes('T'))),
                            resource: { priority: 'media' }, // Default for new events
                          }
                    }
                />
            )}
        </Box>
    );
};

export default CalendarPage;

