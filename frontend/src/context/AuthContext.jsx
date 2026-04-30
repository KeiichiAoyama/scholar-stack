/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const MOCK_USERS = {
  dosen01: { password: 'password', name: 'Dr. Erick Fernando, S.Kom, M.S.I', role: 'Lecturer', sintaId: '207171' },
  admin01: { password: 'password', name: 'Admin UMN', role: 'Admin', sintaId: null },
};

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

  function login(username, password) {
    const found = MOCK_USERS[username];
    if (!found || found.password !== password) {
      return false;
    }
    const userData = { username, name: found.name, role: found.role, sintaId: found.sintaId };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('scholarstack_user', JSON.stringify(userData));
    return true;
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
