import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Grid,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const backgroundUrl =
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1200&q=80';

const RegisterPage = () => {
  const { register } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    try {
      setSubmitting(true);
      await register(name.trim(), email.trim(), password.trim());
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Error al registrar el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100vh', width: '100vw', maxWidth: '100%' }}>
            {/* Columna de Branding */}
            <Grid
              sx={{
                width: { sm: '33.33%', md: '50%' },
                display: { xs: 'none', sm: 'flex' },
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundColor: (t) =>
                  t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography component="h1" variant="h3" sx={{ fontWeight: 'bold' }}>
                  Work Tareas
                </Typography>
                <Typography variant="h6">
                  Únete y empieza a organizarte hoy.
                </Typography>
              </Box>
            </Grid>
      
            {/* Columna del Formulario */}
            <Grid
              component={Paper}
              elevation={8}
              square
              sx={{
                width: { xs: '100%', sm: '66.67%', md: '50%' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  my: 8,
                  p: { xs: 3, sm: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: 480,
                  mx: 'auto',
                }}
              >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <PersonAddOutlinedIcon fontSize="large" />
                </Avatar>
                <Typography component="h1" variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                  Crea tu cuenta
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Es rápido y fácil.
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                  {/* ... (TextFields remain the same) ... */}
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Nombre completo"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Correo electrónico"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
      
                  {error && (
                    <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                      {error}
                    </Alert>
                  )}
      
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.05rem', textTransform: 'none' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Registrando...' : 'Registrar'}
                  </Button>
      
                  <Grid container justifyContent="flex-end">
                    <Grid>
                      <Link component={RouterLink} to="/login" variant="body2">
                        ¿Ya tienes una cuenta? Inicia sesión
                      </Link>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
    </Grid>
  );
};

export default RegisterPage;

