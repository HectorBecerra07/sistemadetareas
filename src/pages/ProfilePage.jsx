import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { updateUserProfile } from '../services/api';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

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
      updateCurrentUser(data.user);
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
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
        Mi Perfil
      </Typography>
      
      <Card sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3} alignItems="center">
              {/* Avatar */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar
                  src={formState.avatarUrl}
                  sx={{ width: 100, height: 100, fontSize: 48, border: '3px solid', borderColor: 'primary.main' }}
                >
                  {!formState.avatarUrl && currentUser.name[0]}
                </Avatar>
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
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Pega la URL de una imagen para tu foto de perfil.
                </Typography>
              </Grid>

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      
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
