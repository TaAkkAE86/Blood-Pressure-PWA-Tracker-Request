export const KEY = 'pulsequest-v2';
export const DAY = 864e5;
export const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (t) => { const d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
export const fmtDate = (t, loc) => new Date(t).toLocaleDateString(loc, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
export const fmtTime = (t, loc) => new Date(t).toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
export const fmtHM = (t, loc) => new Date(t).toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
export const fmtShort = (t, loc) => new Date(t).toLocaleDateString(loc, { month: 'short', day: 'numeric' });
export const levelOf = (exp) => Math.floor(exp / 100) + 1;
export const avg = (a) => a.reduce((s, x) => s + x, 0) / (a.length || 1);
export const sd = (a) => { const m = avg(a); return Math.sqrt(avg(a.map((x) => (x - m) ** 2))); };

export const CATS = {
  low: { key: 'low', color: '#38bdf8', emoji: '💧' },
  normal: { key: 'normal', color: '#34d399', emoji: '💚' },
  elevated: { key: 'elevated', color: '#facc15', emoji: '⚠️' },
  stage1: { key: 'stage1', color: '#fb923c', emoji: '🟠' },
  stage2: { key: 'stage2', color: '#f43f5e', emoji: '🔴' },
  crisis: { key: 'crisis', color: '#ef4444', emoji: '🚨' },
};
export function classify(s, d) {
  if (s > 180 || d > 120) return CATS.crisis;
  if (s >= 140 || d >= 90) return CATS.stage2;
  if (s >= 130 || d >= 80) return CATS.stage1;
  if (s < 90 || d < 60) return CATS.low;
  if (s >= 120) return CATS.elevated;
  return CATS.normal;
}
export function hrStatus(h) {
  if (h < 60) return { key: 'low', color: '#38bdf8' };
  if (h <= 100) return { key: 'normal', color: '#34d399' };
  return { key: 'high', color: '#f43f5e' };
}
export const trafficColor = (c) => ({ normal: '#34d399', low: '#38bdf8', elevated: '#facc15', stage1: '#fb923c' }[c.key] || '#f43f5e');

export const BADGES = [
  { id: 'first', icon: '🩺', test: (s) => s.logs.length >= 1 },
  { id: 's3', icon: '🔥', test: (s) => s.streak >= 3 },
  { id: 's7', icon: '⚡', test: (s) => s.streak >= 7 },
  { id: 'l10', icon: '📈', test: (s) => s.logs.length >= 10 },
  { id: 'g5', icon: '💚', test: (s) => s.logs.filter((l) => classify(l.sys, l.dia).key === 'normal').length >= 5 },
  { id: 'tag', icon: '🏷️', test: (s) => new Set(s.logs.map((l) => l.tag).filter(Boolean)).size >= 3 },
  { id: 'lv3', icon: '🏆', test: (s) => levelOf(s.exp) >= 3 },
];
export const earnedIds = (s) => BADGES.filter((b) => b.test(s)).map((b) => b.id);

export function seed() {
  const now = new Date();
  const mk = (d, h, m, sys, dia, hr, tag, i) => ({
    id: 'seed' + i, ts: new Date(now.getFullYear(), now.getMonth(), now.getDate() - d, h, m).getTime(), sys, dia, hr, tag,
  });
  const logs = [
    mk(6, 8, 10, 128, 82, 74, 'Morning', 1), mk(5, 21, 30, 134, 86, 78, 'Before Bed', 2),
    mk(4, 7, 45, 122, 78, 70, 'Morning', 3), mk(3, 8, 20, 118, 76, 68, 'Morning', 4),
    mk(2, 19, 0, 142, 91, 96, 'After Exercise', 5), mk(1, 7, 50, 119, 77, 69, 'Morning', 6),
    mk(1, 21, 15, 124, 80, 72, 'Before Bed', 7),
  ];
  return { logs, exp: 175, streak: 6, lastDay: dayKey(Date.now() - DAY) };
}
export function load() {
  for (const k of [KEY, 'pulsequest-v1']) {
    try { const raw = localStorage.getItem(k); if (raw) { const s = JSON.parse(raw); if (s && Array.isArray(s.logs)) return s; } } catch (e) {}
  }
  return seed();
}
export function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
export function effStreak(s) {
  const t = dayKey(Date.now()), y = dayKey(Date.now() - DAY);
  return s.lastDay === t || s.lastDay === y ? s.streak : 0;
}

export function buildCSV(logs, t) {
  const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  const rows = [[t('csv.date'), t('csv.time'), t('csv.sys'), t('csv.dia'), t('csv.hr'), t('csv.cat'), t('csv.note')]];
  [...logs].sort((a, b) => b.ts - a.ts).forEach((l) => {
    const d = new Date(l.ts);
    rows.push([dayKey(l.ts), pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()), l.sys, l.dia, l.hr, t('cats.' + classify(l.sys, l.dia).key + '.label'), l.tag || '']);
  });
  return '\uFEFF' + rows.map((r) => r.map(q).join(',')).join('\r\n'); // BOM so Excel reads UTF-8 (incl. Thai)
}
export async function exportCSV(logs, t) {
  const name = 'pulsequest-' + dayKey(Date.now()) + '.csv';
  const blob = new Blob([buildCSV(logs, t)], { type: 'text/csv;charset=utf-8;' });
  try {
    const file = new File([blob], name, { type: 'text/csv' });
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'PulseQuest' });
      return;
    }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function getInsights(logs, t, loc) {
  if (logs.length < 3) return [{ icon: '🧪', text: t('ins.few') }];
  const out = [];
  const sys = logs.map((l) => l.sys), hr = logs.map((l) => l.hr);
  const s = sd(sys), sdTxt = s.toFixed(1);
  out.push(s < 6 ? { icon: '🎯', text: t('ins.consVery', { sd: sdTxt }) }
    : s < 12 ? { icon: '📊', text: t('ins.consMod', { sd: sdTxt }) }
    : { icon: '🎢', text: t('ins.consVar', { sd: sdTxt }) });
  const am = logs.filter((l) => new Date(l.ts).getHours() < 12), pm = logs.filter((l) => new Date(l.ts).getHours() >= 17);
  if (am.length && pm.length) {
    const diff = avg(pm.map((l) => l.sys)) - avg(am.map((l) => l.sys));
    if (Math.abs(diff) >= 5) out.push({ icon: diff > 0 ? '🌙' : '🌅', text: t(diff > 0 ? 'ins.eveHigher' : 'ins.morHigher', { d: Math.abs(diff).toFixed(0) }) });
    else out.push({ icon: '⏱️', text: t('ins.noDiff') });
  }
  const hs = sd(hr), ha = avg(hr);
  out.push({ icon: '💓', text: t('ins.hr', { a: ha.toFixed(0), s: t(hs < 6 ? 'ins.stab1' : hs < 12 ? 'ins.stab2' : 'ins.stab3'), sd: hs.toFixed(1) }) + (ha > 100 ? t('ins.hrHigh') : ha < 60 ? t('ins.hrLow') : '') });
  const spike = logs.filter((l) => l.hr > 100 || l.sys >= 140);
  if (spike.length) {
    const last = spike[spike.length - 1];
    out.push({ icon: '📍', text: t('ins.spike', { n: spike.length, date: fmtShort(last.ts, loc), tag: last.tag ? ' (' + last.tag + ')' : '' }) });
  }
  if (logs.length >= 4) {
    const h = Math.floor(logs.length / 2);
    const d = avg(sys.slice(h)) - avg(sys.slice(0, h));
    if (Math.abs(d) >= 4) out.push({ icon: d < 0 ? '📉' : '📈', text: t(d < 0 ? 'ins.down' : 'ins.up', { d: Math.abs(d).toFixed(0) }) });
  }
  const pct = Math.round((logs.filter((l) => classify(l.sys, l.dia).key === 'normal').length / logs.length) * 100);
  out.push({ icon: pct >= 60 ? '✅' : '🩹', text: t('ins.pct', { p: pct }) });
  return out;
}
