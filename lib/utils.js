// Month is always stored/passed around as "YYYY-MM-01"
export function currentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

// Arabic month name, but forced to Western (0-9) digits for the year,
// e.g. "يوليو 2026" not "يوليو ٢٠٢٦".
export function monthLabel(monthValue) {
  const [y, m] = monthValue.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat('ar-u-nu-latn', { month: 'long', year: 'numeric' }).format(d);
}

// Builds the last N months (including current) as { value, label }
export function recentMonthOptions(count = 24) {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    opts.push({ value, label: monthLabel(value) });
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
