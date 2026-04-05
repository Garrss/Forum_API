import { describe, it, expect } from 'vitest';
import DomainErrorTranslator from '../../src/Commons/exceptions/DomainErrorTranslator.js';
import InvariantError from '../../src/Commons/exceptions/InvariantError.js';

describe('DomainErrorTranslator', () => {
  it('should translate known domain errors to InvariantError', () => {
    const error = new Error('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    const translated = DomainErrorTranslator.translate(error);
    expect(translated).toBeInstanceOf(InvariantError);
  });

  it('should return original error when not in directory', () => {
    const error = new Error('SOME_UNKNOWN_ERROR');
    const translated = DomainErrorTranslator.translate(error);
    expect(translated).toBe(error);
  });

  it('should translate all registered domain error keys', () => {
    const keys = Object.keys(DomainErrorTranslator._directories);
    keys.forEach((key) => {
      const translated = DomainErrorTranslator.translate(new Error(key));
      expect(translated).toBeInstanceOf(InvariantError);
    });
  });
});
