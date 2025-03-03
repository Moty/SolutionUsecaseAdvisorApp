/**
 * Base Repository Interface
 * 
 * This module defines the interface that all repositories must implement.
 * It provides a common set of methods for CRUD operations and querying.
 * 
 * This interface is designed to be database-agnostic, allowing for
 * implementations with different database systems (MongoDB, HANA, etc.)
 */

/**
 * Base Repository Interface
 * @interface
 */
class Repository {
  /**
   * Find all entities
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of entities
   */
  async findAll(options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find an entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<Object|null>} Entity or null if not found
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find entities by filter criteria
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching entities
   */
  async findByFilter(filter, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Count entities by filter criteria
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>} Count of matching entities
   */
  async count(filter = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new entity
   * @param {Object} data - Entity data
   * @returns {Promise<Object>} Created entity
   */
  async create(data) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an entity by ID
   * @param {string} id - Entity ID
   * @param {Object} data - Updated entity data
   * @returns {Promise<Object|null>} Updated entity or null if not found
   */
  async updateById(id, data) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete an entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete entities by filter criteria
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>} Number of deleted entities
   */
  async deleteMany(filter) {
    throw new Error('Method not implemented');
  }

  /**
   * Perform a transaction with multiple operations
   * @param {Function} operations - Function containing operations to perform in transaction
   * @returns {Promise<any>} Result of the transaction
   */
  async transaction(operations) {
    throw new Error('Method not implemented');
  }
}

module.exports = Repository;
