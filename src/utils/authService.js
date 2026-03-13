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

export function logout() {
  return apiRequest('/auth/logout', {
    method: 'POST',
    auth: true,
  });
}

export function getCurrentUser() {
  return apiRequest('/auth/me', {
    method: 'GET',
    auth: true,
    ignoreUnauthorized: true,
  });
}
