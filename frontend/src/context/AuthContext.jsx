/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

function getStoredUser() {
  const stored = localStorage.getItem('scholarstack_user');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem('scholarstack_user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredUser()));

  async function login(username, password) {
    const response = await api.post('/auth/login', { username, password });
    const userData = response.data;
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('scholarstack_user', JSON.stringify(userData));
    return userData;
  }

  function logout() {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('scholarstack_user');
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
