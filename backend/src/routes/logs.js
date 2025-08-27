const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get BIND9 logs (simulated for demo)
router.get('/bind9', requireAdmin, async (req, res) => {
  try {
    const { lines = 100, search = '' } = req.query;
    const maxLines = Math.min(parseInt(lines) || 100, 1000);
    
    // Generate sample BIND9 logs for demonstration
    const sampleLogs = generateSampleBind9Logs(maxLines);
    
    // Filter logs if search term provided
    let filteredLogs = sampleLogs;
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filteredLogs = sampleLogs.filter(log => 
        log.message.toLowerCase().includes(searchTerm)
      );
    }
    
    res.json({
      logs: filteredLogs.reverse(), // Show newest first
      total: filteredLogs.length,
      search: search || null
    });
    
  } catch (error) {
    console.error('Error fetching BIND9 logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch BIND9 logs',
      details: error.message 
    });
  }
});

// Get application logs (simulated)
router.get('/application', requireAdmin, async (req, res) => {
  try {
    const { lines = 100, search = '' } = req.query;
    const maxLines = Math.min(parseInt(lines) || 100, 1000);
    
    // Generate sample application logs
    const sampleLogs = generateSampleApplicationLogs(maxLines);
    
    // Filter logs if search term provided
    let filteredLogs = sampleLogs;
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filteredLogs = sampleLogs.filter(log => 
        log.message.toLowerCase().includes(searchTerm)
      );
    }
    
    res.json({
      logs: filteredLogs.reverse(),
      total: filteredLogs.length,
      search: search || null
    });
    
  } catch (error) {
    console.error('Error fetching application logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch application logs',
      details: error.message 
    });
  }
});

// Get system logs (simulated)
router.get('/system', requireAdmin, async (req, res) => {
  try {
    const { lines = 100 } = req.query;
    const maxLines = Math.min(parseInt(lines) || 100, 1000);
    
    // Generate sample system logs
    const sampleLogs = generateSampleSystemLogs(maxLines);
    
    res.json({
      logs: sampleLogs.reverse(),
      total: sampleLogs.length
    });
    
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch system logs',
      details: error.message 
    });
  }
});

// Helper function to determine log level based on content
function getLogLevel(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('error') || lowerMessage.includes('failed') || lowerMessage.includes('critical')) {
    return 'error';
  } else if (lowerMessage.includes('warn') || lowerMessage.includes('warning')) {
    return 'warning';
  } else if (lowerMessage.includes('info') || lowerMessage.includes('started') || lowerMessage.includes('ready')) {
    return 'info';
  } else if (lowerMessage.includes('debug') || lowerMessage.includes('trace')) {
    return 'debug';
  } else {
    return 'info';
  }
}

// Generate sample BIND9 logs for demonstration
function generateSampleBind9Logs(count) {
  const logs = [];
  const now = new Date();
  
  const sampleMessages = [
    'named starting BIND 9.18.18-0ubuntu0.22.04.2-Ubuntu',
    'built with configure arguments',
    'running on Linux x86_64 5.15.0-91-generic',
    'compiled with OpenSSL version: OpenSSL 3.0.2',
    'running with OpenSSL version: OpenSSL 3.0.2',
    'compiled with libxml2 version: 2.9.13',
    'running with libxml2 version: 20913',
    'compiled with json-c version 0.15',
    'running with json-c version 0.15',
    'compiled with zlib version 1.2.11',
    'running with zlib version 1.2.11',
    'DNSSEC algorithms: RSASHA1, RSASHA256, RSASHA512, ECDSAP256SHA256, ECDSAP384SHA384',
    'DS algorithms: SHA-1, SHA-256, SHA-384',
    'HMAC algorithms: HMAC-MD5, HMAC-SHA1, HMAC-SHA224, HMAC-SHA256, HMAC-SHA384, HMAC-SHA512',
    'TKEY mode 2 support (Diffie-Hellman): yes',
    'using default UDP/IPv4 port range: [32768, 65535]',
    'using default UDP/IPv6 port range: [32768, 65535]',
    'listening on IPv4 interface lo, 127.0.0.1#53',
    'listening on IPv4 interface eth0, 172.18.0.2#53',
    'listening on IPv6 interface lo, ::1#53',
    'listening on IPv6 interface eth0, 2001:db8::2#53',
    'generating session key for dynamic DNS',
    'sizing zone task pool based on 6 zones',
    'all zones loaded',
    'running',
    'managed-keys-zone: Initializing automatic trust anchor management for zone \'.\'',
    'resolver priming query complete',
    'client @0x7f8b2c003470 172.18.0.1#56789 (example.com): query: example.com IN A + (172.18.0.2)',
    'client @0x7f8b2c003470 172.18.0.1#56789 (example.com): sending response: success',
    'client @0x7f8b2c003470 172.18.0.1#45678 (test.local): query: test.local IN A + (172.18.0.2)',
    'client @0x7f8b2c003470 172.18.0.1#45678 (test.local): sending response: success',
  ];
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - (count - i) * 1000);
    const message = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    
    logs.push({
      id: i,
      timestamp: timestamp.toISOString(),
      message: `27-Aug-2025 ${timestamp.toTimeString().split(' ')[0]}.${String(timestamp.getMilliseconds()).padStart(3, '0')} ${message}`,
      level: getLogLevel(message),
      raw: `${timestamp.toISOString()} 27-Aug-2025 ${timestamp.toTimeString().split(' ')[0]}.${String(timestamp.getMilliseconds()).padStart(3, '0')} ${message}`
    });
  }
  
  return logs;
}

// Generate sample application logs
function generateSampleApplicationLogs(count) {
  const logs = [];
  const now = new Date();
  
  const sampleMessages = [
    'Server running on port 3001',
    'Environment: production',
    'BIND9 Config Path: /app/bind9/config',
    'BIND9 Records Path: /app/bind9/records',
    'GET /api/auth/setup-required 200 - 5ms',
    'POST /api/auth/login 200 - 125ms',
    'GET /api/config/files 200 - 12ms',
    'GET /api/records/zones 200 - 8ms',
    'PUT /api/config/files/named.conf 200 - 45ms',
    'POST /api/records/zones 201 - 78ms',
    'Configuration file backed up: named.conf.backup.1693140234567',
    'Zone file created: test.local',
    'Authentication successful for user: admin',
    'Token refreshed for user: admin',
    'Config validation completed successfully',
    'Warning: Large configuration file detected',
    'Info: Auto-backup completed',
    'Error: Failed to read configuration file - permission denied',
    'Debug: Processing DNS record: A test.local 192.168.1.10',
  ];
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - (count - i) * 2000);
    const message = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    
    logs.push({
      id: i,
      timestamp: timestamp.toISOString(),
      message: message,
      level: getLogLevel(message),
      raw: `${timestamp.toISOString()} ${message}`
    });
  }
  
  return logs;
}

// Generate sample system logs
function generateSampleSystemLogs(count) {
  const logs = [];
  const now = new Date();
  const services = ['bind9-dns', 'dns-ui-backend', 'dns-ui-frontend'];
  
  const sampleMessages = {
    'bind9-dns': [
      'started with pid 1',
      'listening on port 53',
      'zone loaded: test.local',
      'client query: test.local A',
      'resolver query timeout',
    ],
    'dns-ui-backend': [
      'HTTP server started on port 3001',
      'Database connection established',
      'API request processed',
      'Authentication middleware executed',
      'Configuration file updated',
    ],
    'dns-ui-frontend': [
      'Nginx started',
      'Static files served',
      'WebSocket connection established',
      'Client connected from 192.168.1.100',
      'Health check passed',
    ]
  };
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - (count - i) * 3000);
    const service = services[Math.floor(Math.random() * services.length)];
    const messages = sampleMessages[service];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    logs.push({
      id: i,
      service: service,
      timestamp: timestamp.toISOString(),
      message: message,
      level: getLogLevel(message),
      raw: `${service} | ${timestamp.toISOString()} ${message}`
    });
  }
  
  return logs;
}

module.exports = router;
