// Month is always stored/passed around as "YYYY-MM-01"
export function currentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function monthLabel(monthValue) {
  const [y, m] = monthValue.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Builds month options from January 2023 through the current month (newest first).
// Fixed start date instead of a rolling "last N months" count, so it always
// reaches back to Jan 2023 no matter when the dashboard is opened.
export function recentMonthOptions() {
  const opts = [];
  const now = new Date();
  const start = new Date(2023, 0, 1); // January 2023
  let d = new Date(now.getFullYear(), now.getMonth(), 1);

  while (d >= start) {
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    opts.push({ value, label: monthLabel(value) });
    d.setMonth(d.getMonth() - 1);
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
