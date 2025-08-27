import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if setup is required
      const setupResponse = await api.get('/auth/setup-required');
      if (setupResponse.data.setupRequired) {
        setSetupRequired(true);
        setLoading(false);
        return;
      }

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token and get user info
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      setSetupRequired(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      setSetupRequired(false);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const setup = async (setupData) => {
    try {
      const response = await api.post('/auth/setup', setupData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      setSetupRequired(false);
      
      return { success: true };
    } catch (error) {
      console.error('Setup failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Setup failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      localStorage.setItem('token', token);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    loading,
    setupRequired,
    login,
    setup,
    logout,
    refreshToken,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
