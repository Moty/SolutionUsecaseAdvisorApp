import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';
export const DEFAULT_USER_ID = 'default'; // In a real app, this would be the authenticated user's ID

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
    
    console.log('Fetching solutions with params:', params);
    console.log('API URL used:', `${API_URL}/solutions`);
    
    try {
      const response = await axios.get(`${API_URL}/solutions`, { params });
      console.log('API response data:', response.data);
      return response.data;
    } catch (axiosError) {
      // Log detailed error information
      console.error('API request failed with status:', axiosError.response?.status);
      console.error('Error response data:', axiosError.response?.data);
      console.error('Error config:', axiosError.config);
      
      // Re-throw the error to be handled by the caller
      throw axiosError;
    }
  } catch (error) {
    console.error('Error in fetchSolutions function:', error);
    
    // If solutions can't be loaded, try returning data from sample file
    try {
      // This is a fallback mechanism - create a mock array with error information
      return [{ 
        'Use Case ID': 'ERROR_01',
        'Use Case Name': 'Error loading data',
        'User Role': 'All roles',
        'Challenge': `Failed to load data: ${error.message}`,
        'Key Benefits': 'Please check if the backend server is running and MongoDB is connected.'
      }];
    } catch (fallbackError) {
      console.error('Even fallback mechanism failed:', fallbackError);
      return [];
    }
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
  const localStorageKey = `favorites_${userId}`;
  
  try {
    // Try to fetch from API
    const response = await axios.get(`${API_URL}/favorites`, { params: { userId } });
    const favoritesArray = response.data[userId] || [];
    
    // Save to local storage as backup
    saveToLocalStorage(localStorageKey, favoritesArray);
    
    return favoritesArray;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    
    // Try to load from local storage as fallback
    const localFavorites = loadFromLocalStorage(localStorageKey, []);
    console.log('Loaded favorites from local storage:', localFavorites);
    
    return localFavorites;
  }
};

/**
 * Add a solution to favorites
 * @param {string} useCaseId - Use case ID to add to favorites
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Updated favorites
 */
export const addFavorite = async (useCaseId, userId = DEFAULT_USER_ID) => {
  const localStorageKey = `favorites_${userId}`;
  
  try {
    const response = await axios.post(`${API_URL}/favorites`, { useCaseId, userId });
    
    // Save to local storage as backup
    saveToLocalStorage(localStorageKey, response.data.favorites || []);
    
    return response.data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    
    // Fallback to local storage if API fails
    try {
      const currentFavorites = loadFromLocalStorage(localStorageKey, []);
      if (!currentFavorites.includes(useCaseId)) {
        const updatedFavorites = [...currentFavorites, useCaseId];
        saveToLocalStorage(localStorageKey, updatedFavorites);
        return { favorites: updatedFavorites };
      }
      return { favorites: currentFavorites };
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      throw error; // Re-throw the original error
    }
  }
};

/**
 * Remove a solution from favorites
 * @param {string} useCaseId - Use case ID to remove from favorites
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Updated favorites
 */
export const removeFavorite = async (useCaseId, userId = DEFAULT_USER_ID) => {
  const localStorageKey = `favorites_${userId}`;
  
  try {
    const response = await axios.delete(`${API_URL}/favorites/${useCaseId}`, {
      params: { userId }
    });
    
    // Save to local storage as backup
    saveToLocalStorage(localStorageKey, response.data.favorites || []);
    
    return response.data;
  } catch (error) {
    console.error('Error removing favorite:', error);
    
    // Fallback to local storage if API fails
    try {
      const currentFavorites = loadFromLocalStorage(localStorageKey, []);
      const updatedFavorites = currentFavorites.filter(id => id !== useCaseId);
      saveToLocalStorage(localStorageKey, updatedFavorites);
      return { favorites: updatedFavorites };
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      throw error; // Re-throw the original error
    }
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
