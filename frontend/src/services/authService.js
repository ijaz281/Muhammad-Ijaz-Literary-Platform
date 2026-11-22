import api from "./api";

export async function loginUser(credentials) {
  const response = await api.post("/api/auth/token/", credentials, { skipAuth: true });
  return response.data;
}

export async function registerUser(userData) {
  const response = await api.post("/api/auth/register/", userData, { skipAuth: true });
  return response.data;
}

export async function verifySignupOTP(payload) {
  const response = await api.post("/api/auth/verify-signup/", payload, { skipAuth: true });
  return response.data;
}

export async function verifyLoginOTP(payload) {
  const response = await api.post("/api/auth/verify-login/", payload, { skipAuth: true });
  if (response.data.access) localStorage.setItem("access_token", response.data.access);
  if (response.data.refresh) localStorage.setItem("refresh_token", response.data.refresh);
  return response.data;
}

export async function resendOTP(challenge_id) {
  const response = await api.post("/api/auth/otp/resend/", { challenge_id }, { skipAuth: true });
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/api/auth/me/");
  return response.data;
}

export async function updateCurrentUser(userData) {
  const response = await api.patch("/api/auth/me/", userData);
  return response.data;
}

export function logoutUser() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("access_token"));
}
