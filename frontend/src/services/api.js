import { apiBaseUrl } from '../config';

// Example API function
export const fetchData = async (endpoint) => {
  try {
    const response = await fetch(`${apiBaseUrl}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// Add other API functions as needed
