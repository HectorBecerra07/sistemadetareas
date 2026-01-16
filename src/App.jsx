// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import GeneralCalendarPage from './pages/GeneralCalendarPage';
import MessagesPage from './pages/MessagesPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminTasksPage from './pages/AdminTasksPage';
import ProfilePage from './pages/ProfilePage';
import { useUser } from './context/UserContext';

const ProtectedRoutes = () => {
  const { currentUser, loading } = useUser();

  if (loading) return null; // ya tienes loaders en las páginas

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas dentro del layout */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/calendar/general" element={<GeneralCalendarPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/tasks" element={<AdminTasksPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;