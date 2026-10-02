import { getDatesBetween, isWeekend } from '../../shared/utils/date.js';

export function calculateLeaveDays(startDate, endDate, holidayDates) {
  const dates = getDatesBetween(startDate, endDate);
  if (dates.length === 0) return 0;

  const holidaySet = new Set(
    holidayDates.map((d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
    })
  );

  const isHoliday = (date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return holidaySet.has(key);
  };

  const isNonWorking = (date) => isWeekend(date) || isHoliday(date);

  let firstWorking = -1;
  let lastWorking = -1;
  for (let i = 0; i < dates.length; i++) {
    if (!isNonWorking(dates[i])) {
      if (firstWorking === -1) firstWorking = i;
      lastWorking = i;
    }
  }

  if (firstWorking === -1) return 0;

  let count = 0;
  for (let i = firstWorking; i <= lastWorking; i++) {
    count++;
  }

  return count;
}
