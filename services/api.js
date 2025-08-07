import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Environment configuration
const PROD_URL = "https://artpriyo-backend.onrender.com/api/";
const DEV_URL = "http://10.227.195.115:8080/api/";

// Set the base URL based on the environment
const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

console.log("Base URL:", BASE_URL);

// Log configuration info
console.log(`API configured with withCredentials: true (for cookie handling)`);

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Platform: Platform.OS,
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add the token to headers
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("adminToken");
    if (token) {
      console.log("Token found:", token);

      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No token found, proceeding without it.");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Refresh token interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error response exists and status is 401
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        console.log("Attempting to refresh token...");

        // Get the stored refresh token from AsyncStorage
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (!refreshToken) {
          console.log("No refresh token found in AsyncStorage");
          return Promise.reject(error);
        }

        // Make the refresh token request with refresh token in body and headers
        const res = await axiosInstance.post(
          "/admin/refresh-token",
          { refreshToken }, // Include in body
          {
            withCredentials: true, // Also send cookies if available
            headers: {
              Authorization: `Bearer ${refreshToken}`, // Also include in Authorization header
            },
          }
        );

        if (res.data && res.data.accessToken) {
          const newToken = res.data.accessToken;
          console.log("Token refresh successful");

          // Save new access token using AsyncStorage
          await AsyncStorage.setItem("adminToken", newToken);

          // Update authorization header for all future requests
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newToken}`;

          // Update authorization header for the retry request
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          // Use the same axiosInstance for consistency
          return axiosInstance(originalRequest);
        } else {
          // Token refresh failed with unexpected response format
          console.log("Token refresh failed: Invalid response format");
          await AsyncStorage.removeItem("adminToken"); // Clear invalid token
          // Handle logout or redirect to login screen here
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.log("Token refresh failed:", refreshError);
        console.log("Response status:", refreshError.response?.status);
        console.log("Error message:", refreshError.message);

        // Check if refresh token is expired (specific error code or message)
        if (
          refreshError.response &&
          (refreshError.response.status === 401 ||
            refreshError.response.status === 403)
        ) {
          // Refresh token expired or invalid
          console.log("Clearing tokens due to expired refresh token");
          await AsyncStorage.removeItem("adminToken"); // Clear token
          // Handle logout or redirect to login screen here
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Console log all the async storage keys with the values for debugging
const logAsyncStorageKeys = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const values = await AsyncStorage.multiGet(keys);
    const keyValuePairs = Object.fromEntries(values);
    console.log("AsyncStorage Keys and Values:", keyValuePairs);
  } catch (error) {
    console.error("Error fetching AsyncStorage keys:", error);
  }
};
logAsyncStorageKeys();

/*
List of services:
- Auth Service: checkToken, register, login.
- Event Service: createEvent.
- Post Service: createPost, getAllPosts, getUserPosts, getCommentsCount.
- User Service: getUserByToken, checkUsername, updateUser, forgotPassword, verifyOTP, resetPassword.
*/

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.response ? error.response.data : error.message
    );
    return Promise.reject(error);
  }
);

// Auth Service
const authService = {
  // Check Token
  checkToken: async () => {
    return axiosInstance.get("/auth/check-token");
  },

  // Register
  register: async (data) => {
    return axiosInstance.post("/auth/register", data);
  },

  // Login
  login: async (data) => {
    return axiosInstance.post("/admin/login", data, { withCredentials: true });
  },

  // Get API base URL
  getBaseUrl: () => {
    return BASE_URL;
  },
};

// Event Service
const eventService = {
  // Create a new event
  createEvent: async (data) => {
    return axiosInstance.post("/event/create-event", data);
  },

  // Get all events
  getAllEvents: async () => {
    return axiosInstance.get("/event/get-events");
  },
  // Start an event
  startEvent: async (id) => {
    return axiosInstance.post(`/event/update-status/ongoing/${id}`);
  },

  // Delete an event
  deleteEvent: async (id) => {
    return axiosInstance.delete(`/event/delete-event/${id}`);
  },
  // Edit an event
  editEvent: async (eventId, data) => {
    return axiosInstance.put(`/event/update-event/${eventId}`, data);
  },


  // Get event leaderboard
  getEventLeaderboard: async (eventId) => {
    return axiosInstance.get(`/event/get-event-leaderboard/${eventId}`);
  },
};

// Posts Services
const postService = {
  createPost: async (data) => {
    return axiosInstance.post("/post/create-post", data);
  },
  getAllPosts: async (page, limit) => {
    return axiosInstance.get(`/post/get-all-posts?page=${page}&limit=${limit}`);
  },
  getUserPosts: async (userId) => {
    return axiosInstance.get(`/post/user-posts/${userId}`);
  },

  // Get comments count for a post
  getCommentsCount: async (postId) => {
    return axiosInstance.get(`/post/comments/${postId}`);
  },

  getReportedPosts: async (page, limit) => {
    return axiosInstance.get(
      `/post/reports`
    );
  },

  sendActionReports: async (postId, action, reason) => {
    return axiosInstance.post(`/post/reports/${postId}`, { action, reason });
  }
};

// Transaction Service
const transactionService = {
  // Get all transactions
  getAllTransactions: async (params) => {
    // Build query string from params
    const queryParams = new URLSearchParams();

    // Add all parameters to query string
    if (params) {
      Object.keys(params).forEach((key) => {
        queryParams.append(key, params[key]);
      });
    }

    const queryString = queryParams.toString();
    const url = `/v1/transactions/admin/get-transactions${
      queryString ? `?${queryString}` : ""
    }`;

    console.log("API Request URL:", url);
    return axiosInstance.get(url);
  },
};

// User Service
const userService = {
  // Get user details by token
  getUserByToken: async () => {
    return axiosInstance.get(`/auth/userDetails`);
  },

  checkUsername: async (userName) => {
    return axiosInstance.post("/auth/check-username-registration", {
      userName,
    });
  },

  // Update user details
  updateUser: async (data) => {
    return axiosInstance.put("/auth/update-user", data);
  },

  //   Forgot Password
  forgotPassword: async (data) => {
    return axiosInstance.post("/admin/forgot-password", data);
  },
  //   Verify OTP
  verifyOTP: async (data) => {
    return axiosInstance.post("/admin/verify-otp", data);
  },
  //   Reset Password
  resetPassword: async (data) => {
    return axiosInstance.post("/admin/reset-password", data);
  },
};

// Admin Service
const adminService = {
  // Get all administrators
  getAllAdmins: async () => {
    return axiosInstance.get("/admin/list");
  },

  // Add administrator
  addAdmin: async (data) => {
    return axiosInstance.post("/admin/add", data);
  },

  // Update admin role/permissions
  updateAdminRole: async (adminId, data) => {
    return axiosInstance.put(`/admin/${adminId}/role`, data);
  },

  // Verify OTP
  verifyOTP: async (data) => {
    return axiosInstance.post("/admin/verify-otp", data);
  },
};

const userManagementService = {
  getUsers: async (page, limit) => {
    return axiosInstance.get(`/v1/auth/users?page=${page}&limit=${limit}`);
  },
  actionUser: async (userId, action, reason) => {
    return axiosInstance.post(`/v1/auth/banning/${userId}`, { banStatus: action, reason });
  },
};

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/user/sendotp",
  RESETPASSTOKEN_API: BASE_URL + "/user/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/user/reset-password",

  // By Ankan
  LOGIN_API: BASE_URL + "/auth/login",
  SIGNUP_API: BASE_URL + "/auth/register",
  SINGLE_USER_API: BASE_URL + "/auth/userDetails",
  USER_BY_ID_API: BASE_URL + "/auth/user",
  UPDATE_USER_API: BASE_URL + "/auth/update-user",
  UPDATE_BALANCE_API: BASE_URL + "/auth/update-balance",
  CHECK_USERNAME_API: BASE_URL + "/auth/check-username",
  CHANGE_EMAIL_API: BASE_URL + "/auth/change-email",
  CHANGE_PASSWORD: BASE_URL + "/auth/change/password",

  // Post Endpoints
  CREATE_POST_API: BASE_URL + "/post/create-post",
  GET_ALL_POSTS_API: BASE_URL + "/post/get-all-posts",
  GET_USER_POSTS_API: BASE_URL + "/post/user-posts",

  // Token checking
  TOKEN_CHECK_API: "/auth/check-token",

  // Transactions
  TRANSACTION_ADD_API: BASE_URL + "/transactions/add-transaction",
  TRANSACTION_GET_API: BASE_URL + "/transactions/get-transactions",

  SEARCH_API: `${BASE_URL}/auth/search`,
  ACCEPT_CONNECTION: BASE_URL + "/user/acceptFriend",
  CONNECT_FRIEND: BASE_URL + "/user/connectFriend",
  DELETE_REQUESTED_CONNECTION: BASE_URL + "/user/delete/request/connection",
};

export const eventEndPoints = {
  GET_ALL_EVENTS: BASE_URL + "/user/fetch/eventTypes",
  FETCH_EVENTS: BASE_URL + "/user/fetch/events",
  FETCH_ONGOING_EVENTS: BASE_URL + "/user/ongoing/events",
  FETCH_CONNECTIONS: BASE_URL + "/user/fetch/connections",
  FETCH_RANDOM_USERS: BASE_URL + "/user/fetch/random/users",
  JOIN_EVENT: BASE_URL + "/event/join-event",
};

export default apiService = {
  authService,
  postService,
  userService,
  eventService,
  transactionService,
  adminService,
  userManagementService,
};
