/**
 * Base MongoDB Repository
 * 
 * This module provides a base implementation of the Repository interface
 * for MongoDB. It uses both Mongoose for ODM capabilities and the native
 * MongoDB driver for more flexibility.
 */

const { Repository } = require('../interfaces');

/**
 * Base MongoDB Repository
 * @implements {Repository}
 */
class BaseMongoRepository extends Repository {
  /**
   * Create a new BaseMongoRepository
   * @param {Object} model - Mongoose model
   * @param {Object} db - MongoDB native driver db instance
   */
  constructor(model, db) {
    super();
    this.model = model;
    this.db = db;
    this.collection = db.collection(model.collection.name);
  }

  /**
   * Find all entities
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of entities
   */
  async findAll(options = {}) {
    const { skip = 0, limit = 100, sort = { _id: 1 } } = options;
    
    try {
      return await this.model.find()
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean();
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  /**
   * Find an entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<Object|null>} Entity or null if not found
   */
  async findById(id) {
    try {
      return await this.model.findOne({ id }).lean();
    } catch (error) {
      console.error(`Error in findById for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find entities by filter criteria
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching entities
   */
  async findByFilter(filter, options = {}) {
    const { skip = 0, limit = 100, sort = { _id: 1 } } = options;
    
    try {
      return await this.model.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean();
    } catch (error) {
      console.error('Error in findByFilter:', error);
      throw error;
    }
  }

  /**
   * Count entities by filter criteria
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>} Count of matching entities
   */
  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      console.error('Error in count:', error);
      throw error;
    }
  }

  /**
   * Create a new entity
   * @param {Object} data - Entity data
   * @returns {Promise<Object>} Created entity
   */
  async create(data) {
    try {
      const entity = new this.model(data);
      await entity.save();
      return entity.toObject();
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  /**
   * Update an entity by ID
   * @param {string} id - Entity ID
   * @param {Object} data - Updated entity data
   * @returns {Promise<Object|null>} Updated entity or null if not found
   */
  async updateById(id, data) {
    try {
      const entity = await this.model.findOneAndUpdate(
        { id },
        { $set: data },
        { new: true, runValidators: true }
      ).lean();
      
      return entity;
    } catch (error) {
      console.error(`Error in updateById for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteById(id) {
    try {
      const result = await this.model.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`Error in deleteById for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete entities by filter criteria
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>} Number of deleted entities
   */
  async deleteMany(filter) {
    try {
      const result = await this.model.deleteMany(filter);
      return result.deletedCount;
    } catch (error) {
      console.error('Error in deleteMany:', error);
      throw error;
    }
  }

  /**
   * Perform a transaction with multiple operations
   * @param {Function} operations - Function containing operations to perform in transaction
   * @returns {Promise<any>} Result of the transaction
   */
  async transaction(operations) {
    const session = await this.model.db.startSession();
    
    try {
      session.startTransaction();
      
      const result = await operations(session);
      
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      console.error('Error in transaction:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = BaseMongoRepository;
