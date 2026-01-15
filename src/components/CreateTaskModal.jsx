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
} from '@mui/material';

const CreateTaskModal = ({ open, handleClose, handleAddTask, users = null, currentUser = null }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [errors, setErrors] = useState({});

  // Si es un usuario normal, pre-seleccionar su ID.
  useEffect(() => {
    if (!users && currentUser) {
      setSelectedUserId(currentUser.id);
    }
    // Reset user selection if it's the admin opening the modal
    if (users && open) {
       setSelectedUserId('');
    }
  }, [open, users, currentUser]);

  const validate = () => {
    let newErrors = {};
    if (!title.trim()) newErrors.title = 'El título es obligatorio.';
    if (!dueDate) newErrors.dueDate = 'La fecha límite es obligatoria.';
    if (users && !selectedUserId) newErrors.user = 'Debe seleccionar un usuario.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    handleAddTask({
      title,
      dueDate: new Date(dueDate),
      userId: selectedUserId,
    });

    handleClose();
    setTitle('');
    setDueDate('');
    setSelectedUserId(currentUser?.id || '');
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 4,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Crear Nueva Tarea
        </Typography>

        {/* User selector for admin */}
        {users && (
          <FormControl fullWidth margin="normal" error={Boolean(errors.user)}>
            <InputLabel id="user-select-label">Asignar a</InputLabel>
            <Select
              labelId="user-select-label"
              value={selectedUserId}
              label="Asignar a"
              onChange={(e) => setSelectedUserId(e.target.value)}
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
        )}

        <TextField
          fullWidth
          margin="normal"
          label="Título de la Tarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title}
        />

        <TextField
          fullWidth
          margin="normal"
          type="date"
          label="Fecha Límite"
          InputLabelProps={{ shrink: true }}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={Boolean(errors.dueDate)}
          helperText={errors.dueDate}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Crear
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateTaskModal;

