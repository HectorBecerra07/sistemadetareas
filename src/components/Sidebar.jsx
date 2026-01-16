import React from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Avatar,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import TaskIcon from '@mui/icons-material/Task';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import MailIcon from '@mui/icons-material/Mail';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { useUser } from '../context/UserContext';

const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle }) => {
  const { currentUser, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isAdmin = currentUser?.role === 'admin';

  const baseNavItems = [
    { text: 'Inicio', icon: <HomeIcon />, path: '/' },
    { text: 'Tareas', icon: <TaskIcon />, path: '/tasks' },
    { text: 'Calendario Personal', icon: <CalendarMonthIcon />, path: '/calendar' },
    { text: 'Calendario General', icon: <GroupIcon />, path: '/calendar/general' },
    { text: 'Mensajes', icon: <MailIcon />, path: '/messages' },
    { text: 'Mi Perfil', icon: <AccountCircleIcon />, path: '/profile' },
  ];

  const adminNavItems = isAdmin
    ? [
        {
          text: 'Panel Tareas (Admin)',
          icon: <AdminPanelSettingsIcon />,
          path: '/admin/tasks',
        },
      ]
    : [];

  const navItems = [...baseNavItems, ...adminNavItems];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <div>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          background: (theme) => `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 1,
            mb: 1,
            fontWeight: 'bold',
          }}
        >
          Work Tareas
        </Typography>

        {currentUser && (
          <>
            <Avatar
              src={currentUser.avatarUrl}
              sx={{
                width: 64,
                height: 64,
                mb: 1,
                bgcolor: 'rgba(255,255,255,0.25)',
                fontSize: 28,
                border: '2px solid white',
              }}
            >
              {!currentUser.avatarUrl && currentUser.name[0]}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
              {currentUser.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {currentUser.email}
            </Typography>

            {isAdmin && (
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  fontWeight: 'bold',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  px: 1,
                  borderRadius: 1,
                }}
              >
                Administrador
              </Typography>
            )}

            <Button
              variant="outlined"
              size="small"
              sx={{
                mt: 2,
                color: 'white',
                borderColor: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </>
        )}
      </Box>

      <Divider />

      <List sx={{ mt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive(item.path) ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

