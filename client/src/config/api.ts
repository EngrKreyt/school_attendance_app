/// <reference types="vite/client" />

// API configuration
const getBaseUrl = () => {
  // For development with Vite proxy
  if (import.meta.env.DEV) {
    // When running in development, use the current window location
    // This ensures it works on both localhost and when accessed from mobile devices
    return `http://${window.location.hostname}:5000`;
  }
  
  // For production or specific environments
  return import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${endpoint}`;
}; 