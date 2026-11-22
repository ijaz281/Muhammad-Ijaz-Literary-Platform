
import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (!config.headers) {
      config.headers = {};
    }

    // Public requests must never send a JWT.
    if (config.skipAuth) {
      if (typeof config.headers.set === "function") {
        config.headers.set("Authorization", false);
      } else {
        delete config.headers.Authorization;
        delete config.headers.authorization;
      }

      delete config.skipAuth;
      return config;
    }

    // Protected requests receive the saved access token.
    const token = localStorage.getItem("access_token");

    if (token) {
      if (typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      if (typeof config.headers.set === "function") {
        config.headers.delete("Authorization");
      } else {
        delete config.headers.Authorization;
        delete config.headers.authorization;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
