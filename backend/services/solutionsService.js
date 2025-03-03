/**
 * Solutions Service
 * 
 * This module provides services for working with solutions (use cases).
 * It uses the repository factory to access the appropriate repositories.
 */

const { repositoryFactory } = require('../repositories');
const { Parser } = require('json2csv');

/**
 * Get solutions with optional filtering
 * @param {Object} filters - Filter criteria (role, module, keyword)
 * @param {Object} options - Query options (pagination, sorting, etc.)
 * @returns {Promise<Array>} Array of matching solutions
 */
async function getSolutions(filters = {}, options = {}) {
  try {
    console.log('SolutionsService: Getting solutions with filters:', JSON.stringify(filters));
    const useCaseRepository = await repositoryFactory.getUseCaseRepository();
    console.log('SolutionsService: Repository obtained successfully');
    
    const solutions = await useCaseRepository.findByFilters(filters, options);
    console.log(`SolutionsService: Retrieved ${solutions ? solutions.length : 0} solutions from repository`);
    
    if (!solutions || solutions.length === 0) {
      console.log('SolutionsService: No solutions found with the provided filters');
    }
    
    return solutions;
  } catch (error) {
    console.error('Error in getSolutions:', error);
    throw error;
  }
}

/**
 * Get metrics for dashboard
 * @returns {Promise<Object>} Metrics object with totalUseCases, moduleDistribution, roleDistribution
 */
async function getMetrics() {
  try {
    const useCaseRepository = await repositoryFactory.getUseCaseRepository();
    return await useCaseRepository.getMetrics();
  } catch (error) {
    console.error('Error in getMetrics:', error);
    throw error;
  }
}

/**
 * Export solutions as CSV
 * @param {Object} filters - Filter criteria (role, module, keyword)
 * @returns {Promise<string>} CSV string
 */
async function exportToCsv(filters = {}) {
  try {
    const useCaseRepository = await repositoryFactory.getUseCaseRepository();
    return await useCaseRepository.exportToCsv(filters);
  } catch (error) {
    console.error('Error in exportToCsv:', error);
    throw error;
  }
}

/**
 * Get favorites for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of favorite use case IDs
 */
async function getFavorites(userId = 'default') {
  try {
    const userDataRepository = await repositoryFactory.getUserDataRepository();
    return await userDataRepository.getFavorites(userId);
  } catch (error) {
    console.error('Error in getFavorites:', error);
    throw error;
  }
}

/**
 * Add a solution to favorites
 * @param {string} useCaseId - Use case ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Updated array of favorite use case IDs
 */
async function addFavorite(useCaseId, userId = 'default') {
  try {
    const userDataRepository = await repositoryFactory.getUserDataRepository();
    return await userDataRepository.addFavorite(userId, useCaseId);
  } catch (error) {
    console.error('Error in addFavorite:', error);
    throw error;
  }
}

/**
 * Remove a solution from favorites
 * @param {string} useCaseId - Use case ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Updated array of favorite use case IDs
 */
async function removeFavorite(useCaseId, userId = 'default') {
  try {
    const userDataRepository = await repositoryFactory.getUserDataRepository();
    return await userDataRepository.removeFavorite(userId, useCaseId);
  } catch (error) {
    console.error('Error in removeFavorite:', error);
    throw error;
  }
}

/**
 * Get annotations for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Object with use case IDs as keys and annotation text as values
 */
async function getAnnotations(userId = 'default') {
  try {
    const userDataRepository = await repositoryFactory.getUserDataRepository();
    return await userDataRepository.getAnnotations(userId);
  } catch (error) {
    console.error('Error in getAnnotations:', error);
    throw error;
  }
}

/**
 * Add or update an annotation
 * @param {string} useCaseId - Use case ID
 * @param {string} text - Annotation text
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated annotations object
 */
async function addAnnotation(useCaseId, text, userId = 'default') {
  try {
    const userDataRepository = await repositoryFactory.getUserDataRepository();
    return await userDataRepository.addAnnotation(userId, useCaseId, text);
  } catch (error) {
    console.error('Error in addAnnotation:', error);
    throw error;
  }
}

/**
 * Remove an annotation
 * @param {string} useCaseId - Use case ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated annotations object
 */
async function removeAnnotation(useCaseId, userId = 'default') {
  try {
    const userDataRepository = await repositoryFactory.getUserDataRepository();
    return await userDataRepository.removeAnnotation(userId, useCaseId);
  } catch (error) {
    console.error('Error in removeAnnotation:', error);
    throw error;
  }
}

/**
 * Get ratings for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Object with use case IDs as keys and rating objects as values
 */
async function getRatings(userId = 'default') {
  try {
    const userDataRepository = await repositoryFactory.getUserDataRepository();
    return await userDataRepository.getRatings(userId);
  } catch (error) {
    console.error('Error in getRatings:', error);
    throw error;
  }
}

/**
 * Add or update a rating
 * @param {string} useCaseId - Use case ID
 * @param {number} rating - Rating value
 * @param {string} feedback - Optional feedback text
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated ratings object
 */
async function addRating(useCaseId, rating, feedback = '', userId = 'default') {
  try {
    const userDataRepository = await repositoryFactory.getUserDataRepository();
    return await userDataRepository.addRating(userId, useCaseId, rating, feedback);
  } catch (error) {
    console.error('Error in addRating:', error);
    throw error;
  }
}

/**
 * Get ratings summary
 * @returns {Promise<Object>} Object with use case IDs as keys and summary objects as values
 */
async function getRatingsSummary() {
  try {
    const userDataRepository = await repositoryFactory.getUserDataRepository();
    return await userDataRepository.getRatingsSummary();
  } catch (error) {
    console.error('Error in getRatingsSummary:', error);
    throw error;
  }
}

/**
 * Get filter history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of filter history items
 */
async function getFilterHistory(userId = 'default') {
  try {
    const userDataRepository = await repositoryFactory.getUserDataRepository();
    return await userDataRepository.getFilterHistory(userId);
  } catch (error) {
    console.error('Error in getFilterHistory:', error);
    throw error;
  }
}

/**
 * Add a filter to history
 * @param {Object} filters - Filter criteria
 * @param {string} name - Optional name for the filter set
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Updated filter history array
 */
async function addFilterHistory(filters, name = '', userId = 'default') {
  try {
    const userDataRepository = await repositoryFactory.getUserDataRepository();
    return await userDataRepository.addFilterHistory(userId, filters, name);
  } catch (error) {
    console.error('Error in addFilterHistory:', error);
    throw error;
  }
}

/**
 * Get all new use cases
 * @returns {Promise<Array>} Array of new use cases
 */
async function getNewUseCases() {
  try {
    const newUseCaseRepository = await repositoryFactory.getNewUseCaseRepository();
    return await newUseCaseRepository.findAll();
  } catch (error) {
    console.error('Error in getNewUseCases:', error);
    throw error;
  }
}

/**
 * Export new use cases as CSV
 * @param {Object} filters - Filter criteria (userId, status)
 * @returns {Promise<string>} CSV string
 */
async function exportNewUseCasesToCsv(filters = {}) {
  try {
    const newUseCaseRepository = await repositoryFactory.getNewUseCaseRepository();
    return await newUseCaseRepository.exportToCsv(filters);
  } catch (error) {
    console.error('Error in exportNewUseCasesToCsv:', error);
    throw error;
  }
}

/**
 * Save a new use case
 * @param {Object} extractedFields - Fields extracted from PDF
 * @param {Object} mappedFields - Fields mapped to use case schema
 * @param {string} pdfFileName - Name of the PDF file
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created new use case
 */
async function saveNewUseCase(extractedFields, mappedFields, pdfFileName, userId = 'default') {
  try {
    const newUseCaseRepository = await repositoryFactory.getNewUseCaseRepository();
    return await newUseCaseRepository.importFromPdf(extractedFields, mappedFields, pdfFileName, userId);
  } catch (error) {
    console.error('Error in saveNewUseCase:', error);
    throw error;
  }
}

/**
 * Update a new use case
 * @param {string} id - New use case ID
 * @param {Object} data - Updated data (extractedFields, mappedFields, status, notes)
 * @returns {Promise<Object|null>} Updated new use case or null if not found
 */
async function updateNewUseCase(id, data) {
  try {
    const newUseCaseRepository = await repositoryFactory.getNewUseCaseRepository();
    
    // Update status if provided
    if (data.status) {
      await newUseCaseRepository.updateStatus(id, data.status);
    }
    
    // Update notes if provided
    if (data.notes !== undefined) {
      await newUseCaseRepository.addNotes(id, data.notes);
    }
    
    // Get the updated use case
    return await newUseCaseRepository.findById(id);
  } catch (error) {
    console.error('Error in updateNewUseCase:', error);
    throw error;
  }
}

/**
 * Delete a new use case
 * @param {string} id - New use case ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteNewUseCase(id) {
  try {
    const newUseCaseRepository = await repositoryFactory.getNewUseCaseRepository();
    return await newUseCaseRepository.deleteById(id);
  } catch (error) {
    console.error('Error in deleteNewUseCase:', error);
    throw error;
  }
}

module.exports = {
  getSolutions,
  getMetrics,
  exportToCsv,
  getFavorites,
  addFavorite,
  removeFavorite,
  getAnnotations,
  addAnnotation,
  removeAnnotation,
  getRatings,
  addRating,
  getRatingsSummary,
  getFilterHistory,
  addFilterHistory,
  getNewUseCases,
  exportNewUseCasesToCsv,
  saveNewUseCase,
  updateNewUseCase,
  deleteNewUseCase
};
