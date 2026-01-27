// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const apiFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error en la petición a ${url}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
};

// ============ AUTH ============

export const registerUser = (userData) =>
  apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const loginUser = async (credentials) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// ============ USERS ============

export const fetchUsers = () => apiFetch('/users');

export const updateUserProfile = (profileData) =>
  apiFetch('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });

// ============ ADMIN ===============

export const adminCreateUser = (userData) =>
  apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const adminUpdateUser = (id, userData) =>
  apiFetch(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });

export const adminDeleteUser = (id) =>
  apiFetch(`/admin/users/${id}`, {
    method: 'DELETE',
  });

// ============ ADMIN TASKS ===============

export const fetchAdminTasks = () => apiFetch('/admin/tasks');

export const createAdminTask = (task) =>
  apiFetch('/admin/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });

export const updateAdminTask = (id, data) =>
  apiFetch(`/admin/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteAdminTask = (id) =>
  apiFetch(`/admin/tasks/${id}`, {
    method: 'DELETE',
  });

// ============ TASKS ============

// ============ CALENDARIO GENERAL ============
export const fetchAllCalendarTasks = () => apiFetch('/tasks/all');

export const fetchTasks = () => apiFetch('/tasks');

export const createTask = (task) =>
  apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });

export const updateTask = (id, data) =>
  apiFetch(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteTask = (id) =>
  apiFetch(`/tasks/${id}`, {
    method: 'DELETE',
  });

// ============ MESSAGES ============

export const fetchMessages = () => apiFetch('/messages');

export const createMessage = (message) =>
  apiFetch('/messages', {
    method: 'POST',
    body: JSON.stringify(message),
  });
