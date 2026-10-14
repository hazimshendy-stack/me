import { describe, it, expect } from 'vitest';
import { BUSINESS_FUNCTIONS, businessFunctionForSession } from '../domain/businessFunctions';

describe('seven business functions', () => {
  it('keeps source order and names', () => {
    expect(BUSINESS_FUNCTIONS.map((f) => f.name)).toEqual([
      'Sooq',
      'V2 Labs',
      'Money',
      'Legal',
      'People',
      'Operations & Production',
      'Data',
    ]);
  });
  it('rotates sequentially in successive sessions', () => {
    const seq = Array.from({ length: 9 }, (_, i) => businessFunctionForSession(i).name);
    expect(seq).toEqual([
      'Sooq',
      'V2 Labs',
      'Money',
      'Legal',
      'People',
      'Operations & Production',
      'Data',
      'Sooq',
      'V2 Labs',
    ]);
  });
  it('keeps DI as written (no invented expansion)', () => {
    const data = BUSINESS_FUNCTIONS.find((f) => f.name === 'Data')!;
    expect(data.scope).toMatch(/DI/);
    // Ensure we never expanded DI to a guessed meaning inside source.
    expect(data.scope).not.toMatch(/Data Integration|Data Intelligence/);
  });
});
