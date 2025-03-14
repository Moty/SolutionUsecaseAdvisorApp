/**
 * MongoDB New Use Case Repository
 * 
 * This module provides a MongoDB implementation of the NewUseCaseRepository interface.
 * It extends the BaseMongoRepository with new use case-specific methods.
 */

const { NewUseCaseRepository } = require('../interfaces');
const BaseMongoRepository = require('./baseRepository');
const { Parser } = require('json2csv');
const { v4: uuidv4 } = require('uuid');

/**
 * MongoDB New Use Case Repository
 * @implements {NewUseCaseRepository}
 * @extends {BaseMongoRepository}
 */
class NewUseCaseMongoRepository extends BaseMongoRepository {
  /**
   * Create a new NewUseCaseMongoRepository
   * @param {Object} model - Mongoose NewUseCase model
   * @param {Object} db - MongoDB native driver db instance
   */
  constructor(model, db) {
    super(model, db);
  }

  /**
   * Find new use cases by user ID
   * @param {string} userId - User ID
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching new use cases
   */
  async findByUserId(userId, options = {}) {
    try {
      return await this.findByFilter({ userId }, options);
    } catch (error) {
      console.error(`Error in findByUserId for userId ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Find new use cases by status
   * @param {string} status - Status (pending, approved, rejected)
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching new use cases
   */
  async findByStatus(status, options = {}) {
    try {
      return await this.findByFilter({ status }, options);
    } catch (error) {
      console.error(`Error in findByStatus for status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Find new use cases by user ID and status
   * @param {string} userId - User ID
   * @param {string} status - Status (pending, approved, rejected)
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching new use cases
   */
  async findByUserIdAndStatus(userId, status, options = {}) {
    try {
      return await this.findByFilter({ userId, status }, options);
    } catch (error) {
      console.error(`Error in findByUserIdAndStatus for userId ${userId} and status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Update the status of a new use case
   * @param {string} id - New use case ID
   * @param {string} status - New status (pending, approved, rejected)
   * @returns {Promise<Object|null>} Updated new use case or null if not found
   */
  async updateStatus(id, status) {
    try {
      return await this.updateById(id, { status });
    } catch (error) {
      console.error(`Error in updateStatus for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add notes to a new use case
   * @param {string} id - New use case ID
   * @param {string} notes - Notes to add
   * @returns {Promise<Object|null>} Updated new use case or null if not found
   */
  async addNotes(id, notes) {
    try {
      return await this.updateById(id, { notes });
    } catch (error) {
      console.error(`Error in addNotes for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Export new use cases as CSV
   * @param {Object} filters - Filter criteria (userId, status)
   * @returns {Promise<string>} CSV string
   */
  async exportToCsv(filters = {}) {
    try {
      // Build filter object
      const filter = {};
      if (filters.userId) filter.userId = filters.userId;
      if (filters.status) filter.status = filters.status;
      
      // Get filtered new use cases
      const newUseCases = await this.findByFilter(filter, { limit: 1000 });
      
      if (newUseCases.length === 0) {
        return 'No data to export';
      }
      
      // Transform data for CSV export
      const csvData = newUseCases.map(useCase => ({
        id: useCase.id,
        userId: useCase.userId,
        status: useCase.status,
        pdfFileName: useCase.pdfFileName,
        notes: useCase.notes,
        createdAt: useCase.createdAt,
        updatedAt: useCase.updatedAt,
        'mappedFields.UseCaseName': useCase.mappedFields.UseCaseName,
        'mappedFields.UserRole': useCase.mappedFields.UserRole,
        'mappedFields.Challenge': useCase.mappedFields.Challenge,
        'mappedFields.Enablers': useCase.mappedFields.Enablers,
        'mappedFields.KeyBenefits': useCase.mappedFields.KeyBenefits,
        'mappedFields.MappedSolution': useCase.mappedFields.MappedSolution,
        'mappedFields.UseCaseID': useCase.mappedFields.UseCaseID,
        'extractedFields.focusArea': useCase.extractedFields.focusArea,
        'extractedFields.process': useCase.extractedFields.process,
        'extractedFields.affected': useCase.extractedFields.affected,
        'extractedFields.improvement': useCase.extractedFields.improvement,
        'extractedFields.howToImprove': useCase.extractedFields.howToImprove
      }));
      
      // Define fields for CSV
      const fields = Object.keys(csvData[0]);
      
      // Create CSV parser
      const json2csvParser = new Parser({ fields });
      
      // Convert to CSV
      return json2csvParser.parse(csvData);
    } catch (error) {
      console.error('Error in exportToCsv:', error);
      throw error;
    }
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
    try {
      // Generate a unique ID for the new use case
      const id = uuidv4();
      
      // Make a copy of mappedFields to avoid modifying the original
      const updatedMappedFields = { ...mappedFields };
      
      // Generate a UseCaseID if not provided
      if (!updatedMappedFields.UseCaseID) {
        // Create a unique ID with a prefix and timestamp
        const timestamp = new Date().getTime();
        updatedMappedFields.UseCaseID = `UC-${timestamp}-${id.substring(0, 8)}`;
        console.log(`Generated UseCaseID: ${updatedMappedFields.UseCaseID}`);
      }
      
      // Create the new use case
      const newUseCase = await this.create({
        id,
        userId,
        status: 'pending',
        extractedFields,
        mappedFields: updatedMappedFields,
        pdfFileName,
        notes: ''
      });
      
      return newUseCase;
    } catch (error) {
      console.error('Error in importFromPdf:', error);
      throw error;
    }
  }
}

module.exports = NewUseCaseMongoRepository;
