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
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import TaskIcon from '@mui/icons-material/Task';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import MailIcon from '@mui/icons-material/Mail';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import { useUser } from '../context/UserContext';

const drawerWidth = 240;

const Sidebar = ({ variant, onClose, open }) => {
  const { currentUser, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'admin';

  const baseNavItems = [
    { text: 'Inicio', icon: <HomeIcon />, path: '/' },
    { text: 'Tareas', icon: <TaskIcon />, path: '/tasks' },
    { text: 'Calendario Personal', icon: <CalendarMonthIcon />, path: '/calendar' },
    { text: 'Calendario General', icon: <GroupIcon />, path: '/calendar/general' },
    { text: 'Mensajes', icon: <MailIcon />, path: '/messages' },
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

  return (
    <Drawer
      variant={variant}
      anchor="left"
      open={open}
      onClose={onClose}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #42a5f5, #ab47bc)',
          color: 'white',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}
        >
          Sistema de tareas
        </Typography>

        {currentUser && (
          <>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mb: 1,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: 28,
              }}
            >
              {currentUser.name[0]}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
              {currentUser.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {currentUser.email}
            </Typography>

            {isAdmin && (
              <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.9 }}>
                Administrador
              </Typography>
            )}

            <Button
              variant="outlined"
              size="small"
              sx={{
                mt: 2,
                color: 'white',
                borderColor: 'rgba(255,255,255,0.6)',
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
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'rgba(66, 165, 245, 0.15)',
                  '&:hover': { bgcolor: 'rgba(66, 165, 245, 0.25)' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
