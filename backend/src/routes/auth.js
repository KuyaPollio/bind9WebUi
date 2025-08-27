const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fs = require('fs-extra');
const { randomUUID } = require('crypto');
const { JWT_SECRET, USERS_FILE, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Check if admin setup is required
router.get('/setup-required', async (req, res) => {
  try {
    const usersData = await fs.readJson(USERS_FILE);
    const hasAdmin = usersData.users.some(user => user.role === 'admin');
    res.json({ setupRequired: !hasAdmin });
  } catch (error) {
    console.error('Setup check error:', error);
    res.json({ setupRequired: true });
  }
});

// Setup initial admin account
router.post('/setup', [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
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

    const { username, password } = req.body;

    // Check if admin already exists
    const usersData = await fs.readJson(USERS_FILE);
    const hasAdmin = usersData.users.some(user => user.role === 'admin');
    
    if (hasAdmin) {
      return res.status(400).json({ error: 'Admin account already exists' });
    }

    // Check if username already exists
    const existingUser = usersData.users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const newUser = {
      id: randomUUID(),
      username,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    usersData.users.push(newUser);
    await fs.writeJson(USERS_FILE, usersData, { spaces: 2 });

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Failed to create admin account' });
  }
});

// Login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { username, password } = req.body;

    // Find user
    const usersData = await fs.readJson(USERS_FILE);
    const user = usersData.users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    await fs.writeJson(USERS_FILE, usersData, { spaces: 2 });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: req.user
  });
});

// Refresh token
router.post('/refresh', authenticateToken, (req, res) => {
  const token = jwt.sign(
    { userId: req.user.id, username: req.user.username, role: req.user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Token refreshed',
    token
  });
});

module.exports = router;
