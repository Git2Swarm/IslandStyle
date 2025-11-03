import { describe, expect, it } from 'vitest';
import { config } from '../src/config.js';

describe('configuration', () => {
  it('falls back to defaults when env missing', () => {
    expect(config.port).toBeGreaterThan(0);
    expect(config.redisUrl).toContain('redis://');
  });
});
