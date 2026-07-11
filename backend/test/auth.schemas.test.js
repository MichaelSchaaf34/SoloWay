import { describe, expect, it } from 'vitest';
import {
  changePasswordSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../src/modules/auth/auth.schemas.js';

const strongPassword = 'SoloWay!2026secure';

describe('authentication validation schemas', () => {
  it('accepts a normalized registration payload with a strong password', () => {
    const { error, value } = registerSchema.body.validate({
      email: 'traveler@example.com',
      password: strongPassword,
      displayName: 'Solo Traveler',
    });

    expect(error).toBeUndefined();
    expect(value.email).toBe('traveler@example.com');
  });

  it.each([
    ['too short', 'Short!1'],
    ['missing uppercase', 'soloway!2026secure'],
    ['missing lowercase', 'SOLOWAY!2026SECURE'],
    ['missing number', 'SoloWay!SecurePass'],
    ['missing symbol', 'SoloWay2026Secure'],
  ])('rejects registration passwords that are %s', (_reason, password) => {
    const { error } = registerSchema.body.validate({
      email: 'traveler@example.com',
      password,
    });

    expect(error).toBeDefined();
  });

  it('requires email and reset tokens to be exactly 64 hexadecimal characters', () => {
    const validToken = 'a'.repeat(64);

    expect(verifyEmailSchema.body.validate({ token: validToken }).error).toBeUndefined();
    expect(resetPasswordSchema.body.validate({
      token: validToken,
      password: strongPassword,
    }).error).toBeUndefined();
    expect(verifyEmailSchema.body.validate({ token: 'not-a-token' }).error).toBeDefined();
    expect(resetPasswordSchema.body.validate({
      token: 'g'.repeat(64),
      password: strongPassword,
    }).error).toBeDefined();
  });

  it('requires a strong new password when changing a password', () => {
    const { error } = changePasswordSchema.body.validate({
      currentPassword: strongPassword,
      newPassword: 'weak-password',
    });

    expect(error).toBeDefined();
  });
});
