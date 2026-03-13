import { describe, it, expect } from 'vitest';
import { config } from '../src/config/index.js';

describe('backend smoke', () => {
  it('loads configuration defaults', () => {
    expect(config).toBeTruthy();
    expect(typeof config.env).toBe('string');
    expect(typeof config.port).toBe('number');
    expect(typeof config.apiVersion).toBe('string');
  });
});
