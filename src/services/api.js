// src/services/api.js
const API_URL = 'http://localhost:3001/api';

// ============ AUTH ============

export const registerUser = async ({ name, email, password }) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al registrar');
  }
  return res.json();
};

export const loginUser = async ({ email, password }) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al iniciar sesión');
  }
  return res.json();
};

// ============ USERS ============

export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
};

// ============ TASKS ============

export const fetchTasks = async () => {
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) throw new Error('Error al obtener tareas');
  return res.json();
};

const getAuthHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const createTask = async (task, token) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Error al crear tarea');
  return res.json();
};

export const updateTask = async (id, data, token) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar tarea');
  return res.json();
};

export const deleteTask = async (id, token) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Error al borrar tarea');
};

// ============ MESSAGES ============

export const fetchMessages = async () => {
  const res = await fetch(`${API_URL}/messages`);
  if (!res.ok) throw new Error('Error al obtener mensajes');
  return res.json();
};

export const createMessage = async (message, token) => {
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error('Error al crear mensaje');
  return res.json();
};
