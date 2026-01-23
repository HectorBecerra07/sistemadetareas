import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
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
      // Reset form for creating
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
    // Only validate user selection if the users prop is provided (i.e., for admins)
    if (users && !taskData.userId) newErrors.user = 'Debe seleccionar un usuario.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    // Combine date and time for ISO string
    const getCombinedDateTime = (date, time) => {
        if (!date || !time) return null;
        const [hours, minutes] = time.split(':');
        return moment(date).hour(hours).minute(minutes).toISOString();
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
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 4,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          {isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea'}
        </Typography>

        <FormControl fullWidth margin="normal" error={Boolean(errors.user)}>
          <InputLabel id="user-select-label">Asignar a</InputLabel>
          <Select
            labelId="user-select-label"
            value={taskData.userId}
            name="userId"
            label="Asignar a"
            onChange={handleChange}
          >
            <MenuItem value="" disabled>
              <em>Seleccione un usuario</em>
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </Select>
          {errors.user && <Typography color="error" variant="caption">{errors.user}</Typography>}
        </FormControl>

        <TextField
          fullWidth
          margin="normal"
          name="title"
          label="Título de la Tarea"
          value={taskData.title}
          onChange={handleChange}
          error={Boolean(errors.title)}
          helperText={errors.title}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          margin="normal"
          name="description"
          label="Descripción"
          value={taskData.description}
          onChange={handleChange}
        />

        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    margin="normal"
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
                 <FormControl fullWidth margin="normal">
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
        </Grid>
        
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    margin="normal"
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
                    margin="normal"
                    name="endTime"
                    type="time"
                    label="Hora de Fin"
                    InputLabelProps={{ shrink: true }}
                    value={taskData.endTime}
                    onChange={handleChange}
                />
            </Grid>
        </Grid>


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

export default TaskFormModal;
