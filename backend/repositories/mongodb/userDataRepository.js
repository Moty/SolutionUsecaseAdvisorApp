/**
 * MongoDB User Data Repository
 * 
 * This module provides a MongoDB implementation of the UserDataRepository interface.
 * It extends the BaseMongoRepository with user data-specific methods.
 */

const { UserDataRepository } = require('../interfaces');
const BaseMongoRepository = require('./baseRepository');
const { v4: uuidv4 } = require('uuid');

/**
 * MongoDB User Data Repository
 * @implements {UserDataRepository}
 * @extends {BaseMongoRepository}
 */
class UserDataMongoRepository extends BaseMongoRepository {
  /**
   * Create a new UserDataMongoRepository
   * @param {Object} model - Mongoose UserData model
   * @param {Object} db - MongoDB native driver db instance
   */
  constructor(model, db) {
    super(model, db);
  }

  /**
   * Get favorites for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of favorite use case IDs
   */
  async getFavorites(userId) {
    try {
      const userData = await this.model.findOne({ userId }).lean();
      return userData ? userData.favorites : [];
    } catch (error) {
      console.error(`Error in getFavorites for userId ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Add a favorite for a user
   * @param {string} userId - User ID
   * @param {string} useCaseId - Use case ID to add to favorites
   * @returns {Promise<Array>} Updated array of favorite use case IDs
   */
  async addFavorite(userId, useCaseId) {
    try {
      // Find or create user data
      let userData = await this.model.findOne({ userId });
      
      if (!userData) {
        userData = await this.model.create({
          userId,
          favorites: [useCaseId]
        });
        return userData.favorites;
      }
      
      // Add to favorites if not already present
      if (!userData.favorites.includes(useCaseId)) {
        userData.favorites.push(useCaseId);
        await userData.save();
      }
      
      return userData.favorites;
    } catch (error) {
      console.error(`Error in addFavorite for userId ${userId} and useCaseId ${useCaseId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a favorite for a user
   * @param {string} userId - User ID
   * @param {string} useCaseId - Use case ID to remove from favorites
   * @returns {Promise<Array>} Updated array of favorite use case IDs
   */
  async removeFavorite(userId, useCaseId) {
    try {
      const userData = await this.model.findOne({ userId });
      
      if (!userData) {
        return [];
      }
      
      // Remove from favorites
      userData.favorites = userData.favorites.filter(id => id !== useCaseId);
      await userData.save();
      
      return userData.favorites;
    } catch (error) {
      console.error(`Error in removeFavorite for userId ${userId} and useCaseId ${useCaseId}:`, error);
      throw error;
    }
  }

  /**
   * Get annotations for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Object with use case IDs as keys and annotation text as values
   */
  async getAnnotations(userId) {
    try {
      const userData = await this.model.findOne({ userId }).lean();
      
      if (!userData) {
        return {};
      }
      
      // Convert Map to plain object
      const annotations = {};
      userData.annotations.forEach((value, key) => {
        annotations[key] = value;
      });
      
      return annotations;
    } catch (error) {
      console.error(`Error in getAnnotations for userId ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Add or update an annotation for a user
   * @param {string} userId - User ID
   * @param {string} useCaseId - Use case ID to annotate
   * @param {string} text - Annotation text
   * @returns {Promise<Object>} Updated annotations object
   */
  async addAnnotation(userId, useCaseId, text) {
    try {
      // Find or create user data
      let userData = await this.model.findOne({ userId });
      
      if (!userData) {
        userData = await this.model.create({
          userId,
          annotations: new Map([[useCaseId, text]])
        });
      } else {
        // Update annotation
        userData.annotations.set(useCaseId, text);
        await userData.save();
      }
      
      // Convert Map to plain object for return
      const annotations = {};
      userData.annotations.forEach((value, key) => {
        annotations[key] = value;
      });
      
      return annotations;
    } catch (error) {
      console.error(`Error in addAnnotation for userId ${userId} and useCaseId ${useCaseId}:`, error);
      throw error;
    }
  }

  /**
   * Remove an annotation for a user
   * @param {string} userId - User ID
   * @param {string} useCaseId - Use case ID to remove annotation from
   * @returns {Promise<Object>} Updated annotations object
   */
  async removeAnnotation(userId, useCaseId) {
    try {
      const userData = await this.model.findOne({ userId });
      
      if (!userData) {
        return {};
      }
      
      // Delete annotation
      userData.annotations.delete(useCaseId);
      await userData.save();
      
      // Convert Map to plain object for return
      const annotations = {};
      userData.annotations.forEach((value, key) => {
        annotations[key] = value;
      });
      
      return annotations;
    } catch (error) {
      console.error(`Error in removeAnnotation for userId ${userId} and useCaseId ${useCaseId}:`, error);
      throw error;
    }
  }

  /**
   * Get ratings for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Object with use case IDs as keys and rating objects as values
   */
  async getRatings(userId) {
    try {
      const userData = await this.model.findOne({ userId }).lean();
      
      if (!userData) {
        return {};
      }
      
      // Convert Map to plain object
      const ratings = {};
      userData.ratings.forEach((value, key) => {
        ratings[key] = value;
      });
      
      return ratings;
    } catch (error) {
      console.error(`Error in getRatings for userId ${userId}:`, error);
      throw error;
    }
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
    try {
      // Find or create user data
      let userData = await this.model.findOne({ userId });
      
      const ratingObject = {
        rating,
        feedback,
        timestamp: new Date()
      };
      
      if (!userData) {
        userData = await this.model.create({
          userId,
          ratings: new Map([[useCaseId, ratingObject]])
        });
      } else {
        // Update rating
        userData.ratings.set(useCaseId, ratingObject);
        await userData.save();
      }
      
      // Convert Map to plain object for return
      const ratings = {};
      userData.ratings.forEach((value, key) => {
        ratings[key] = value;
      });
      
      return ratings;
    } catch (error) {
      console.error(`Error in addRating for userId ${userId} and useCaseId ${useCaseId}:`, error);
      throw error;
    }
  }

  /**
   * Get ratings summary for all use cases
   * @returns {Promise<Object>} Object with use case IDs as keys and summary objects as values
   */
  async getRatingsSummary() {
    try {
      // Use aggregation to calculate rating summaries
      const ratingAggregation = await this.collection.aggregate([
        { $unwind: { path: '$ratings', preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: '$ratings.k',
            averageRating: { $avg: '$ratings.v.rating' },
            count: { $sum: 1 },
            ratings: { $push: '$ratings.v.rating' }
          }
        },
        {
          $project: {
            averageRating: 1,
            count: 1,
            distribution: {
              '1': { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 1] } } } },
              '2': { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 2] } } } },
              '3': { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 3] } } } },
              '4': { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 4] } } } },
              '5': { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 5] } } } }
            }
          }
        }
      ]).toArray();
      
      // Transform to object with use case IDs as keys
      const summary = {};
      ratingAggregation.forEach(item => {
        summary[item._id] = {
          averageRating: item.averageRating,
          count: item.count,
          distribution: item.distribution
        };
      });
      
      return summary;
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
  async getFilterHistory(userId) {
    try {
      const userData = await this.model.findOne({ userId }).lean();
      return userData ? userData.filterHistory : [];
    } catch (error) {
      console.error(`Error in getFilterHistory for userId ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Add a filter to history for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter criteria
   * @param {string} name - Optional name for the filter set
   * @returns {Promise<Array>} Updated filter history array
   */
  async addFilterHistory(userId, filters, name = '') {
    try {
      // Find or create user data
      let userData = await this.model.findOne({ userId });
      
      const filterItem = {
        id: uuidv4(),
        filters,
        name,
        timestamp: new Date()
      };
      
      if (!userData) {
        userData = await this.model.create({
          userId,
          filterHistory: [filterItem]
        });
      } else {
        // Add to filter history
        userData.filterHistory.push(filterItem);
        
        // Keep only the last 10 items
        if (userData.filterHistory.length > 10) {
          userData.filterHistory = userData.filterHistory.slice(-10);
        }
        
        await userData.save();
      }
      
      return userData.filterHistory;
    } catch (error) {
      console.error(`Error in addFilterHistory for userId ${userId}:`, error);
      throw error;
    }
  }
}

module.exports = UserDataMongoRepository;
