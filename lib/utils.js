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

export function fmtMoney(n) {
  const num = Number(n) || 0;
  if (num === 0) return '-';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function toNumber(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}
