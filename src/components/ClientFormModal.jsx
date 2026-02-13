import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const ClientFormModal = ({ open, onClose, onSave, client }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vendingMachineModel: '',
    status: 'potencial',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        phone: client.phone || '',
        vendingMachineModel: client.vendingMachineModel || '',
        status: client.status || 'potencial',
      });
    } else {
      // Reset for new client
      setFormData({
        name: '',
        phone: '',
        vendingMachineModel: '',
        status: 'potencial',
      });
    }
  }, [client, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{client ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nombre del Cliente"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="phone"
            label="Teléfono"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="vendingMachineModel"
            label="Modelo de Máquina"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.vendingMachineModel}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Estatus</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Estatus"
            >
              <MenuItem value="potencial">Potencial</MenuItem>
              <MenuItem value="intermedio">Intermedio</MenuItem>
              <MenuItem value="no_potencial">No Potencial</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ClientFormModal;
