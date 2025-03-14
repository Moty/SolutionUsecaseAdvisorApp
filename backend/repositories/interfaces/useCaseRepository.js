/**
 * Use Case Repository Interface
 * 
 * This module defines the interface for repositories that handle use cases.
 * It extends the base Repository interface with use case-specific methods.
 */

const Repository = require('./repository');

/**
 * Use Case Repository Interface
 * @interface
 * @extends Repository
 */
class UseCaseRepository extends Repository {
  /**
   * Find use cases by user role
   * @param {string} role - User role
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching use cases
   */
  async findByUserRole(role, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find use cases by SAP module
   * @param {string} module - SAP module
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching use cases
   */
  async findByModule(module, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find use cases by keyword (searches across multiple fields)
   * @param {string} keyword - Keyword to search for
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching use cases
   */
  async findByKeyword(keyword, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find use cases by combined filters
   * @param {Object} filters - Filter criteria (role, module, keyword)
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching use cases
   */
  async findByFilters(filters, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get metrics for dashboard
   * @returns {Promise<Object>} Metrics object with totalUseCases, moduleDistribution, roleDistribution
   */
  async getMetrics() {
    throw new Error('Method not implemented');
  }

  /**
   * Export use cases as CSV
   * @param {Object} filters - Filter criteria (role, module, keyword)
   * @returns {Promise<string>} CSV string
   */
  async exportToCsv(filters = {}) {
    throw new Error('Method not implemented');
  }
}

module.exports = UseCaseRepository;
