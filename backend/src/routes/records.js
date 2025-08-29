const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { body, validationResult, param } = require('express-validator');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const BIND9_RECORDS_PATH = process.env.BIND9_RECORDS_PATH || '/app/bind9/records';

// Get list of zone files
router.get('/zones', async (req, res) => {
  try {
    await fs.ensureDir(BIND9_RECORDS_PATH);
    const files = await fs.readdir(BIND9_RECORDS_PATH);
    const zoneFiles = files.filter(file => {
      // Skip hidden files and directories
      if (file.startsWith('.')) return false;
      
      // Skip backup files
      if (file.includes('.backup.') || file.includes('.deleted.')) return false;
      
      // Check if it's a file (not directory)
      const filePath = path.join(BIND9_RECORDS_PATH, file);
      try {
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) return false;
      } catch (e) {
        return false;
      }
      
      // Include common DNS zone file patterns
      return file.startsWith('db.') || 
             file.endsWith('.zone') ||
             file.includes('.db') ||
             file.includes('.local') ||
             file.includes('.com') ||
             file.includes('.org') ||
             file.includes('.net') ||
             /^[a-zA-Z0-9.-]+$/.test(file); // Allow domain-like names
    });

    const zoneList = await Promise.all(
      zoneFiles.map(async (file) => {
        const filePath = path.join(BIND9_RECORDS_PATH, file);
        const stats = await fs.stat(filePath);
        
        // Try to extract zone name from filename
        let zoneName = file;
        if (file.startsWith('db.')) {
          zoneName = file.substring(3);
        } else if (file.endsWith('.zone')) {
          zoneName = file.substring(0, file.length - 5);
        }
        
        return {
          name: file,
          zoneName,
          path: file,
          size: stats.size,
          modified: stats.mtime
        };
      })
    );

    res.json({ zones: zoneList });
  } catch (error) {
    console.error('Error reading zone files:', error);
    res.status(500).json({ error: 'Failed to read zone files' });
  }
});

// Get specific zone file content with parsed records
router.get('/zones/:filename', [
  param('filename').matches(/^[a-zA-Z0-9._-]+$/).withMessage('Invalid filename')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { filename } = req.params;
    const filePath = path.join(BIND9_RECORDS_PATH, filename);
    
    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Zone file not found' });
    }

    const content = await fs.readFile(filePath, 'utf8');
    const stats = await fs.stat(filePath);
    
    // Parse DNS records
    const records = parseZoneFile(content);

    res.json({
      filename,
      content,
      records,
      size: stats.size,
      modified: stats.mtime
    });
  } catch (error) {
    console.error('Error reading zone file:', error);
    res.status(500).json({ error: 'Failed to read zone file' });
  }
});

// Update zone file
router.put('/zones/:filename', requireAdmin, [
  param('filename').matches(/^[a-zA-Z0-9._-]+$/).withMessage('Invalid filename'),
  body('content').isString().withMessage('Content must be a string')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { filename } = req.params;
    const { content } = req.body;
    const filePath = path.join(BIND9_RECORDS_PATH, filename);
    
    // Create backup before modifying
    const backupPath = path.join(BIND9_RECORDS_PATH, `${filename}.backup.${Date.now()}`);
    if (await fs.pathExists(filePath)) {
      await fs.copy(filePath, backupPath);
    }

    // Validate zone file format
    const validation = validateZoneFile(content);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid zone file format', 
        details: validation.errors 
      });
    }

    // Write new content
    await fs.writeFile(filePath, content, 'utf8');
    
    // Get updated file stats
    const stats = await fs.stat(filePath);
    const records = parseZoneFile(content);

    res.json({
      message: 'Zone file updated successfully',
      filename,
      records,
      size: stats.size,
      modified: stats.mtime,
      backup: path.basename(backupPath)
    });
  } catch (error) {
    console.error('Error updating zone file:', error);
    res.status(500).json({ error: 'Failed to update zone file' });
  }
});

// Create new zone file
router.post('/zones', requireAdmin, [
  body('filename')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Invalid filename'),
  body('zoneName')
    .matches(/^[a-zA-Z0-9.-]+$/)
    .withMessage('Invalid zone name'),
  body('adminEmail')
    .isEmail()
    .withMessage('Invalid admin email'),
  body('ttl')
    .optional()
    .isInt({ min: 60, max: 2147483647 })
    .withMessage('TTL must be between 60 and 2147483647')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { filename, zoneName, adminEmail, ttl = 86400 } = req.body;
    const filePath = path.join(BIND9_RECORDS_PATH, filename);
    
    // Check if file already exists
    if (await fs.pathExists(filePath)) {
      return res.status(409).json({ error: 'Zone file already exists' });
    }

    // Generate basic zone file template
    const serial = Math.floor(Date.now() / 1000);
    const adminEmailFormatted = adminEmail.replace('@', '.');
    
    const zoneTemplate = `$TTL ${ttl}
@       IN      SOA     ${zoneName}. ${adminEmailFormatted}. (
                        ${serial}       ; Serial
                        3600            ; Refresh
                        1800            ; Retry
                        1209600         ; Expire
                        86400 )         ; Minimum TTL

; Name servers
@       IN      NS      ns1.${zoneName}.
@       IN      NS      ns2.${zoneName}.

; A records
@       IN      A       192.168.1.10
ns1     IN      A       192.168.1.10
ns2     IN      A       192.168.1.11
www     IN      A       192.168.1.10

; CNAME records
mail    IN      CNAME   @
ftp     IN      CNAME   @
`;

    // Write new zone file
    await fs.writeFile(filePath, zoneTemplate, 'utf8');
    
    // Get file stats
    const stats = await fs.stat(filePath);
    const records = parseZoneFile(zoneTemplate);

    res.status(201).json({
      message: 'Zone file created successfully',
      filename,
      zoneName,
      records,
      size: stats.size,
      modified: stats.mtime
    });
  } catch (error) {
    console.error('Error creating zone file:', error);
    res.status(500).json({ error: 'Failed to create zone file' });
  }
});

// Delete zone file
router.delete('/zones/:filename', requireAdmin, [
  param('filename').matches(/^[a-zA-Z0-9._-]+$/).withMessage('Invalid filename')
], async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(BIND9_RECORDS_PATH, filename);
    
    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Zone file not found' });
    }

    // Create backup before deletion
    const backupPath = path.join(BIND9_RECORDS_PATH, `${filename}.deleted.${Date.now()}`);
    await fs.copy(filePath, backupPath);
    
    // Delete file
    await fs.remove(filePath);

    res.json({
      message: 'Zone file deleted successfully',
      filename,
      backup: path.basename(backupPath)
    });
  } catch (error) {
    console.error('Error deleting zone file:', error);
    res.status(500).json({ error: 'Failed to delete zone file' });
  }
});

// Get zone file history (backups)
router.get('/zones/:filename/history', [
  param('filename').matches(/^[a-zA-Z0-9._-]+$/).withMessage('Invalid filename')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { filename } = req.params;
    
    const files = await fs.readdir(BIND9_RECORDS_PATH);
    const backupFiles = files.filter(file => 
      file.startsWith(`${filename}.backup.`) || 
      file.startsWith(`${filename}.deleted.`)
    );

    const history = await Promise.all(
      backupFiles.map(async (file) => {
        const filePath = path.join(BIND9_RECORDS_PATH, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract timestamp from filename
        const timestampMatch = file.match(/\.(backup|deleted)\.(\d+)$/);
        const timestamp = timestampMatch ? parseInt(timestampMatch[2]) : stats.mtime.getTime();
        
        return {
          filename: file,
          originalName: filename,
          content,
          size: stats.size,
          timestamp: new Date(timestamp),
          type: file.includes('.deleted.') ? 'deleted' : 'backup',
          records: parseZoneFile(content)
        };
      })
    );

    // Sort by timestamp (newest first)
    history.sort((a, b) => b.timestamp - a.timestamp);

    res.json({ history });
  } catch (error) {
    console.error('Error reading zone file history:', error);
    res.status(500).json({ error: 'Failed to read zone file history' });
  }
});

// Helper function to parse zone file into structured records
function parseZoneFile(content) {
  const records = [];
  const lines = content.split('\n');
  let currentTTL = 86400;
  let currentOrigin = '@';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith(';') || line.startsWith('//')) {
      continue;
    }
    
    // Handle $TTL directive
    if (line.startsWith('$TTL')) {
      const match = line.match(/\$TTL\s+(\d+)/);
      if (match) {
        currentTTL = parseInt(match[1]);
      }
      continue;
    }
    
    // Handle $ORIGIN directive
    if (line.startsWith('$ORIGIN')) {
      const match = line.match(/\$ORIGIN\s+(\S+)/);
      if (match) {
        currentOrigin = match[1];
      }
      continue;
    }
    
    // Parse DNS records
    const recordMatch = line.match(/^(\S+)?\s+(?:(\d+)\s+)?(?:IN\s+)?(\S+)\s+(.+)$/);
    if (recordMatch) {
      const [, name, ttl, type, value] = recordMatch;
      
      records.push({
        name: name || '@',
        ttl: ttl ? parseInt(ttl) : currentTTL,
        class: 'IN',
        type: type.toUpperCase(),
        value: value.trim(),
        line: i + 1
      });
    }
  }
  
  return records;
}

// Helper function to validate zone file format
function validateZoneFile(content) {
  const errors = [];
  const lines = content.split('\n');
  let hasSOA = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;
    
    if (!line || line.startsWith(';') || line.startsWith('//')) {
      continue;
    }
    
    // Check for SOA record
    if (line.includes('SOA')) {
      hasSOA = true;
    }
    
    // Basic syntax validation
    if (line.includes('IN') && !line.match(/\s+IN\s+/)) {
      errors.push(`Line ${lineNumber}: Invalid record class format`);
    }
    
    // Check for valid record types
    const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'];
    const typeMatch = line.match(/\s+IN\s+(\S+)\s+/);
    if (typeMatch && !recordTypes.includes(typeMatch[1].toUpperCase())) {
      errors.push(`Line ${lineNumber}: Unknown record type '${typeMatch[1]}'`);
    }
  }
  
  if (!hasSOA) {
    errors.push('Zone file must contain an SOA record');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = router;
