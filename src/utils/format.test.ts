import { describe, expect, it } from 'vitest';
import {
  formatConfidence,
  formatCost,
  formatElapsed,
  parseDate,
  shortBranchName,
  shortCommit,
} from './format';

describe('format utilities', () => {
  it('shortens branch refs', () => {
    expect(shortBranchName('refs/heads/feature/x')).toBe('feature/x');
    expect(shortBranchName('refs/tags/v1')).toBe('tags/v1');
    expect(shortBranchName('already-short')).toBe('already-short');
  });

  it('abbreviates commit ids and handles absence', () => {
    expect(shortCommit('abcdef1234567890')).toBe('abcdef12');
    expect(shortCommit(undefined)).toBeUndefined();
    expect(shortCommit(null)).toBeUndefined();
  });

  it('parses valid dates and rejects invalid', () => {
    expect(parseDate('2026-01-01T00:00:00Z')).toBeInstanceOf(Date);
    expect(parseDate('not-a-date')).toBeUndefined();
    expect(parseDate(undefined)).toBeUndefined();
  });

  it('formats cost, treating null as unavailable', () => {
    expect(formatCost(null)).toBe('Not available');
    expect(formatCost(0.12)).toContain('0.12');
  });

  it('formats confidence as a percentage', () => {
    expect(formatConfidence(0.855)).toBe('86%');
    expect(formatConfidence(null)).toBe('—');
  });

  it('formats elapsed time', () => {
    const base = 1_000_000;
    expect(formatElapsed(base, base + 45_000)).toBe('45s');
    expect(formatElapsed(base, base + 80_000)).toBe('1m 20s');
    expect(formatElapsed(base, base - 5_000)).toBe('0s');
  });
});
