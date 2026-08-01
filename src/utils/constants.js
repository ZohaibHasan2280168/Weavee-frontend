// constants.js
const getBaseUrl = () => {
  let url;

  // Check for Vite
  if (import.meta && import.meta.env && (import.meta.env.VITE_AZURE_BASE_URL || import.meta.env.VITE_API_BASE_URL)) {
    url = import.meta.env.VITE_AZURE_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  }
  // Check for Create React App
  else if (import.meta.env && (import.meta.env.VITE_AZURE_BASE_URL || import.meta.env.VITE_API_BASE_URL)) {
    url = import.meta.env.VITE_AZURE_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  }
  // Check for import.meta.env.VITE (sometimes used in hybrid setups)
  else if (import.meta.env && (import.meta.env.VITE_AZURE_BASE_URL || import.meta.env.VITE_API_BASE_URL)) {
    url = import.meta.env.VITE_AZURE_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  }

  // Fallback if not configured or resolved as string 'undefined'
  if (!url || url === "undefined") {
    console.warn("API Base URL was missing or 'undefined' in environment variables.");
    return "";
  }

  return url;
};

export const API_BASE = getBaseUrl();
export default API_BASE;
