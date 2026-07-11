import { apiRequest } from './apiClient';

export function register(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function login(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function refreshToken(refreshTokenValue) {
  return apiRequest('/auth/refresh', {
    method: 'POST',
    body: { refreshToken: refreshTokenValue },
    ignoreUnauthorized: true,
  });
}

export function logout(refreshTokenValue) {
  return apiRequest('/auth/logout', {
    method: 'POST',
    body: { refreshToken: refreshTokenValue },
    ignoreUnauthorized: true,
  });
}

export function getCurrentUser() {
  return apiRequest('/auth/me', {
    method: 'GET',
    auth: true,
    ignoreUnauthorized: true,
  });
}

export function verifyEmail(token) {
  return apiRequest('/auth/verify-email', {
    method: 'POST',
    body: { token },
  });
}

export function resendVerification(email) {
  return apiRequest('/auth/resend-verification', {
    method: 'POST',
    body: { email },
  });
}

export function forgotPassword(email) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export function resetPassword(token, password) {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });
}

export function changePassword(currentPassword, newPassword) {
  return apiRequest('/auth/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword },
    auth: true,
  });
}
