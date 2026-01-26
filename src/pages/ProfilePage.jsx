import React, { useState, useRef } from 'react';
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
  IconButton,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const ProfilePage = () => {
  const { currentUser, updateCurrentUser } = useUser();
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    avatarUrl: currentUser.avatarUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(currentUser.avatarUrl || '');

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormState((prev) => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(currentUser.avatarUrl || '');
      setFormState((prev) => ({ ...prev, avatarUrl: currentUser.avatarUrl || '' }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
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
                <Box sx={{ position: 'relative', width: 100, height: 100 }}>
                  <Avatar
                    src={imagePreview}
                    sx={{ width: 100, height: 100, fontSize: 48, border: '3px solid', borderColor: 'primary.main', cursor: 'pointer' }}
                    onClick={handleAvatarClick}
                  >
                    {!imagePreview && currentUser.name[0]}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                    onClick={handleAvatarClick}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </Box>
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
              
              {/* Avatar URL Text Field (can still be used if desired, or hidden) */}
              <Grid item xs={12}>
                <TextField
                  label="URL del Avatar (o cargado localmente)"
                  name="avatarUrl"
                  value={formState.avatarUrl}
                  onChange={handleChange}
                  fullWidth
                  placeholder="https://ejemplo.com/imagen.png"
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Pega la URL de una imagen o carga una localmente. Ten en cuenta que la carga local solo se guarda en tu navegador y no es persistente en el servidor.
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
