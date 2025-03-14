/**
 * Repositories Index
 * 
 * This module exports the repository factory and all repository implementations.
 * It provides a unified interface for accessing repositories regardless of the
 * underlying database implementation.
 */

const { DatabaseFactory } = require('../config/database');
const { 
  Repository,
  UseCaseRepository,
  NewUseCaseRepository,
  UserDataRepository
} = require('./interfaces');

const {
  BaseMongoRepository,
  UseCaseMongoRepository,
  NewUseCaseMongoRepository,
  UserDataMongoRepository
} = require('./mongodb');

const { UseCase, NewUseCase, UserData } = require('../models');

/**
 * Repository Factory
 * 
 * Creates and returns repository instances based on the current database configuration.
 */
class RepositoryFactory {
  constructor() {
    this.dbConnectionManager = null;
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize the repository factory
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    // Get database connection manager from factory
    this.dbConnectionManager = DatabaseFactory.getConnectionManager();
    
    // Connect to database
    const connection = await this.dbConnectionManager.connect();
    this.db = connection.db;
    
    this.initialized = true;
  }

  /**
   * Get a use case repository
   * @returns {Promise<UseCaseRepository>} Use case repository
   */
  async getUseCaseRepository() {
    await this.initialize();
    return new UseCaseMongoRepository(UseCase, this.db);
  }

  /**
   * Get a new use case repository
   * @returns {Promise<NewUseCaseRepository>} New use case repository
   */
  async getNewUseCaseRepository() {
    await this.initialize();
    return new NewUseCaseMongoRepository(NewUseCase, this.db);
  }

  /**
   * Get a user data repository
   * @returns {Promise<UserDataRepository>} User data repository
   */
  async getUserDataRepository() {
    await this.initialize();
    return new UserDataMongoRepository(UserData, this.db);
  }

  /**
   * Close database connections
   * @returns {Promise<void>}
   */
  async close() {
    if (this.dbConnectionManager) {
      await this.dbConnectionManager.disconnect();
      this.dbConnectionManager = null;
      this.db = null;
      this.initialized = false;
    }
  }
}

// Create a singleton instance
const repositoryFactory = new RepositoryFactory();

module.exports = {
  repositoryFactory,
  Repository,
  UseCaseRepository,
  NewUseCaseRepository,
  UserDataRepository,
  BaseMongoRepository,
  UseCaseMongoRepository,
  NewUseCaseMongoRepository,
  UserDataMongoRepository
};
