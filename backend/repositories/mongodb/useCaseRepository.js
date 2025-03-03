/**
 * MongoDB Use Case Repository
 * 
 * This module provides a MongoDB implementation of the UseCaseRepository interface.
 * It extends the BaseMongoRepository with use case-specific methods.
 */

const mongoose = require('mongoose');
const { UseCaseRepository } = require('../interfaces');
const BaseMongoRepository = require('./baseRepository');
const { Parser } = require('json2csv');

/**
 * MongoDB Use Case Repository
 * @implements {UseCaseRepository}
 * @extends {BaseMongoRepository}
 */
class UseCaseMongoRepository extends BaseMongoRepository {
  /**
   * Create a new UseCaseMongoRepository
   * @param {Object} model - Mongoose UseCase model
   * @param {Object} db - MongoDB native driver db instance
   */
  constructor(model, db) {
    super(model, db);
  }

  /**
   * Find use cases by user role
   * @param {string} role - User role
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching use cases
   */
  async findByUserRole(role, options = {}) {
    try {
      return await this.findByFilter({ userRole: role }, options);
    } catch (error) {
      console.error(`Error in findByUserRole for role ${role}:`, error);
      throw error;
    }
  }

  /**
   * Find use cases by SAP module
   * @param {string} module - SAP module
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching use cases
   */
  async findByModule(module, options = {}) {
    try {
      return await this.findByFilter({ module }, options);
    } catch (error) {
      console.error(`Error in findByModule for module ${module}:`, error);
      throw error;
    }
  }

  /**
   * Find use cases by keyword (searches across multiple fields)
   * @param {string} keyword - Keyword to search for
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching use cases
   */
  async findByKeyword(keyword, options = {}) {
    try {
      // Use MongoDB text search
      return await this.model.find(
        { $text: { $search: keyword } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .skip(options.skip || 0)
        .limit(options.limit || 100)
        .lean();
    } catch (error) {
      console.error(`Error in findByKeyword for keyword ${keyword}:`, error);
      throw error;
    }
  }

  /**
   * Find use cases by combined filters
   * @param {Object} filters - Filter criteria (role, module, keyword)
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of matching use cases
   */
  async findByFilters(filters, options = {}) {
    try {
      console.log('Repository: Building database query with filters:', JSON.stringify(filters));
      const query = {};
      
      // Add role filter if provided
      if (filters.role) {
        query.userRole = filters.role;
        console.log('Repository: Added role filter', filters.role);
      }
      
      // Add module filter if provided
      if (filters.module) {
        query.module = filters.module;
        console.log('Repository: Added module filter', filters.module);
      }
      
      // Add keyword search if provided
      if (filters.keyword) {
        query.$text = { $search: filters.keyword };
        options.sort = { score: { $meta: 'textScore' } };
        options.projection = { score: { $meta: 'textScore' } };
        console.log('Repository: Added keyword search', filters.keyword);
      }
      
      console.log('Repository: Final query:', JSON.stringify(query));
      
      // Check if the collection exists and has documents
      const collectionName = this.model.collection.name;
      console.log('Repository: Expected collection name from model:', collectionName);
      
      // Log all available collections for debugging
      const availableCollections = await mongoose.connection.db.listCollections().toArray();
      console.log('Repository: Available collections in database:', availableCollections.map(c => c.name).join(', '));
      
      try {
        const stats = await this.db.collection(collectionName).stats();
        console.log(`Repository: Collection '${collectionName}' stats:`, {
          count: stats.count,
          size: stats.size,
          avgObjSize: stats.avgObjSize
        });
      } catch (statsError) {
        console.error(`Repository: Error getting stats for collection '${collectionName}':`, statsError.message);
        // Try with lowercase collection name as a fallback
        try {
          const lowercaseCollectionName = collectionName.toLowerCase();
          console.log(`Repository: Trying with lowercase collection name: '${lowercaseCollectionName}'`);
          const stats = await this.db.collection(lowercaseCollectionName).stats();
          console.log(`Repository: Collection '${lowercaseCollectionName}' stats:`, {
            count: stats.count,
            size: stats.size,
            avgObjSize: stats.avgObjSize
          });
        } catch (lowercaseError) {
          console.error(`Repository: Error getting stats for lowercase collection:`, lowercaseError.message);
        }
      }
      
      // Execute the query
      const solutions = await this.model.find(query, options.projection || {})
        .skip(options.skip || 0)
        .limit(options.limit || 100)
        .sort(options.sort || { _id: 1 })
        .lean();
      
      console.log(`Repository: Query returned ${solutions.length} results`);
      
      // Check if we need to transform the data for the frontend
      // The database schema uses camelCase (useCaseId), but the frontend expects "Use Case ID" format
      if (solutions.length > 0) {
        console.log('Repository: Sample database record format:', Object.keys(solutions[0]));
        // Map database fields back to frontend expected format
        const transformedSolutions = solutions.map(solution => {
          return {
            'Use Case ID': solution.useCaseId,
            'Use Case Name': solution.useCaseName,
            'User Role': solution.userRole,
            'Challenge': solution.challenge,
            'Value Drivers': solution.valueDrivers,
            'Enablers': solution.enablers,
            'Baseline without AI': solution.baselineWithoutAI,
            'New World (with AI)': solution.newWorldWithAI,
            'Mapped Solution': solution.mappedSolution,
            'Key Benefits': solution.keyBenefits,
            'module': solution.module,
            '_id': solution._id,
            'createdAt': solution.createdAt,
            'updatedAt': solution.updatedAt
          };
        });
        
        console.log('Repository: Transformed record format:', Object.keys(transformedSolutions[0]));
        console.log('Repository: First transformed record:', transformedSolutions[0]['Use Case ID']);
        
        return transformedSolutions;
      }
      
      if (solutions.length === 0) {
        console.log('Repository: No solutions found, checking if collection has data...');
        
        // Get a sample to verify there is data in the collection
        const sampleData = await this.model.find({}).limit(1).lean();
        if (sampleData.length > 0) {
          console.log('Repository: Sample data exists in collection:', JSON.stringify(sampleData[0]['Use Case ID'] || sampleData[0].useCaseId || sampleData[0]._id));
        } else {
          console.log('Repository: Collection appears to be empty');
        }
      }
      
      return solutions;
    } catch (error) {
      console.error('Error in findByFilters:', error);
      throw error;
    }
  }

  /**
   * Get metrics for dashboard
   * @returns {Promise<Object>} Metrics object with totalUseCases, moduleDistribution, roleDistribution
   */
  async getMetrics() {
    try {
      const [totalUseCases, moduleAggregation, roleAggregation] = await Promise.all([
        this.model.countDocuments(),
        this.model.aggregate([
          { $group: { _id: '$module', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        this.model.aggregate([
          { $group: { _id: '$userRole', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);
      
      // Transform aggregation results into more readable objects
      const moduleDistribution = moduleAggregation.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
      
      const roleDistribution = roleAggregation.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
      
      return {
        totalUseCases,
        moduleDistribution,
        roleDistribution
      };
    } catch (error) {
      console.error('Error in getMetrics:', error);
      throw error;
    }
  }

  /**
   * Export use cases as CSV
   * @param {Object} filters - Filter criteria (role, module, keyword)
   * @returns {Promise<string>} CSV string
   */
  async exportToCsv(filters = {}) {
    try {
      // Get filtered use cases
      const useCases = await this.findByFilters(filters, { limit: 1000 });
      
      if (useCases.length === 0) {
        return 'No data to export';
      }
      
      // Define fields for CSV
      const fields = [
        'useCaseId',
        'useCaseName',
        'userRole',
        'challenge',
        'valueDrivers',
        'enablers',
        'baselineWithoutAI',
        'newWorldWithAI',
        'mappedSolution',
        'keyBenefits',
        'module'
      ];
      
      // Create CSV parser
      const json2csvParser = new Parser({ fields });
      
      // Convert to CSV
      return json2csvParser.parse(useCases);
    } catch (error) {
      console.error('Error in exportToCsv:', error);
      throw error;
    }
  }
}

module.exports = UseCaseMongoRepository;
