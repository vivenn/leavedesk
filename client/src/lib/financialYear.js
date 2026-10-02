export function currentFinancialYear() {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
}

export function financialYearOptions(yearsBack = 1, yearsAhead = 1) {
  const startYear = Number(currentFinancialYear().slice(0, 4));
  const options = [];
  for (let year = startYear + yearsAhead; year >= startYear - yearsBack; year--) {
    options.push(`${year}-${year + 1}`);
  }
  return options;
}
