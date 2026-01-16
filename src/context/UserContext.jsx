// src/context/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchUsers,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
} from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        try {
          const data = await fetchUsers();
          setUsers(data);
        } catch (e) {
          console.error('Error cargando usuarios', e);
          // Si el token es inválido, desloguear
          if (e.message.includes('401') || e.message.includes('403')) {
            logout();
          }
        }
      }
      setLoading(false);
    };
    loadData();
  }, [currentUser]);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    setCurrentUser(data.user);
    // La lista de usuarios se recargará en el useEffect
  };

  const register = async (name, email, password) => {
    // No se loguea al usuario, solo se registra.
    // El usuario deberá iniciar sesión después.
    await registerUser({ name, email, password });
  };

  const logout = () => {
    logoutUser();
    setCurrentUser(null);
    setUsers([]); // Limpiar la lista de usuarios
  };

  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        loading,
        login,
        register,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
