import axios from "axios";
import { getToken } from "./token";
import { API_BASE_URL } from "./api";

// Session management utilities
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
let inactivityTimer;

// Initialize session timeout tracking
const initSessionTimeout = () => {
  resetInactivityTimer();
  window.addEventListener("mousemove", resetInactivityTimer);
  window.addEventListener("keypress", resetInactivityTimer);
};

// const resetInactivityTimer = () => {
//   clearTimeout(inactivityTimer);
//   inactivityTimer = setTimeout(logoutUser, SESSION_TIMEOUT);
// };

const logoutUser = () => {
  localStorage.removeItem("admin");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
};

// Initialize when this module loads
// initSessionTimeout();

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  maxBodyLength: Infinity,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = token;
    }
    resetInactivityTimer(); // Reset timeout on any API request
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    resetInactivityTimer(); // Reset timeout on successful response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check for token refresh scenario
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/refresh-token`, {
          refreshToken: localStorage.getItem("refreshToken")
        });
        
        localStorage.setItem("admin", refreshResponse.data.token);
        localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
        
        originalRequest.headers.Authorization = getToken();
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - proceed to logout
      }
    }
    
    // // Handle session expiration
    // if (
    //   error.response &&
    //   error.response.status === 401 &&
    //   error.response.data?.message === "Session expired. Please log in again."
    // ) {
    //   console.error("Session expired");
    //   logoutUser();
    //   return Promise.reject({
    //     sessionExpired: true,
    //     message: "Session expired. Please log-in again.",
    //   });
    // }
    
    return Promise.reject(error);
  }
);

// API methods
const GET = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const ADD = async (endpoint, data) => {
  try {
    const response = await apiClient.post(endpoint, data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const ADDMulti = async (url, data) => {
  try {
    const response = await apiClient.post(url, data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const UPDATE = async (endpoint, data) => {
  try {
    const response = await apiClient.post(endpoint, data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const DELETE = async (endpoint, data) => {
  try {
    const response = await apiClient.post(endpoint, data, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const UPLOAD = async (url, data) => {
  try {
    const response = await apiClient.post(url, data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { 
  GET, 
  ADD, 
  DELETE, 
  UPDATE, 
  UPLOAD, 
  ADDMulti,
  logoutUser, // Export logout for manual triggers
  resetInactivityTimer // Export for explicit resets
};