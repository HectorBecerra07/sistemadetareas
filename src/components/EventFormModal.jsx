import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
} from '@mui/material';
import moment from 'moment';

const EventFormModal = ({ open, handleClose, onSave, slotInfo, initialData }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    priority: 'media',
    startTime: '',
    endTime: '',
    dueDate: '',
  });
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTaskData({
          title: initialData.title || '',
          priority: initialData.priority || initialData.resource?.priority || 'media',
          startTime: initialData.start && !initialData.allDay ? moment(initialData.start).format('HH:mm') : '',
          endTime: initialData.end && !initialData.allDay ? moment(initialData.end).format('HH:mm') : '',
          dueDate: initialData.start ? moment(initialData.start).format('YYYY-MM-DD') : '',
        });
      } else {
        setTaskData({
          title: '',
          priority: 'media',
          startTime: slotInfo?.start ? moment(slotInfo.start).format('HH:mm') : '',
          endTime: slotInfo?.end ? moment(slotInfo.end).format('HH:mm') : '',
          dueDate: slotInfo?.start ? moment(slotInfo.start).format('YYYY-MM-DD') : '',
        });
      }
      setErrors({});
    }
  }, [open, initialData, slotInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let newErrors = {};
    if (!taskData.title.trim()) newErrors.title = 'El título es obligatorio.';
    if (taskData.startTime && taskData.endTime && taskData.startTime >= taskData.endTime) {
      newErrors.time = 'La hora de fin debe ser posterior a la hora de inicio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const getCombinedDateTime = (date, time) => {
        if (!date || !time) return null;
        return moment(`${date}T${time}`).toISOString();
    }

    const finalData = {
        title: taskData.title,
        priority: taskData.priority,
        dueDate: moment(taskData.dueDate).toISOString(),
        startTime: getCombinedDateTime(taskData.dueDate, taskData.startTime),
        endTime: getCombinedDateTime(taskData.dueDate, taskData.endTime),
    }

    onSave(finalData, initialData?.id);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="title"
              label="Título del Evento"
              value={taskData.title}
              onChange={handleChange}
              error={Boolean(errors.title)}
              helperText={errors.title}
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="dueDate"
              type="date"
              label="Fecha"
              InputLabelProps={{ shrink: true }}
              value={taskData.dueDate}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="startTime"
              type="time"
              label="Hora de Inicio"
              InputLabelProps={{ shrink: true }}
              value={taskData.startTime}
              onChange={handleChange}
              error={Boolean(errors.time)}
              helperText={errors.time}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="endTime"
              type="time"
              label="Hora de Fin"
              InputLabelProps={{ shrink: true }}
              value={taskData.endTime}
              onChange={handleChange}
              error={Boolean(errors.time)}
              helperText={errors.time}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="priority-select-label">Prioridad</InputLabel>
              <Select
                labelId="priority-select-label"
                name="priority"
                value={taskData.priority}
                label="Prioridad"
                onChange={handleChange}
              >
                <MenuItem value="baja">Baja</MenuItem>
                <MenuItem value="media">Media</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 24px' }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEditing ? 'Guardar Cambios' : 'Crear Evento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventFormModal;