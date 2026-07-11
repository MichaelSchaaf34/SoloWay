import { apiRequest } from './apiClient';

export function getMyProvider() {
  return apiRequest('/providers/me', { auth: true });
}

export function createProviderOnboardingLink(displayName) {
  return apiRequest('/providers/onboarding-link', {
    method: 'POST',
    body: displayName ? { displayName } : {},
    auth: true,
  });
}
