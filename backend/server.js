const express = require('express');
const { Pool } = require('pg');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const EmailScanner = require('./emailScanner');
require('dotenv').config();

const app = express();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-in-production';
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(bodyParser.json());

// Database setup - PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database on startup
initializeDatabase();

// Initialize database tables
async function initializeDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        isAdmin BOOLEAN DEFAULT FALSE,
        approved BOOLEAN DEFAULT FALSE,
        hasSeenTutorial BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Team members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL,
        color VARCHAR(50) NOT NULL,
        addedBy INTEGER NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(addedBy) REFERENCES users(id)
      )
    `);

    // Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        createdBy INTEGER NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(createdBy) REFERENCES users(id)
      )
    `);

    // Subcategories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id SERIAL PRIMARY KEY,
        categoryId INTEGER NOT NULL,
        companyName VARCHAR(255) NOT NULL,
        description TEXT,
        assignedToUserId INTEGER,
        priority VARCHAR(50) DEFAULT 'low',
        progress VARCHAR(50) DEFAULT 'not-started',
        dueDate DATE NOT NULL,
        createdBy INTEGER NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(categoryId) REFERENCES categories(id),
        FOREIGN KEY(assignedToUserId) REFERENCES users(id),
        FOREIGN KEY(createdBy) REFERENCES users(id)
      )
    `);

    // Tasks/Calendar table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        subcategoryId INTEGER,
        createdBy INTEGER NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(subcategoryId) REFERENCES subcategories(id),
        FOREIGN KEY(createdBy) REFERENCES users(id)
      )
    `);

    // Email settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_settings (
        id SERIAL PRIMARY KEY,
        userId INTEGER UNIQUE NOT NULL,
        provider VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        appPassword TEXT NOT NULL,
        lastSync TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `);

    // Create default admin user
    const adminEmail = 'inaamimran07@gmail.com';
    const adminPassword = bcrypt.hashSync('Atg9341poL', 10);
    await pool.query(
      `INSERT INTO users (email, password, name, isAdmin, approved, hasSeenTutorial) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, adminPassword, 'Admin', true, true, true]
    );
    console.log('Default admin user ensured');

    // Create default categories
    const adminUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND isAdmin = TRUE LIMIT 1',
      [adminEmail]
    );
    const adminId = adminUser.rows[0]?.id;

    if (adminId) {
      await pool.query(
        `INSERT INTO categories (name, createdBy) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        ['Corporation Tax Returns', adminId]
      );
      await pool.query(
        `INSERT INTO categories (name, createdBy) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        ['Self Assessments', adminId]
      );
      await pool.query(
        `INSERT INTO categories (name, createdBy) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        ['Corporation Tax Return Emails', adminId]
      );
      await pool.query(
        `INSERT INTO categories (name, createdBy) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        ['Self Assessment Emails', adminId]
      );
      console.log('Default categories ensured');
    }

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.decode(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

// Routes

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.approved && !user.isadmin) {
      return res.status(403).json({ error: 'Your account is pending admin approval' });
    }

    const token = jwt.encode(
      { id: user.id, email: user.email, name: user.name, isAdmin: user.isadmin },
      SECRET_KEY
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isadmin,
        hasSeenTutorial: user.hasseentutorial
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Register (requires admin approval)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (email, password, name, isAdmin, approved) VALUES ($1, $2, $3, $4, $5)',
      [email, hashedPassword, name, false, false]
    );

    res.status(201).json({
      message: 'Account created! Waiting for admin approval.',
      pending: true
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(400).json({ error: 'Email already exists' });
  }
});

// Admin creates user
app.post('/api/users', authenticateToken, async (req, res) => {
  const { email, password, name } = req.body;

  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (email, password, name, isAdmin) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, name, false]
    );

    res.status(201).json({
      id: result.rows[0].id,
      email,
      name,
      isAdmin: false
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(400).json({ error: 'Email already exists' });
  }
});

// Get all team members
app.get('/api/team-members', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, tm.color FROM users u 
       LEFT JOIN team_members tm ON u.id = tm.userId 
       WHERE tm.id IS NOT NULL`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get team members error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Add team member (admin only)
app.post('/api/team-members', authenticateToken, async (req, res) => {
  const { userId, color } = req.body;

  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO team_members (userId, color, addedBy) VALUES ($1, $2, $3) RETURNING id',
      [userId, color, req.user.id]
    );
    res.status(201).json({ id: result.rows[0].id, userId, color });
  } catch (err) {
    console.error('Add team member error:', err);
    return res.status(400).json({ error: 'Error adding team member' });
  }
});

// Remove team member (admin only)
app.delete('/api/team-members/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    await pool.query('DELETE FROM team_members WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Remove team member error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get all categories
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY createdAt DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get categories error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Progress stats by category
app.get('/api/stats/progress', authenticateToken, async (req, res) => {
  const categoryNames = ['Corporation Tax Returns', 'Self Assessments'];

  try {
    const result = await pool.query(
      `SELECT c.name AS category, s.progress, COUNT(s.id) AS count
       FROM categories c
       LEFT JOIN subcategories s ON s.categoryId = c.id
       WHERE c.name IN ($1, $2)
       GROUP BY c.name, s.progress`,
      categoryNames
    );

    const statsResult = {};
    categoryNames.forEach((name) => {
      statsResult[name] = {
        completed: 0,
        completedNotSubmitted: 0,
        inProgress: 0,
        notStarted: 0
      };
    });

    result.rows.forEach((row) => {
      const bucket = statsResult[row.category];
      if (!bucket) return;

      if (row.progress === 'completed') {
        bucket.completed = parseInt(row.count);
      } else if (row.progress === 'completed-not-submitted') {
        bucket.completedNotSubmitted = parseInt(row.count);
      } else if (row.progress === 'in-progress') {
        bucket.inProgress = parseInt(row.count);
      } else {
        bucket.notStarted = parseInt(row.count);
      }
    });

    res.json(statsResult);
  } catch (err) {
    console.error('Get stats error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Create category (admin only)
app.post('/api/categories', authenticateToken, async (req, res) => {
  const { name } = req.body;

  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Category name required' });
  }

  db.run(
    'INSERT INTO categories (name, createdBy) VALUES (?, ?)',
    [name, req.user.id],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Error creating category' });
      }
      res.status(201).json({ id: this.lastID, name, createdBy: req.user.id });
    }
  );
});

// Delete category (admin only)
app.delete('/api/categories/:id', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.run('DELETE FROM categories WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Get subcategories for a category
app.get('/api/categories/:id/subcategories', authenticateToken, (req, res) => {
  const { filterByUser } = req.query;
  const categoryId = req.params.id;

  let query = `
    SELECT s.*, u2.name AS assignedToName, tm2.color AS assignedToColor
    FROM subcategories s
    LEFT JOIN users u2 ON s.assignedToUserId = u2.id
    LEFT JOIN team_members tm2 ON u2.id = tm2.userId
    WHERE s.categoryId = ?`;
  let params = [categoryId];

  if (filterByUser === 'true') {
    query += ` AND s.createdBy = ?`;
    params.push(req.user.id);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Calculate priority based on due date
    const now = new Date();
    const updatedRows = rows.map(row => {
      const dueDate = new Date(row.dueDate);
      const monthsDiff = (dueDate.getFullYear() - now.getFullYear()) * 12 + 
                         (dueDate.getMonth() - now.getMonth());

      let autoPriority;
      if (monthsDiff <= 2) {
        autoPriority = 'high';
      } else if (monthsDiff <= 4) {
        autoPriority = 'medium';
      } else {
        autoPriority = 'low';
      }

      return { ...row, autoPriority };
    });

    res.json(updatedRows);
  });
});

// Create subcategory
app.post('/api/subcategories', authenticateToken, (req, res) => {
  const { categoryId, companyName, description, assignedToUserId, priority, progress, dueDate } = req.body;

  if (!categoryId || !companyName || !dueDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO subcategories (categoryId, companyName, description, assignedToUserId, priority, progress, dueDate, createdBy) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, companyName, description || '', assignedToUserId || null, priority || 'low', progress || 'not-started', dueDate, req.user.id],
    function(err) {
      if (err) {
        console.error('Error creating subcategory:', err);
        return res.status(400).json({ error: 'Error creating subcategory: ' + err.message });
      }
      res.status(201).json({ 
        id: this.lastID, 
        categoryId, 
        companyName,
        description,
        assignedToUserId,
        priority, 
        progress, 
        dueDate, 
        createdBy: req.user.id 
      });
    }
  );
});

// Update subcategory
app.put('/api/subcategories/:id', authenticateToken, (req, res) => {
  const { priority, progress, description, assignedToUserId, companyName, dueDate } = req.body;

  if (!priority && !progress && description === undefined && assignedToUserId === undefined && !companyName && !dueDate) {
    return res.status(400).json({ error: 'At least one field required' });
  }

  let query = 'UPDATE subcategories SET ';
  const params = [];

  if (priority) {
    query += 'priority = ?, ';
    params.push(priority);
  }

  if (progress) {
    query += 'progress = ?, ';
    params.push(progress);
  }

  if (description !== undefined) {
    query += 'description = ?, ';
    params.push(description);
  }

  if (assignedToUserId !== undefined) {
    query += 'assignedToUserId = ?, ';
    params.push(assignedToUserId || null);
  }

  if (companyName) {
    query += 'companyName = ?, ';
    params.push(companyName);
  }

  if (dueDate) {
    query += 'dueDate = ?, ';
    params.push(dueDate);
  }

  query = query.slice(0, -2);
  query += ' WHERE id = ?';
  params.push(req.params.id);

  db.run(query, params, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Delete subcategory (user can delete own, admin can delete any)
app.delete('/api/subcategories/:id', authenticateToken, (req, res) => {
  // First, get the subcategory to check if user is the creator
  db.get('SELECT createdBy FROM subcategories WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Allow deletion if user is admin or if they created it
    if (!req.user.isAdmin && row.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own subcategories' });
    }

    db.run('DELETE FROM subcategories WHERE id = ?', [req.params.id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    });
  });
});

// Get tasks for a date
app.get('/api/tasks', authenticateToken, (req, res) => {
  const { date, filterByUser } = req.query;

  let query = 'SELECT * FROM tasks';
  const params = [];

  if (date) {
    query += ' WHERE date = ?';
    params.push(date);
  }

  if (filterByUser === 'true') {
    query += date ? ' AND' : ' WHERE';
    query += ' createdBy = ?';
    params.push(req.user.id);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create task
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, date, subcategoryId } = req.body;

  if (!title || !date) {
    return res.status(400).json({ error: 'Title and date required' });
  }

  db.run(
    'INSERT INTO tasks (title, date, subcategoryId, createdBy) VALUES (?, ?, ?, ?)',
    [title, date, subcategoryId || null, req.user.id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Error creating task' });
      }
      res.status(201).json({ 
        id: this.lastID, 
        title, 
        date, 
        subcategoryId, 
        createdBy: req.user.id 
      });
    }
  );
});

// Get all users (for team member selection)
app.get('/api/users', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  db.all(
    `SELECT id, name, email, isAdmin, approved FROM users WHERE isAdmin = 0 
     AND id NOT IN (SELECT userId FROM team_members)`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Get pending users (admin only)
app.get('/api/users/pending', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all(
    'SELECT id, name, email, createdAt FROM users WHERE approved = 0 AND isAdmin = 0',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Approve user (admin only)
app.post('/api/users/:id/approve', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.run(
    'UPDATE users SET approved = 1 WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

// Reject/delete user (admin only)
app.delete('/api/users/:id', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.run('DELETE FROM users WHERE id = ? AND isAdmin = 0', [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Get all users (for adding to team)
app.get('/api/users', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all(
    `SELECT id, name, email FROM users WHERE isAdmin = 0 
     AND id NOT IN (SELECT userId FROM team_members)`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Mark tutorial as seen
app.post('/api/users/tutorial-seen', authenticateToken, (req, res) => {
  db.run(
    'UPDATE users SET hasSeenTutorial = 1 WHERE id = ?',
    [req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

// Email Settings Routes
app.get('/api/email-settings', authenticateToken, (req, res) => {
  db.get(
    'SELECT provider, email, lastSync FROM email_settings WHERE userId = ?',
    [req.user.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(row || null);
    }
  );
});

app.post('/api/email-settings', authenticateToken, (req, res) => {
  const { provider, email, appPassword } = req.body;

  if (!provider || !email || !appPassword) {
    return res.status(400).json({ error: 'All fields required' });
  }

  // Simple encryption (in production, use proper encryption)
  const encryptedPassword = Buffer.from(appPassword).toString('base64');

  db.run(
    `INSERT OR REPLACE INTO email_settings (userId, provider, email, appPassword) 
     VALUES (?, ?, ?, ?)`,
    [req.user.id, provider, email, encryptedPassword],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/email-settings', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM email_settings WHERE userId = ?',
    [req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

// Initialize email scanner
const emailScanner = new EmailScanner(DB_PATH);

// Manual endpoint to create email categories
app.post('/api/create-email-categories', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.get('SELECT id FROM categories WHERE name = ?', ['Corporation Tax Return Emails'], (err, row) => {
    if (!row) {
      db.run('INSERT INTO categories (name, createdBy) VALUES (?, ?)', 
        ['Corporation Tax Return Emails', req.user.id], (err) => {
          if (err) console.error('Error creating Corp Tax category:', err);
        });
    }
  });

  db.get('SELECT id FROM categories WHERE name = ?', ['Self Assessment Emails'], (err, row) => {
    if (!row) {
      db.run('INSERT INTO categories (name, createdBy) VALUES (?, ?)', 
        ['Self Assessment Emails', req.user.id], (err) => {
          if (err) console.error('Error creating Self Assessment category:', err);
          else res.json({ success: true, message: 'Email categories created' });
        });
    } else {
      res.json({ success: true, message: 'Categories already exist' });
    }
  });
});

// Manual scan trigger endpoint
app.post('/api/scan-emails', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    console.log('🔄 Manual email scan triggered by admin');
    await emailScanner.scanAllUsers();
    res.json({ success: true, message: 'Email scan completed' });
  } catch (error) {
    console.error('Manual scan error:', error);
    res.status(500).json({ error: 'Scan failed: ' + error.message });
  }
});

// Scan emails every 5 minutes
const SCAN_INTERVAL = 5 * 60 * 1000; // 5 minutes
setInterval(async () => {
  try {
    await emailScanner.scanAllUsers();
  } catch (error) {
    console.error('Email scan error:', error);
  }
}, SCAN_INTERVAL);

// Initial scan on startup (after 10 seconds to let server start)
setTimeout(async () => {
  console.log('🚀 Starting initial email scan...');
  try {
    await emailScanner.scanAllUsers();
  } catch (error) {
    console.error('Initial email scan error:', error);
  }
}, 10000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email scanner active - checking every ${SCAN_INTERVAL / 60000} minutes`);
});
