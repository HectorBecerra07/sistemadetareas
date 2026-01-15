// src/components/AppLayout.jsx
import React, { useState } from 'react';
// import { Outlet } from 'react-router-dom'; // No es necesario, se recibe por props
import { useTheme, useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';

const drawerWidth = 240;

const AppLayout = ({ children }) => { // Recibe children
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100%', // Asegura que no haya desbordamiento
        bgcolor: 'grey.100',
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Sistema de Tareas
          </Typography>
        </Toolbar>
      </AppBar>

      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: { xs: '56px', sm: '64px' },
          overflow: 'auto',
        }}
      >
        {children} {/* Renderiza el Outlet que viene de ProtectedRoutes */}
      </Box>
    </Box>
  );
};

export default AppLayout;
