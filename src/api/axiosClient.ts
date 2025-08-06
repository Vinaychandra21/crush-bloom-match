import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080", // Change to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // If your backend uses cookies/sessions
});

// Optional: Global error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosClient;
