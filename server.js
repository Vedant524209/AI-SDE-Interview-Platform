const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

// Check connection
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT 1 as test');
    res.json({ message: 'Database connection successful', data: rows });
  } catch (error) {
    console.error('Error connecting to database:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// Create tables if they don't exist
async function initializeDatabase() {
  try {
    // Create users table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create auth_logs table for tracking login activity
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS auth_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        email VARCHAR(255) NOT NULL,
        action VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Database initialized, tables created if they did not exist');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize database
initializeDatabase();

// Log authentication activity
async function logAuthActivity(email, action, status, userId = null, req) {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    await promisePool.query(
      'INSERT INTO auth_logs (user_id, email, action, status, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, action, status, ipAddress, userAgent]
    );
    
    console.log(`Auth log created: ${action} - ${status} for ${email}`);
  } catch (error) {
    console.error('Error logging auth activity:', error);
  }
}

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      await logAuthActivity(email || 'unknown', 'SIGNUP', 'FAILED_VALIDATION', null, req);
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if user already exists
    const [existingUsers] = await promisePool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (existingUsers.length > 0) {
      await logAuthActivity(email, 'SIGNUP', 'USER_EXISTS', null, req);
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user
    const [result] = await promisePool.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    
    const userId = result.insertId;
    await logAuthActivity(email, 'SIGNUP', 'SUCCESS', userId, req);
    
    res.status(201).json({ 
      message: 'User created successfully', 
      userId: userId 
    });
  } catch (error) {
    console.error('Error in signup:', error);
    await logAuthActivity(req.body.email || 'unknown', 'SIGNUP', 'ERROR', null, req);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      await logAuthActivity(email || 'unknown', 'LOGIN', 'FAILED_VALIDATION', null, req);
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const [users] = await promisePool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (users.length === 0) {
      await logAuthActivity(email, 'LOGIN', 'INVALID_CREDENTIALS', null, req);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      await logAuthActivity(email, 'LOGIN', 'INVALID_CREDENTIALS', user.id, req);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    await logAuthActivity(email, 'LOGIN', 'SUCCESS', user.id, req);
    
    // Return success (in real app, would generate JWT token here)
    res.json({ 
      message: 'Login successful', 
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Error in login:', error);
    await logAuthActivity(req.body.email || 'unknown', 'LOGIN', 'ERROR', null, req);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// Get auth logs endpoint (protected, would require authentication in a real app)
app.get('/api/auth-logs', async (req, res) => {
  try {
    const [logs] = await promisePool.query(`
      SELECT logs.*, users.email as user_email 
      FROM auth_logs logs
      LEFT JOIN users ON logs.user_id = users.id
      ORDER BY logs.created_at DESC
      LIMIT 100
    `);
    
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching auth logs:', error);
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 