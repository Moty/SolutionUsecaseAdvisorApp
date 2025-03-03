/**
 * Database Status Utility
 * 
 * This module provides utilities for checking the status of the database connection
 * and determining which database is currently in use.
 */

const { config } = require('../config/database');
const { repositoryFactory } = require('../repositories');

/**
 * Get the current database type
 * @returns {string} Database type (mongodb, hana, or json)
 */
function getDatabaseType() {
  return config.dbType.toLowerCase();
}

/**
 * Check if the database connection is active
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
async function isDatabaseConnected() {
  try {
    // Initialize repository factory if not already initialized
    if (!repositoryFactory.initialized) {
      await repositoryFactory.initialize();
    }
    
    // Try to get a repository to check if the connection is active
    const useCaseRepository = await repositoryFactory.getUseCaseRepository();
    
    // If we get here, the connection is active
    return true;
  } catch (error) {
    console.error('Error checking database connection:', error);
    return false;
  }
}

/**
 * Get database status information
 * @returns {Promise<Object>} Database status object
 */
async function getDatabaseStatus() {
  const dbType = getDatabaseType();
  const isConnected = await isDatabaseConnected();
  
  let connectionString = '';
  
  switch (dbType) {
    case 'mongodb':
      connectionString = config.mongodb.uri;
      break;
    case 'hana':
      connectionString = `${config.hana.host}:${config.hana.port}/${config.hana.schema}`;
      break;
    default:
      connectionString = 'Using JSON files';
  }
  
  // Mask password in connection string if present
  if (connectionString.includes('@')) {
    connectionString = connectionString.replace(/\/\/[^@]+@/, '//****:****@');
  }
  
  return {
    type: dbType,
    connected: isConnected,
    connectionString,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create a database status HTML page
 * @returns {Promise<string>} HTML page
 */
async function createDatabaseStatusHtml() {
  const status = await getDatabaseStatus();
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Database Status</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    .status-item {
      margin-bottom: 10px;
    }
    .status-label {
      font-weight: bold;
      display: inline-block;
      width: 150px;
    }
    .status-value {
      display: inline-block;
    }
    .connected {
      color: green;
    }
    .disconnected {
      color: red;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Database Status</h1>
    <div class="status-item">
      <span class="status-label">Database Type:</span>
      <span class="status-value">${status.type.toUpperCase()}</span>
    </div>
    <div class="status-item">
      <span class="status-label">Connection Status:</span>
      <span class="status-value ${status.connected ? 'connected' : 'disconnected'}">
        ${status.connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
    <div class="status-item">
      <span class="status-label">Connection String:</span>
      <span class="status-value">${status.connectionString}</span>
    </div>
    <div class="status-item">
      <span class="status-label">Last Checked:</span>
      <span class="status-value">${new Date(status.timestamp).toLocaleString()}</span>
    </div>
  </div>
</body>
</html>
  `;
  
  return html;
}

module.exports = {
  getDatabaseType,
  isDatabaseConnected,
  getDatabaseStatus,
  createDatabaseStatusHtml
};
