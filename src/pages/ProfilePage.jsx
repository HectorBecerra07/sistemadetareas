import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { updateUserProfile } from '../services/api';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const ProfilePage = () => {
  const { currentUser, updateCurrentUser } = useUser();

  const [formState, setFormState] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    avatarUrl: currentUser.avatarUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = await updateUserProfile(formState);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      updateCurrentUser(data.user); // Actualizar contexto y localStorage
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Editar Perfil
      </Typography>
      <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 720, mx: 'auto' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3} alignItems="center">
            {/* Avatar */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                src={formState.avatarUrl}
                sx={{ width: 120, height: 120, fontSize: 60, mb: 2 }}
              >
                {!formState.avatarUrl && currentUser.name[0]}
              </Avatar>
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <TextField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Name */}
            <Grid item xs={12}>
              <TextField
                label="Nombre Completo"
                name="name"
                value={formState.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            {/* Avatar URL */}
            <Grid item xs={12}>
              <TextField
                label="URL del Avatar"
                name="avatarUrl"
                value={formState.avatarUrl}
                onChange={handleChange}
                fullWidth
                placeholder="https://ejemplo.com/imagen.png"
              />
              <Typography variant="caption" color="text.secondary">
                Pega la URL de una imagen para tu foto de perfil.
              </Typography>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          ¡Perfil actualizado con éxito!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
