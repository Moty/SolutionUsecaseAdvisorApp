// This file configures API URLs based on environment
const config = {
  development: {
    // In development, point to explicit localhost URL
    apiUrl: 'http://localhost:5000/api',
  },
  production: {
    // In production, use relative URL path
    // This ensures it works regardless of the host domain
    apiUrl: '/api',
  },
};

const environment = process.env.NODE_ENV || 'development';
export const apiBaseUrl = config[environment].apiUrl;
