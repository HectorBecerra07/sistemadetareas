import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; // Assuming delete functionality will be added or is already there

import { fetchUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from '../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formState, setFormState] = useState({ name: '', email: '', password: '', role: 'user' });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const theme = useTheme();
  const isEditing = Boolean(selectedUser);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err.message || 'Error al cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    setSelectedUser(user);
    if (user) {
        setFormState({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
        setFormState({ name: '', email: '', password: '', role: 'user' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormState({ name: '', email: '', password: '', role: 'user' });
    setFormError(null);
  };

  const handleFormChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
        const dataToSend = { ...formState };
        if (isEditing && !dataToSend.password) {
            delete dataToSend.password;
        }

        if (isEditing) {
            await adminUpdateUser(selectedUser.id, dataToSend);
        } else {
            await adminCreateUser(dataToSend);
        }
        handleCloseModal();
        loadUsers();
    } catch (err) {
      setFormError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el usuario.`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        try {
            await adminDeleteUser(userId);
            loadUsers();
        } catch (err) {
            setError(err.message || 'Error al eliminar el usuario.');
        }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Gestión de Usuarios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administrar usuarios del sistema (crear, editar, eliminar).
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Crear Usuario
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Editar Usuario">
                                <IconButton size="small" onClick={() => handleOpenModal(user)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar Usuario">
                                <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          
          <TextField name="name" label="Nombre" value={formState.name} onChange={handleFormChange} fullWidth required margin="normal" />
          <TextField name="email" label="Correo Electrónico" type="email" value={formState.email} onChange={handleFormChange} fullWidth required margin="normal" />
          <TextField name="password" label={isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'} type="password" value={formState.password} onChange={handleFormChange} fullWidth required={!isEditing} margin="normal" />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select name="role" label="Rol" value={formState.role} onChange={handleFormChange}>
              <MenuItem value="user">Usuario</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 24px' }}>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={formLoading} onClick={handleFormSubmit}>
            {formLoading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Guardar Cambios' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsersPage;
