import { getFinancialYear, formatDisplayDate, formatDayCount } from '../../shared/utils/date.js';

describe('getFinancialYear (April–March)', () => {
  test.each([
    [new Date(2026, 3, 1), '2026-2027'],
    [new Date(2026, 11, 31), '2026-2027'],
    [new Date(2027, 0, 15), '2026-2027'],
    [new Date(2027, 2, 31), '2026-2027'],
    [new Date(2027, 3, 1), '2027-2028']
  ])('%s -> %s', (date, expected) => {
    expect(getFinancialYear(date)).toBe(expected);
  });
});

describe('formatDisplayDate', () => {
  test('formats ISO date strings and UTC-midnight Date objects identically', () => {
    expect(formatDisplayDate('2026-12-01')).toBe('01 Dec 2026');
    expect(formatDisplayDate(new Date('2026-12-01'))).toBe('01 Dec 2026');
  });
});

describe('formatDayCount', () => {
  test.each([
    [1, '1 day'],
    [2, '2 days'],
    [0.5, '0.5 days'],
    ['1', '1 day']
  ])('%p -> %s', (days, expected) => {
    expect(formatDayCount(days)).toBe(expected);
  });
});
