/**
 * Database Configuration Module
 * 
 * This module provides a unified interface for database connections,
 * supporting both MongoDB and SAP HANA (future). It uses environment
 * variables to determine which database to connect to.
 */

const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration object based on environment variables
const config = {
  dbType: process.env.DB_TYPE || 'mongodb',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sap-solution-advisor',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  hana: {
    // HANA connection details (for future use)
    host: process.env.HANA_HOST,
    port: process.env.HANA_PORT,
    user: process.env.HANA_USER,
    password: process.env.HANA_PASSWORD,
    schema: process.env.HANA_SCHEMA
  }
};

/**
 * MongoDB Connection Manager
 */
class MongoDBConnectionManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.mongoose = mongoose;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<Object>} MongoDB connection
   */
  async connect() {
    try {
      if (this.client) {
        return { client: this.client, db: this.db, mongoose: this.mongoose };
      }

      console.log('Attempting to connect to MongoDB at:', config.mongodb.uri);
      
      // Connect using Mongoose for ODM capabilities
      await mongoose.connect(config.mongodb.uri, config.mongodb.options);
      console.log('Connected to MongoDB via Mongoose');
      
      // Check database state
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`MongoDB contains ${collections.length} collections:`, collections.map(c => c.name).join(', '));
      
      // Log database version
      const admin = mongoose.connection.db.admin();
      const serverInfo = await admin.serverInfo();
      console.log(`MongoDB server version: ${serverInfo.version}`);

      // Also connect using native MongoDB driver for more flexibility
      this.client = new MongoClient(config.mongodb.uri, config.mongodb.options);
      await this.client.connect();
      this.db = this.client.db();
      console.log('Connected to MongoDB via native driver');
      
      // Verify if UseCases collection exists and has documents
      if (collections.some(c => c.name === 'usecases')) {
        const count = await this.db.collection('usecases').countDocuments();
        console.log(`UseCases collection contains ${count} documents`);
      } else {
        console.warn('UseCases collection not found in database! This may be why no data is displayed.');
      }

      return { client: this.client, db: this.db, mongoose: this.mongoose };
    } catch (error) {
      console.error('MongoDB connection error:', error);
      console.error('Connection string:', config.mongodb.uri);
      console.error('Connection options:', JSON.stringify(config.mongodb.options));
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        console.log('Disconnected from MongoDB via native driver');
      }

      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB via Mongoose');
      }
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
      throw error;
    }
  }
}

/**
 * HANA Connection Manager (Placeholder for future implementation)
 */
class HANAConnectionManager {
  constructor() {
    this.client = null;
    this.connection = null;
  }

  /**
   * Connect to SAP HANA
   * @returns {Promise<Object>} HANA connection
   */
  async connect() {
    try {
      console.log('HANA connection not implemented yet');
      // Placeholder for future HANA connection logic
      return { client: null, connection: null };
    } catch (error) {
      console.error('HANA connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from SAP HANA
   */
  async disconnect() {
    try {
      console.log('HANA disconnection not implemented yet');
      // Placeholder for future HANA disconnection logic
    } catch (error) {
      console.error('HANA disconnection error:', error);
      throw error;
    }
  }
}

/**
 * Database Factory
 * Returns the appropriate database connection manager based on configuration
 */
class DatabaseFactory {
  /**
   * Get database connection manager
   * @returns {MongoDBConnectionManager|HANAConnectionManager} Database connection manager
   */
  static getConnectionManager() {
    switch (config.dbType.toLowerCase()) {
      case 'mongodb':
        return new MongoDBConnectionManager();
      case 'hana':
        return new HANAConnectionManager();
      default:
        console.warn(`Unknown database type: ${config.dbType}, defaulting to MongoDB`);
        return new MongoDBConnectionManager();
    }
  }
}

// Export the database factory and configuration
module.exports = {
  DatabaseFactory,
  config
};
