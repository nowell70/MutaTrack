import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { getCurrentUser, getStoredUsers, setCurrentUser } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password?: string, nama?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const existing = getCurrentUser();
    setUser(existing);
  }, []);

  const login = async (email: string, _password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      // Auto-register demo test user if email is valid
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return { success: false, error: 'Format email tidak valid.' };
      }
      const newUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        nama: cleanEmail.split('@')[0],
        role: 'user',
        created_at: new Date().toISOString(),
      };
      const updated = [...users, newUser];
      localStorage.setItem('mutatrack_users', JSON.stringify(updated));
      setCurrentUser(newUser);
      setUser(newUser);
      return { success: true };
    }

    setCurrentUser(found);
    setUser(found);
    return { success: true };
  };

  const register = async (email: string, _password?: string, nama?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Format email tidak valid.' };
    }
    const users = getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email sudah terdaftar.' };
    }

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      nama: nama?.trim() || cleanEmail.split('@')[0],
      role: 'user',
      created_at: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    localStorage.setItem('mutatrack_users', JSON.stringify(updated));
    setCurrentUser(newUser);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
