const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs-extra');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const USERS_FILE = path.join(process.env.DATA_PATH || '/app/data', 'users.json');

// Ensure users file exists
async function ensureUsersFile() {
  try {
    await fs.ensureFile(USERS_FILE);
    const data = await fs.readFile(USERS_FILE, 'utf8');
    if (!data.trim()) {
      await fs.writeJson(USERS_FILE, { users: [] }, { spaces: 2 });
    }
  } catch (error) {
    console.error('Error ensuring users file:', error);
    await fs.writeJson(USERS_FILE, { users: [] }, { spaces: 2 });
  }
}

// Initialize users file on startup
ensureUsersFile();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user still exists
    const usersData = await fs.readJson(USERS_FILE);
    const user = usersData.users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  JWT_SECRET,
  USERS_FILE
};
