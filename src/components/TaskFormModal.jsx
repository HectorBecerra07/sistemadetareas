import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
} from '@mui/material';
import moment from 'moment';

const TaskFormModal = ({ open, handleClose, onSave, users, initialData = null }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    userId: '',
    priority: 'media',
    startTime: '',
    endTime: '',
  });
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (isEditing && initialData) {
      setTaskData({
        title: initialData.title || '',
        description: initialData.description || '',
        dueDate: initialData.dueDate ? moment(initialData.dueDate).format('YYYY-MM-DD') : '',
        userId: initialData.userId || '',
        priority: initialData.priority || 'media',
        startTime: initialData.startTime ? moment(initialData.startTime).format('HH:mm') : '',
        endTime: initialData.endTime ? moment(initialData.endTime).format('HH:mm') : '',
      });
    } else {
      setTaskData({
        title: '',
        description: '',
        dueDate: '',
        userId: '',
        priority: 'media',
        startTime: '',
        endTime: '',
      });
    }
  }, [initialData, isEditing, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let newErrors = {};
    if (!taskData.title.trim()) newErrors.title = 'El título es obligatorio.';
    if (!taskData.dueDate) newErrors.dueDate = 'La fecha límite es obligatoria.';
    if (users?.length > 0 && !taskData.userId) newErrors.userId = 'Debe seleccionar un usuario.';
    
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
        ...taskData,
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
        {isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {users?.length > 0 && (
            <Grid item xs={12}>
              <FormControl fullWidth error={Boolean(errors.userId)}>
                <InputLabel id="user-select-label">Asignar a</InputLabel>
                <Select
                  labelId="user-select-label"
                  value={taskData.userId}
                  name="userId"
                  label="Asignar a"
                  onChange={handleChange}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
                {errors.userId && <Typography color="error" variant="caption">{errors.userId}</Typography>}
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="title"
              label="Título de la Tarea"
              value={taskData.title}
              onChange={handleChange}
              error={Boolean(errors.title)}
              helperText={errors.title}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="description"
              label="Descripción"
              value={taskData.description}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="dueDate"
              type="date"
              label="Fecha Límite"
              InputLabelProps={{ shrink: true }}
              value={taskData.dueDate}
              onChange={handleChange}
              error={Boolean(errors.dueDate)}
              helperText={errors.dueDate}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="priority-label">Prioridad</InputLabel>
              <Select
                labelId="priority-label"
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
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="startTime"
              type="time"
              label="Hora de Inicio"
              InputLabelProps={{ shrink: true }}
              value={taskData.startTime}
              onChange={handleChange}
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
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 24px' }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEditing ? 'Guardar Cambios' : 'Crear Tarea'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskFormModal;
