// API configuration
export const API_BASE_URL = 'http://192.168.93.12:5000';

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`; 