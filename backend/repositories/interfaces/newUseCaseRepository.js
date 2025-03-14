/**
 * New Use Case Repository Interface
 * 
 * This module defines the interface for repositories that handle new use cases.
 * It extends the base Repository interface with new use case-specific methods.
 * New use cases are user-specific and can be created from unmatched PDFs.
 */

const Repository = require('./repository');

/**
 * New Use Case Repository Interface
 * @interface
 * @extends Repository
 */
class NewUseCaseRepository extends Repository {
  /**
   * Find new use cases by user ID
   * @param {string} userId - User ID
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching new use cases
   */
  async findByUserId(userId, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find new use cases by status
   * @param {string} status - Status (pending, approved, rejected)
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching new use cases
   */
  async findByStatus(status, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find new use cases by user ID and status
   * @param {string} userId - User ID
   * @param {string} status - Status (pending, approved, rejected)
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching new use cases
   */
  async findByUserIdAndStatus(userId, status, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Update the status of a new use case
   * @param {string} id - New use case ID
   * @param {string} status - New status (pending, approved, rejected)
   * @returns {Promise<Object|null>} Updated new use case or null if not found
   */
  async updateStatus(id, status) {
    throw new Error('Method not implemented');
  }

  /**
   * Add notes to a new use case
   * @param {string} id - New use case ID
   * @param {string} notes - Notes to add
   * @returns {Promise<Object|null>} Updated new use case or null if not found
   */
  async addNotes(id, notes) {
    throw new Error('Method not implemented');
  }

  /**
   * Export new use cases as CSV
   * @param {Object} filters - Filter criteria (userId, status)
   * @returns {Promise<string>} CSV string
   */
  async exportToCsv(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Import a new use case from a matched PDF
   * @param {Object} extractedFields - Fields extracted from PDF
   * @param {Object} mappedFields - Fields mapped to use case schema
   * @param {string} pdfFileName - Name of the PDF file
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created new use case
   */
  async importFromPdf(extractedFields, mappedFields, pdfFileName, userId) {
    throw new Error('Method not implemented');
  }
}

module.exports = NewUseCaseRepository;
