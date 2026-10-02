import { calculateLeaveDays } from '../../modules/leave-request/sandwich-leave.helper.js';

// 2026-12-04 is a Friday, 2026-12-07 a Monday
describe('calculateLeaveDays (sandwich leave policy)', () => {
  test('Friday to Monday counts the weekend in between (4 days)', () => {
    expect(calculateLeaveDays('2026-12-04', '2026-12-07', [])).toBe(4);
  });

  test('a single working day counts as 1', () => {
    expect(calculateLeaveDays('2026-12-02', '2026-12-02', [])).toBe(1);
  });

  test('Monday to Friday counts 5 working days', () => {
    expect(calculateLeaveDays('2026-11-30', '2026-12-04', [])).toBe(5);
  });

  test('leading and trailing weekends are not counted', () => {
    // Saturday 2026-12-05 to Tuesday 2026-12-08 -> only Mon + Tue
    expect(calculateLeaveDays('2026-12-05', '2026-12-08', [])).toBe(2);
  });

  test('a range of only weekend days counts 0', () => {
    expect(calculateLeaveDays('2026-12-05', '2026-12-06', [])).toBe(0);
  });

  test('a holiday sandwiched between leave days is counted', () => {
    // Tue 2026-12-01 holiday between Mon and Wed
    expect(calculateLeaveDays('2026-11-30', '2026-12-02', ['2026-12-01'])).toBe(3);
  });

  test('a holiday at the edge of the range is not counted', () => {
    // Mon 2026-11-30 is a holiday, leave continues Tue-Wed
    expect(calculateLeaveDays('2026-11-30', '2026-12-02', ['2026-11-30'])).toBe(2);
  });

  test('an end date before the start date counts 0', () => {
    expect(calculateLeaveDays('2026-12-07', '2026-12-04', [])).toBe(0);
  });
});
