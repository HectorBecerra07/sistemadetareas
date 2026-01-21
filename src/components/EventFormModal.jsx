import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import moment from 'moment';

const EventFormModal = ({ open, handleClose, handleCreateEvent, handleUpdateEvent, slotInfo, initialEventData }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('media');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialEventData);

  useEffect(() => {
    if (open) {
      if (isEditing) {
        setTitle(initialEventData.title);
        setPriority(initialEventData.resource.priority || 'media');
        console.log("Initial Event Data Start:", initialEventData.start);
        console.log("Initial Event Data End:", initialEventData.end);
        console.log("Formatted Start Time:", initialEventData.start && !initialEventData.allDay ? moment(initialEventData.start).format('HH:mm') : '');
        console.log("Formatted End Time:", initialEventData.end && !initialEventData.allDay ? moment(initialEventData.end).format('HH:mm') : '');
        // Format start/end times if they exist
        setStartTime(initialEventData.start && !initialEventData.allDay ? moment(initialEventData.start).format('HH:mm') : '');
        setEndTime(initialEventData.end && !initialEventData.allDay ? moment(initialEventData.end).format('HH:mm') : '');
      } else {
        setTitle('');
        setPriority('media');
        setStartTime(slotInfo?.start ? moment(slotInfo.start).format('HH:mm') : '');
        setEndTime(slotInfo?.end ? moment(slotInfo.end).format('HH:mm') : '');
      }
      setErrors({});
    }
  }, [open, isEditing, initialEventData, slotInfo]);

  const validate = () => {
    let newErrors = {};
    if (!title.trim()) newErrors.title = 'El título es obligatorio.';
    // Basic time validation
    if (startTime && endTime && startTime >= endTime) {
      newErrors.time = 'La hora de fin debe ser posterior a la hora de inicio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const eventData = {
      title,
      dueDate: isEditing ? initialEventData.start : slotInfo.start, // Use initialEventData.start for dueDate if editing
      priority,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    };

    if (isEditing) {
      handleUpdateEvent(initialEventData.id, eventData);
    } else {
      handleCreateEvent(eventData);
    }

    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: 'sm',
          width: '90%',
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 4,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Fecha: {isEditing ? moment(initialEventData.start).format('LL') : (slotInfo ? moment(slotInfo.start).format('LL') : '')}
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Título del Evento"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title}
          autoFocus
        />

        <TextField
          fullWidth
          margin="normal"
          type="time"
          label="Hora de Inicio"
          InputLabelProps={{ shrink: true }}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          error={Boolean(errors.time)}
          helperText={errors.time}
        />

        <TextField
          fullWidth
          margin="normal"
          type="time"
          label="Hora de Fin"
          InputLabelProps={{ shrink: true }}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          error={Boolean(errors.time)}
          helperText={errors.time}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="priority-select-label">Prioridad</InputLabel>
          <Select
            labelId="priority-select-label"
            value={priority}
            label="Prioridad"
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="baja">Baja</MenuItem>
            <MenuItem value="media">Media</MenuItem>
            <MenuItem value="alta">Alta</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEditing ? 'Guardar Cambios' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EventFormModal;