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
import AdminUsersPage from './pages/AdminUsersPage';
import ClientsPage from './pages/ClientsPage'; // Importar la nueva página
import { useUser } from './context/UserContext';

const ProtectedRoutes = () => {
  const { currentUser, loading } = useUser();

  if (loading) return null;

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

const AdminRoutes = () => {
  const { currentUser } = useUser();
  // This component assumes it's used within ProtectedRoutes, so currentUser is available.
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
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
          <Route path="/clients" element={<ClientsPage />} />
          
          <Route element={<AdminRoutes />}>
            <Route path="/admin/tasks" element={<AdminTasksPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;