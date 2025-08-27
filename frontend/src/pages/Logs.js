import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  List,
  ListItem,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Refresh,
  Search,
  Clear,
  Download,
  PlayArrow,
  Pause,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Code as DebugIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { logsAPI } from '../services/api';

const LOG_LEVELS = {
  error: { color: 'error', icon: <ErrorIcon /> },
  warning: { color: 'warning', icon: <WarningIcon /> },
  info: { color: 'info', icon: <InfoIcon /> },
  debug: { color: 'default', icon: <DebugIcon /> },
};

const Logs = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lineCount, setLineCount] = useState(100);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const logsEndRef = useRef(null);

  const logTypes = [
    { label: 'BIND9 Server', value: 'bind9', api: logsAPI.getBind9Logs },
    { label: 'Application', value: 'application', api: logsAPI.getApplicationLogs },
    { label: 'System', value: 'system', api: logsAPI.getSystemLogs },
  ];

  useEffect(() => {
    loadLogs();
  }, [activeTab, lineCount]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadLogs(false); // Don't show loading spinner for auto-refresh
      }, 5000);
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const loadLogs = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const currentLogType = logTypes[activeTab];
      const params = {
        lines: lineCount,
        search: searchTerm.trim() || undefined,
      };

      const response = await currentLogType.api(params);
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('Failed to load logs');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSearch = () => {
    loadLogs();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setTimeout(() => loadLogs(), 100);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchTerm(''); // Clear search when switching tabs
  };

  const downloadLogs = () => {
    const logText = logs.map(log => {
      const timestamp = log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : 'N/A';
      const service = log.service ? `[${log.service}] ` : '';
      return `${timestamp} ${service}${log.message}`;
    }).join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${logTypes[activeTab].value}-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogLevelChip = (level) => {
    const levelConfig = LOG_LEVELS[level] || LOG_LEVELS.info;
    return (
      <Chip
        size="small"
        icon={levelConfig.icon}
        label={level.toUpperCase()}
        color={levelConfig.color}
        variant="outlined"
        sx={{ minWidth: 80 }}
      />
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return format(new Date(timestamp), 'MMM dd, HH:mm:ss.SSS');
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Server Logs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor BIND9 server, application, and system logs in real-time
          </Typography>
        </Box>
        
        <Box display="flex" gap={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto-refresh"
          />
          
          <Button
            variant="outlined"
            startIcon={autoRefresh ? <Pause /> : <PlayArrow />}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Pause' : 'Start'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => loadLogs()}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              {logTypes.map((type, index) => (
                <Tab key={type.value} label={type.label} />
              ))}
            </Tabs>
          </Box>

          {/* Controls */}
          <Grid container spacing={2} alignItems="center" mb={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search logs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <Box display="flex" gap={1}>
                      {searchTerm && (
                        <IconButton size="small" onClick={handleClearSearch}>
                          <Clear />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={handleSearch}>
                        <Search />
                      </IconButton>
                    </Box>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Lines</InputLabel>
                <Select
                  value={lineCount}
                  label="Lines"
                  onChange={(e) => setLineCount(e.target.value)}
                >
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={250}>250</MenuItem>
                  <MenuItem value={500}>500</MenuItem>
                  <MenuItem value={1000}>1000</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  {logs.length} log entries
                </Typography>
                
                <Tooltip title="Download logs">
                  <IconButton onClick={downloadLogs} disabled={logs.length === 0}>
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>

          {/* Logs Display */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <CircularProgress />
            </Box>
          ) : logs.length === 0 ? (
            <Alert severity="info">
              No logs found. {searchTerm && 'Try adjusting your search criteria or '}Check if the service is running.
            </Alert>
          ) : (
            <Paper 
              variant="outlined" 
              sx={{ 
                maxHeight: 600, 
                overflow: 'auto', 
                bgcolor: 'background.default',
                p: 1
              }}
            >
              <List dense>
                {logs.map((log) => (
                  <ListItem 
                    key={log.id} 
                    sx={{ 
                      display: 'block',
                      py: 0.5,
                      px: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Box sx={{ minWidth: 140 }}>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                          {formatTimestamp(log.timestamp)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ minWidth: 80 }}>
                        {getLogLevelChip(log.level)}
                      </Box>
                      
                      {log.service && (
                        <Box sx={{ minWidth: 100 }}>
                          <Chip
                            size="small"
                            label={log.service}
                            variant="outlined"
                            color="primary"
                          />
                        </Box>
                      )}
                      
                      <Box sx={{ flexGrow: 1, wordBreak: 'break-word' }}>
                        <Typography 
                          variant="body2" 
                          fontFamily="monospace"
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            color: log.level === 'error' ? 'error.main' : 
                                   log.level === 'warning' ? 'warning.main' : 'inherit'
                          }}
                        >
                          {log.message}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
                <div ref={logsEndRef} />
              </List>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Logs;
