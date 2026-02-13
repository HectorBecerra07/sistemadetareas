import React from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Avatar,
  Typography,
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
import LogoutIcon from '@mui/icons-material/Logout';
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
    { text: 'Calendario', icon: <CalendarMonthIcon />, path: '/calendar' },
    { text: 'Calendario General', icon: <GroupIcon />, path: '/calendar/general' },
    { text: 'Mensajes', icon: <MailIcon />, path: '/messages' },
    { text: 'Perfil', icon: <AccountCircleIcon />, path: '/profile' },
    { text: 'Clientes', icon: <GroupIcon />, path: '/clients' },
  ];

  const adminNavItems = isAdmin
    ? [
        {
          text: 'Admin Tareas',
          icon: <AdminPanelSettingsIcon />,
          path: '/admin/tasks',
        },
        {
          text: 'Admin Usuarios',
          icon: <GroupIcon />,
          path: '/admin/users',
        },
      ]
    : [];

  const navItems = [...baseNavItems, ...adminNavItems];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Area de Trabajo
        </Typography>
      </Box>
      <Divider />
      {currentUser && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar src={currentUser.avatarUrl} sx={{ width: 48, height: 48, mr: 2 }}>
            {!currentUser.avatarUrl && currentUser.name[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {currentUser.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser.email}
            </Typography>
          </Box>
        </Box>
      )}
      <Divider />
      <List sx={{ flexGrow: 1, p: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={RouterLink}
            to={item.path}
            selected={isActive(item.path)}
            onClick={isMobile ? handleDrawerToggle : undefined}
            sx={{
              borderRadius: theme.shape.borderRadius,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: theme.shape.borderRadius }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="mailbox folders"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
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

