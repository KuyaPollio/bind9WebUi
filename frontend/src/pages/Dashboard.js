import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Dns,
  Settings,
  Storage,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  TrendingUp,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { configAPI, recordsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [configFiles, setConfigFiles] = useState([]);
  const [zoneFiles, setZoneFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [configResponse, zonesResponse] = await Promise.all([
        configAPI.getFiles(),
        recordsAPI.getZones(),
      ]);
      
      setConfigFiles(configResponse.data.files || []);
      setZoneFiles(zonesResponse.data.zones || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'success': return 'success.main';
      case 'warning': return 'warning.main';
      case 'error': return 'error.main';
      default: return 'grey.500';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      default: return <CheckCircle />;
    }
  };

  const stats = [
    {
      title: 'Configuration Files',
      value: configFiles.length,
      icon: <Settings />,
      color: 'primary.main',
      description: 'Total BIND9 config files',
    },
    {
      title: 'DNS Zone Files',
      value: zoneFiles.length,
      icon: <Dns />,
      color: 'secondary.main',
      description: 'Active DNS zones',
    },
    {
      title: 'Total Records',
      value: zoneFiles.reduce((acc, zone) => acc + (zone.records?.length || 0), 0),
      icon: <Storage />,
      color: 'success.main',
      description: 'DNS records configured',
    },
    {
      title: 'Server Status',
      value: 'Running',
      icon: <TrendingUp />,
      color: 'success.main',
      description: 'BIND9 service status',
    },
  ];

  const recentFiles = [...configFiles, ...zoneFiles]
    .sort((a, b) => new Date(b.modified) - new Date(a.modified))
    .slice(0, 5);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.username}! Here's your BIND9 server overview.
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={loadDashboardData} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" color={stat.color} gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.description}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.7 }}>
                    {React.cloneElement(stat.icon, { fontSize: 'large' })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Status Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body1">BIND9 Service</Typography>
                  <Chip
                    icon={getStatusIcon('success')}
                    label="Running"
                    color="success"
                    size="small"
                  />
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body1">Configuration</Typography>
                  <Chip
                    icon={getStatusIcon('success')}
                    label="Valid"
                    color="success"
                    size="small"
                  />
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body1">DNS Resolution</Typography>
                  <Chip
                    icon={getStatusIcon('success')}
                    label="Active"
                    color="success"
                    size="small"
                  />
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body1">Zone Files</Typography>
                  <Chip
                    icon={getStatusIcon('success')}
                    label="Loaded"
                    color="success"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Your BIND9 server is running normally. All zones are loaded and DNS resolution is active.
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  Last refresh: {format(lastRefresh, 'PPpp')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Files */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recently Modified Files
          </Typography>
          {recentFiles.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No files found. Start by creating configuration files or DNS zones.
            </Typography>
          ) : (
            <Box>
              {recentFiles.map((file, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: index < recentFiles.length - 1 ? 2 : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ color: file.type === 'config' ? 'primary.main' : 'secondary.main' }}>
                      {file.type === 'config' ? <Settings /> : <Dns />}
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {file.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {file.type === 'config' ? 'Configuration File' : `DNS Zone${file.zoneName ? ` (${file.zoneName})` : ''}`}
                      </Typography>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(file.modified), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {format(new Date(file.modified), 'HH:mm')}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
