import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import { subscribeToPushNotifications } from '../utils/pushNotifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      subscribeToPushNotifications().catch(err => console.warn(err));
    }
  }, [user]);

  const signIn = async (payload) => {
    const data = await authService.login(payload);
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, signIn, logout, isAuthed: Boolean(user) }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
