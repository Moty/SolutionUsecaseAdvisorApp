/**
 * User Data Repository Interface
 * 
 * This module defines the interface for repositories that handle user data.
 * It extends the base Repository interface with user data-specific methods.
 * User data includes favorites, annotations, ratings, and filter history.
 */

const Repository = require('./repository');

/**
 * User Data Repository Interface
 * @interface
 * @extends Repository
 */
class UserDataRepository extends Repository {
  /**
   * Get favorites for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of favorite use case IDs
   */
  async getFavorites(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a favorite for a user
   * @param {string} userId - User ID
   * @param {string} useCaseId - Use case ID to add to favorites
   * @returns {Promise<Array>} Updated array of favorite use case IDs
   */
  async addFavorite(userId, useCaseId) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove a favorite for a user
   * @param {string} userId - User ID
   * @param {string} useCaseId - Use case ID to remove from favorites
   * @returns {Promise<Array>} Updated array of favorite use case IDs
   */
  async removeFavorite(userId, useCaseId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get annotations for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Object with use case IDs as keys and annotation text as values
   */
  async getAnnotations(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Add or update an annotation for a user
   * @param {string} userId - User ID
   * @param {string} useCaseId - Use case ID to annotate
   * @param {string} text - Annotation text
   * @returns {Promise<Object>} Updated annotations object
   */
  async addAnnotation(userId, useCaseId, text) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove an annotation for a user
   * @param {string} userId - User ID
   * @param {string} useCaseId - Use case ID to remove annotation from
   * @returns {Promise<Object>} Updated annotations object
   */
  async removeAnnotation(userId, useCaseId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get ratings for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Object with use case IDs as keys and rating objects as values
   */
  async getRatings(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Add or update a rating for a user
   * @param {string} userId - User ID
   * @param {string} useCaseId - Use case ID to rate
   * @param {number} rating - Rating value
   * @param {string} feedback - Optional feedback text
   * @returns {Promise<Object>} Updated ratings object
   */
  async addRating(userId, useCaseId, rating, feedback = '') {
    throw new Error('Method not implemented');
  }

  /**
   * Get ratings summary for all use cases
   * @returns {Promise<Object>} Object with use case IDs as keys and summary objects as values
   */
  async getRatingsSummary() {
    throw new Error('Method not implemented');
  }

  /**
   * Get filter history for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of filter history items
   */
  async getFilterHistory(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a filter to history for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter criteria
   * @param {string} name - Optional name for the filter set
   * @returns {Promise<Array>} Updated filter history array
   */
  async addFilterHistory(userId, filters, name = '') {
    throw new Error('Method not implemented');
  }
}

module.exports = UserDataRepository;
