export function getFinancialYear(date = new Date()) {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month >= 3) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function getDatesBetween(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Request dates arrive as UTC-midnight Date objects (Joi) or 'YYYY-MM-DD' strings
export function formatDisplayDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDayCount(days) {
  return `${days} day${Number(days) === 1 ? '' : 's'}`;
}
