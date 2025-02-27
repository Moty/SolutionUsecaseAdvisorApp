import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const DEFAULT_USER_ID = 'default'; // In a real app, this would be the authenticated user's ID

/**
 * Fetch solutions with optional filters
 * @param {Object} filters - Filter parameters
 * @param {string} filters.role - Filter by user role
 * @param {string} filters.module - Filter by SAP module
 * @param {string} filters.keyword - Search keyword
 * @returns {Promise<Array>} - Array of filtered solutions
 */
export const fetchSolutions = async (filters = {}) => {
  try {
    const { role, module, keyword } = filters;
    const params = {};
    
    if (role) params.role = role;
    if (module) params.module = module;
    if (keyword) params.keyword = keyword;
    
    const response = await axios.get(`${API_URL}/solutions`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching solutions:', error);
    throw error;
  }
};

/**
 * Fetch metrics for dashboard
 * @returns {Promise<Object>} - Metrics data
 */
export const fetchMetrics = async () => {
  try {
    const response = await axios.get(`${API_URL}/metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

/**
 * Generate CSV export URL with current filters
 * @param {Object} filters - Filter parameters
 * @returns {string} - URL for CSV export
 */
export const getExportUrl = (filters = {}) => {
  const { role, module, keyword } = filters;
  const params = new URLSearchParams();
  
  if (role) params.append('role', role);
  if (module) params.append('module', module);
  if (keyword) params.append('keyword', keyword);
  
  return `${API_URL}/export?${params.toString()}`;
};

// FAVORITES API

/**
 * Fetch user's favorites
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Array>} - Array of favorite use case IDs
 */
export const fetchFavorites = async (userId = DEFAULT_USER_ID) => {
  try {
    const response = await axios.get(`${API_URL}/favorites`, { params: { userId } });
    return response.data[userId] || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

/**
 * Add a solution to favorites
 * @param {string} useCaseId - Use case ID to add to favorites
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Updated favorites
 */
export const addFavorite = async (useCaseId, userId = DEFAULT_USER_ID) => {
  try {
    const response = await axios.post(`${API_URL}/favorites`, { useCaseId, userId });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

/**
 * Remove a solution from favorites
 * @param {string} useCaseId - Use case ID to remove from favorites
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Updated favorites
 */
export const removeFavorite = async (useCaseId, userId = DEFAULT_USER_ID) => {
  try {
    const response = await axios.delete(`${API_URL}/favorites/${useCaseId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

// ANNOTATIONS API

/**
 * Fetch user's annotations
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Object mapping use case IDs to annotations
 */
export const fetchAnnotations = async (userId = DEFAULT_USER_ID) => {
  try {
    const response = await axios.get(`${API_URL}/annotations`, { params: { userId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching annotations:', error);
    return {};
  }
};

/**
 * Add or update an annotation
 * @param {string} useCaseId - Use case ID to annotate
 * @param {string} text - Annotation text
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Updated annotations
 */
export const saveAnnotation = async (useCaseId, text, userId = DEFAULT_USER_ID) => {
  try {
    const response = await axios.post(`${API_URL}/annotations`, { useCaseId, text, userId });
    return response.data;
  } catch (error) {
    console.error('Error saving annotation:', error);
    throw error;
  }
};

/**
 * Remove an annotation
 * @param {string} useCaseId - Use case ID to remove annotation for
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Updated annotations
 */
export const removeAnnotation = async (useCaseId, userId = DEFAULT_USER_ID) => {
  try {
    const response = await axios.delete(`${API_URL}/annotations/${useCaseId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing annotation:', error);
    throw error;
  }
};

// RATINGS API

/**
 * Fetch user's ratings
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Object mapping use case IDs to ratings
 */
export const fetchRatings = async (userId = DEFAULT_USER_ID) => {
  try {
    const response = await axios.get(`${API_URL}/ratings`, { params: { userId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return {};
  }
};

/**
 * Add or update a rating
 * @param {string} useCaseId - Use case ID to rate
 * @param {number} rating - Rating value (e.g., 1-5)
 * @param {string} feedback - Optional feedback text
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Updated ratings
 */
export const saveRating = async (useCaseId, rating, feedback = '', userId = DEFAULT_USER_ID) => {
  try {
    const response = await axios.post(`${API_URL}/ratings`, { useCaseId, rating, feedback, userId });
    return response.data;
  } catch (error) {
    console.error('Error saving rating:', error);
    throw error;
  }
};

/**
 * Fetch ratings summary (aggregated ratings for all solutions)
 * @returns {Promise<Object>} - Object mapping use case IDs to rating summaries
 */
export const fetchRatingsSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/ratings/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ratings summary:', error);
    return {};
  }
};

// FILTER HISTORY API

/**
 * Fetch user's filter history
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Array>} - Array of filter history items
 */
export const fetchFilterHistory = async (userId = DEFAULT_USER_ID) => {
  try {
    const response = await axios.get(`${API_URL}/filter-history`, { params: { userId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching filter history:', error);
    return [];
  }
};

/**
 * Save a filter to history
 * @param {Object} filters - Filter parameters
 * @param {string} name - Optional name for the filter combination
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Updated filter history
 */
export const saveFilterToHistory = async (filters, name = '', userId = DEFAULT_USER_ID) => {
  try {
    const response = await axios.post(`${API_URL}/filter-history`, { filters, name, userId });
    return response.data;
  } catch (error) {
    console.error('Error saving filter to history:', error);
    throw error;
  }
};

// LOCAL STORAGE UTILITIES
// These functions provide a fallback for when the backend is not available

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Stored data or default value
 */
export const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};
