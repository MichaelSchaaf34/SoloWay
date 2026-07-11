import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/config/index.js', () => ({
  config: {
    env: 'test',
    email: {
      resendApiKey: 're_test_key',
      from: 'SoloWay <onboarding@resend.dev>',
    },
  },
}));

import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '../src/shared/email/mailer.js';

describe('transactional auth email templates', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 'email-1' }),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a branded verification email with button and fallback link', async () => {
    const url = 'https://app.soloway.test/verify-email?token=abc123';
    await sendVerificationEmail('traveler@example.com', url);

    const [, request] = fetch.mock.calls[0];
    const payload = JSON.parse(request.body);
    expect(request.headers.Authorization).toBe('Bearer re_test_key');
    expect(payload).toMatchObject({
      from: 'SoloWay <onboarding@resend.dev>',
      to: ['traveler@example.com'],
      subject: 'Verify your SoloWay email',
    });
    expect(payload.html).toContain('Travel solo, not alone.');
    expect(payload.html.match(new RegExp(url.replace('?', '\\?'), 'g'))).toHaveLength(2);
    expect(payload.text).toContain(url);
  });

  it('sends a one-hour, one-time password reset message', async () => {
    const url = 'https://app.soloway.test/reset-password?token=reset123';
    await sendPasswordResetEmail('traveler@example.com', url);

    const payload = JSON.parse(fetch.mock.calls[0][1].body);
    expect(payload.subject).toBe('Reset your SoloWay password');
    expect(payload.text).toContain('expires in one hour');
    expect(payload.text).toContain(url);
  });
});
