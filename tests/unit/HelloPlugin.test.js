import { describe, it, expect } from 'vitest';

describe('Hello feature', () => {
  it('should fail intentionally to show CI failure', () => {
    expect(1 + 1).toBe(3); // intentionally wrong
  });
});
