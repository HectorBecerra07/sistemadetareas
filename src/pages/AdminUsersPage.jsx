import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { fetchUsers, adminCreateUser } from '../services/api';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form state
  const [formState, setFormState] = useState({ name: '', email: '', password: '', role: 'user' });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

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

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
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
      await adminCreateUser(formState);
      handleCloseModal();
      loadUsers(); // Refresh user list
    } catch (err) {
      setFormError(err.message || 'Error al crear el usuario.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Usuarios
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
          Crear Usuario
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Create User Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle} component="form" onSubmit={handleFormSubmit}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Crear Nuevo Usuario
          </Typography>
          
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          
          <TextField name="name" label="Nombre" value={formState.name} onChange={handleFormChange} fullWidth required margin="normal" />
          <TextField name="email" label="Correo Electrónico" type="email" value={formState.email} onChange={handleFormChange} fullWidth required margin="normal" />
          <TextField name="password" label="Contraseña" type="password" value={formState.password} onChange={handleFormChange} fullWidth required margin="normal" />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select name="role" label="Rol" value={formState.role} onChange={handleFormChange}>
              <MenuItem value="user">Usuario</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={formLoading}>
              {formLoading ? <CircularProgress size={24} /> : 'Crear'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminUsersPage;
