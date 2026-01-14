import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const CreateTaskModal = ({ open, handleClose, handleAddTask }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!title.trim()) newErrors.title = 'El título es obligatorio.';
    if (!dueDate) newErrors.dueDate = 'La fecha límite es obligatoria.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    handleAddTask({
      title,
      dueDate: new Date(dueDate),
    });

    handleClose();
    setTitle('');
    setDueDate('');
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(3px)',
          p: 2,
        }}
      >
        <Box
          sx={{
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 3,
            p: 4,
            boxShadow: 10,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Crear Nueva Tarea
          </Typography>

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
      </Box>
    </Modal>
  );
};

export default CreateTaskModal;
