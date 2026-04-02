// src/tests/utils/commonUtils.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import dayjs from 'dayjs';
import { getBirthDateFromAge } from '@/utils/commonUtils';

describe('getBirthDateFromAge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return YYYY-MM-DD and subtract 45 days from the computed birth date (when birthDate is not after today)', () => {
    // Freeze time so tests are deterministic
    // Using a date where "today.set('year', today.year() - age)" will NOT be after today
    vi.setSystemTime(new Date('2026-01-05T12:00:00Z'));

    const age = 25;

    // Your implementation:
    // today = 2026-01-05
    // birthYear = 2001
    // birthDate = 2001-01-05
    // birthDate.isAfter(today) => false
    // return birthDate.subtract(45, 'day') => 2000-11-21
    const result = getBirthDateFromAge(age);

    expect(result).toBe('2000-11-21');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should always return YYYY-MM-DD format', () => {
    vi.setSystemTime(new Date('2026-12-31T23:59:59Z'));

    const result = getBirthDateFromAge(1);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should match a computed expectation using dayjs math (guards against timezone surprises)', () => {
    vi.setSystemTime(new Date('2026-01-05T12:00:00Z'));

    const age = 25;

    // Build expected using same dayjs rules as production, but explicitly in test
    const expected = dayjs('2026-01-05T12:00:00Z')
      .set('year', 2026 - age)
      .subtract(45, 'day')
      .format('YYYY-MM-DD');

    expect(getBirthDateFromAge(age)).toBe(expected);
  });
});
