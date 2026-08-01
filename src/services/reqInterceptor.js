import axios from "axios";

// Vite ya CRA dono mein se jo available ho wo utha lega
let BASE_URL = (import.meta && import.meta.env && (import.meta.env.VITE_AZURE_BASE_URL || import.meta.env.VITE_API_BASE_URL)) ||
  (import.meta.env && (import.meta.env.VITE_AZURE_BASE_URL || import.meta.env.VITE_API_BASE_URL));

// Guard against missing, empty, or literally "undefined" string config
if (!BASE_URL || BASE_URL === "undefined") {
  BASE_URL = "";
  console.warn("API Base URL was missing or 'undefined' in environment variables.");
}

const api = axios.create({
  baseURL: BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`,
  withCredentials: true,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // Add header to bypass ngrok browser warning
    config.headers["ngrok-skip-browser-warning"] = "69420";

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    const newAccessToken = response.headers["x-access-token"];
    if (newAccessToken) {
      localStorage.setItem("accessToken", newAccessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // Determine if the error is due to network issues or server being down
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK';
    const isServerError = error.response && error.response.status >= 500;

    // If it's a network/server error and we haven't already retried
    if ((isNetworkError || isServerError) && config && !config._retry) {
      let FALLBACK_URL = (import.meta && import.meta.env && import.meta.env.VITE_LOCAL_BASE_URL) ||
        (import.meta.env && import.meta.env.VITE_LOCAL_BASE_URL);

      if (FALLBACK_URL) {
        const formattedFallbackUrl = FALLBACK_URL.endsWith('/') ? FALLBACK_URL : `${FALLBACK_URL}/`;

        if (config.baseURL !== formattedFallbackUrl) {
          config._retry = true;
          console.warn(`Primary backend failed. Switching to fallback URL: ${formattedFallbackUrl}`);

          // Update the default baseURL for future requests
          api.defaults.baseURL = formattedFallbackUrl;
          // Update the current request's baseURL
          config.baseURL = formattedFallbackUrl;

          // Retry the request
          return api(config);
        }
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];
    }
    return Promise.reject(error);
  }
);

export default api;
