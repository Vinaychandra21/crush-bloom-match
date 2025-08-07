import axios from "axios";

const axiosClient = axios.create({
  baseURL:  "http://localhost:8080", // Change to your backend URL
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
// Add a request interceptor
axiosClient.interceptors.request.use((config) => {
  const otpSessionId = sessionStorage.getItem("otpSessionId");
  if (otpSessionId) {
    config.headers["X-Otp-Session-Id"] = otpSessionId; // <-- Change header name to what your backend expects
    // Or: config.headers.Authorization = `Bearer ${otpSessionId}`;
  }
  return config;
}, (error) => Promise.reject(error));


export default axiosClient;
