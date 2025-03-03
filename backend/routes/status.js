/**
 * Status Routes
 * 
 * This module provides routes for checking the status of the application,
 * including database connection status.
 */

const express = require('express');
const { getDatabaseStatus, createDatabaseStatusHtml } = require('../utils/dbStatus');

const router = express.Router();

/**
 * GET /api/status - Get application status
 * 
 * Returns the status of the application, including database connection status.
 */
router.get('/', async (req, res) => {
  try {
    const dbStatus = await getDatabaseStatus();
    
    const status = {
      application: {
        name: 'SAP Solution Advisor',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      },
      database: dbStatus,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        }
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(status);
  } catch (error) {
    console.error('Error getting application status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/status/db - Get database status
 * 
 * Returns the status of the database connection.
 */
router.get('/db', async (req, res) => {
  try {
    const dbStatus = await getDatabaseStatus();
    res.json(dbStatus);
  } catch (error) {
    console.error('Error getting database status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/status/db/html - Get database status as HTML
 * 
 * Returns an HTML page showing the status of the database connection.
 */
router.get('/db/html', async (req, res) => {
  try {
    const html = await createDatabaseStatusHtml();
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error getting database status HTML:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
