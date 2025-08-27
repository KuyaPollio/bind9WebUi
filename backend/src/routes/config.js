const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const BIND9_CONFIG_PATH = process.env.BIND9_CONFIG_PATH || '/app/bind9/config';

// Get list of configuration files
router.get('/files', async (req, res) => {
  try {
    const files = await fs.readdir(BIND9_CONFIG_PATH);
    const configFiles = files.filter(file => 
      file.endsWith('.conf') || 
      file.endsWith('.zone') ||
      file.startsWith('named.') ||
      file.startsWith('db.')
    );

    const fileList = await Promise.all(
      configFiles.map(async (file) => {
        const filePath = path.join(BIND9_CONFIG_PATH, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: file,
          size: stats.size,
          modified: stats.mtime,
          type: file.endsWith('.conf') ? 'config' : 'zone'
        };
      })
    );

    res.json({ files: fileList });
  } catch (error) {
    console.error('Error reading config files:', error);
    res.status(500).json({ error: 'Failed to read configuration files' });
  }
});

// Get specific configuration file content
router.get('/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(BIND9_CONFIG_PATH, filename);
    
    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = await fs.readFile(filePath, 'utf8');
    const stats = await fs.stat(filePath);

    res.json({
      filename,
      content,
      size: stats.size,
      modified: stats.mtime
    });
  } catch (error) {
    console.error('Error reading config file:', error);
    res.status(500).json({ error: 'Failed to read configuration file' });
  }
});

// Update configuration file
router.put('/files/:filename', requireAdmin, [
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
    
    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(BIND9_CONFIG_PATH, filename);
    
    // Create backup before modifying
    const backupPath = path.join(BIND9_CONFIG_PATH, `${filename}.backup.${Date.now()}`);
    if (await fs.pathExists(filePath)) {
      await fs.copy(filePath, backupPath);
    }

    // Write new content
    await fs.writeFile(filePath, content, 'utf8');
    
    // Get updated file stats
    const stats = await fs.stat(filePath);

    res.json({
      message: 'Configuration file updated successfully',
      filename,
      size: stats.size,
      modified: stats.mtime,
      backup: path.basename(backupPath)
    });
  } catch (error) {
    console.error('Error updating config file:', error);
    res.status(500).json({ error: 'Failed to update configuration file' });
  }
});

// Create new configuration file
router.post('/files', requireAdmin, [
  body('filename')
    .isString()
    .withMessage('Filename must be a string')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Filename contains invalid characters'),
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

    const { filename, content } = req.body;
    const filePath = path.join(BIND9_CONFIG_PATH, filename);
    
    // Check if file already exists
    if (await fs.pathExists(filePath)) {
      return res.status(409).json({ error: 'File already exists' });
    }

    // Write new file
    await fs.writeFile(filePath, content, 'utf8');
    
    // Get file stats
    const stats = await fs.stat(filePath);

    res.status(201).json({
      message: 'Configuration file created successfully',
      filename,
      size: stats.size,
      modified: stats.mtime
    });
  } catch (error) {
    console.error('Error creating config file:', error);
    res.status(500).json({ error: 'Failed to create configuration file' });
  }
});

// Delete configuration file
router.delete('/files/:filename', requireAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // Prevent deletion of critical files
    const criticalFiles = ['named.conf', 'named.conf.local', 'named.conf.default-zones'];
    if (criticalFiles.includes(filename)) {
      return res.status(400).json({ error: 'Cannot delete critical configuration files' });
    }

    const filePath = path.join(BIND9_CONFIG_PATH, filename);
    
    // Check if file exists
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Create backup before deletion
    const backupPath = path.join(BIND9_CONFIG_PATH, `${filename}.deleted.${Date.now()}`);
    await fs.copy(filePath, backupPath);
    
    // Delete file
    await fs.remove(filePath);

    res.json({
      message: 'Configuration file deleted successfully',
      filename,
      backup: path.basename(backupPath)
    });
  } catch (error) {
    console.error('Error deleting config file:', error);
    res.status(500).json({ error: 'Failed to delete configuration file' });
  }
});

// Get configuration validation status
router.post('/validate', requireAdmin, [
  body('content').isString().withMessage('Content must be a string')
], async (req, res) => {
  try {
    const { content } = req.body;
    
    // Basic BIND9 configuration validation
    const errors = [];
    const warnings = [];
    
    // Check for basic syntax issues
    const lines = content.split('\n');
    let braceCount = 0;
    let inQuotes = false;
    let inComment = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      let lineNumber = i + 1;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"' && !inComment) {
          inQuotes = !inQuotes;
        } else if (char === '/' && line[j + 1] === '/' && !inQuotes) {
          inComment = true;
          break;
        } else if (char === '/' && line[j - 1] === '*' && !inQuotes) {
          inComment = false;
        } else if (!inQuotes && !inComment) {
          if (char === '{') braceCount++;
          else if (char === '}') braceCount--;
        }
      }
      
      // Reset comment flag for single-line comments
      if (inComment && !line.includes('*/')) {
        inComment = false;
      }
      
      // Check for common issues
      if (line.endsWith(';') && line.includes('{')) {
        warnings.push(`Line ${lineNumber}: Opening brace and semicolon on same line`);
      }
    }
    
    if (braceCount !== 0) {
      errors.push(`Mismatched braces: ${braceCount > 0 ? 'missing closing' : 'missing opening'} brace(s)`);
    }
    
    if (inQuotes) {
      errors.push('Unclosed quoted string');
    }
    
    res.json({
      valid: errors.length === 0,
      errors,
      warnings
    });
  } catch (error) {
    console.error('Error validating config:', error);
    res.status(500).json({ error: 'Failed to validate configuration' });
  }
});

module.exports = router;
