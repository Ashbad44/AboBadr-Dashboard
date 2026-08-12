// Month is always stored/passed around as "YYYY-MM-01"
export function currentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

// Shifts a "YYYY-MM-01" value by N months (negative = backward).
export function shiftMonth(monthValue, delta) {
  const [y, m] = monthValue.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

// Percentage change from `previous` to `current`, safe against divide-by-zero.
export function pctChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// Arabic month name, but forced to Western (0-9) digits for the year,
// e.g. "يوليو 2026" not "يوليو ٢٠٢٦".
export function monthLabel(monthValue) {
  const [y, m] = monthValue.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat('ar-u-nu-latn', { month: 'long', year: 'numeric' }).format(d);
}

// Builds every month from January of `minYear` up through the current month,
// newest first. Default goes back to January 2020.
export function recentMonthOptions(minYear = 2020) {
  const opts = [];
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), 1);
  const minDate = new Date(minYear, 0, 1);
  while (d >= minDate) {
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    opts.push({ value, label: monthLabel(value) });
    d = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  }
  return opts;
}

// Builds the last N years (including current) as plain numbers, newest first.
export function recentYearOptions(count = 6) {
  const now = new Date();
  const years = [];
  for (let i = 0; i < count; i++) {
    years.push(now.getFullYear() - i);
  }
  return years;
}

export function fmtMoney(n) {
  const num = Number(n) || 0;
  if (num === 0) return '-';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function toNumber(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

// Short Arabic month name (for chart axis labels), Western digits not needed here.
export function shortMonthLabel(monthValue) {
  const [y, m] = monthValue.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat('ar', { month: 'short' }).format(d);
}

// Whether a branch should appear for a given month, based on its optional
// valid_from / valid_until date-range fields (null = no bound on that side).
export function isBranchVisibleForMonth(branch, monthValue) {
  if (branch.valid_from && monthValue < branch.valid_from) return false;
  if (branch.valid_until && monthValue > branch.valid_until) return false;
  return true;
}
