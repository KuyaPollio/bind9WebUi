import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import ConfigEditor from './pages/ConfigEditor';
import RecordManager from './pages/RecordManager';
import Logs from './pages/Logs';
import Help from './pages/Help';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading, setupRequired } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show setup page if no admin exists
  if (setupRequired) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Main application routes
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/config" element={<ConfigEditor />} />
        <Route path="/records" element={<RecordManager />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
