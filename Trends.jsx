import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Btn from '../components/Btn.jsx';
import { DAY, avg, fmtDate, fmtHM, fmtShort, getInsights } from '../lib/data.js';
import { useI18n } from '../lib/i18n.jsx';

const SERIES = [{ k: 'sys', label: 'SYS', color: '#ff5c8a' }, { k: 'dia', label: 'DIA', color: '#06b6d4' }, { k: 'hr', label: 'Pulse', color: '#65a30d' }];

export default function Trends({ logs }) {
  const { t, ta, locale } = useI18n();
  const [range, setRange] = useState('7');
  const [on, setOn] = useState({ sys: true, dia: true, hr: true });
  const [sel, setSel] = useState(null);
  const title = ta('trends.title');

  const data = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.ts - b.ts);
    return range === 'all' ? sorted : sorted.filter((l) => l.ts >= Date.now() - +range * DAY);
  }, [logs, range]);
  useEffect(() => setSel(null), [range]);

  const W = 340, H = 200, L = 30, R = 10, T = 12, B = 24;
  const active = SERIES.filter((s) => on[s.k]);
  const vals = data.flatMap((l) => active.map((s) => l[s.k]));
  const min = vals.length ? Math.floor((Math.min(...vals) - 8) / 10) * 10 : 0;
  const max = vals.length ? Math.ceil((Math.max(...vals) + 8) / 10) * 10 : 100;
  const t0 = data.length ? data[0].ts : 0, t1 = data.length ? data[data.length - 1].ts : 1;
  const X = (l) => L + (data.length < 2 || t1 === t0 ? (W - L - R) / 2 : ((l.ts - t0) / (t1 - t0)) * (W - L - R));
  const Y = (v) => T + (1 - (v - min) / (max - min || 1)) * (H - T - B);

  const move = (e) => {
    if (!data.length) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    let best = 0, bd = 1e9;
    data.forEach((l, i) => { const d = Math.abs(X(l) - x); if (d < bd) { bd = d; best = i; } });
    setSel(best);
  };
  const point = sel != null ? data[sel] : null;
  const stat = (k) => { const a = data.map((l) => l[k]); return a.length ? { avg: Math.round(avg(a)), max: Math.max(...a), min: Math.min(...a) } : null; };
  const insights = useMemo(() => getInsights(data, t, locale), [data, t, locale]);
  const label = (s) => (s.k === 'hr' ? t('trends.pulse') : s.label);

  return (
    <div className="space-y-4">
      <header className="pt-1"><h1 className="text-2xl font-extrabold">{title[0]} <span className="text-accent">{title[1]}</span></h1></header>

      <div className="glass p-1.5 flex gap-1">
        {[['7', t('trends.d7')], ['30', t('trends.d30')], ['all', t('trends.all')]].map(([k, l]) => (
          <Btn key={k} onClick={() => setRange(k)} className="flex-1 py-2 rounded-2xl text-sm font-bold"
            style={{ background: range === k ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : 'transparent', color: range === k ? '#fff' : 'inherit', boxShadow: range === k ? '0 0 16px rgba(34,211,238,.45)' : 'none' }}>{l}</Btn>
        ))}
      </div>

      <section className="glass p-4">
        <div className="flex gap-2 mb-3">
          {SERIES.map((s) => (
            <Btn key={s.k} onClick={() => setOn({ ...on, [s.k]: !on[s.k] })} className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
              style={{ background: on[s.k] ? s.color + '30' : 'rgb(var(--ink) / .08)', color: on[s.k] ? s.color : 'rgb(var(--ink) / .4)', border: '1px solid ' + (on[s.k] ? s.color : 'transparent') }}>
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} /> {label(s)}
            </Btn>
          ))}
        </div>
        {data.length === 0 ? <p className="text-center text-ink/50 py-12 text-sm">{t('trends.none')}</p> : (
          <svg viewBox={'0 0 ' + W + ' ' + H} className="w-full touch-none" onPointerMove={move} onPointerDown={move}>
            {[0, 1, 2, 3, 4].map((i) => {
              const v = min + ((max - min) * i) / 4;
              return <g key={i}><line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="rgb(var(--ink))" strokeOpacity=".12" strokeDasharray="3 4" />
                <text x={L - 5} y={Y(v) + 3} textAnchor="end" fontSize="9" fill="rgb(var(--ink))" fillOpacity=".5">{Math.round(v)}</text></g>;
            })}
            <text x={L} y={H - 6} fontSize="9" fill="rgb(var(--ink))" fillOpacity=".5">{fmtShort(t0, locale)}</text>
            <text x={W - R} y={H - 6} fontSize="9" textAnchor="end" fill="rgb(var(--ink))" fillOpacity=".5">{fmtShort(t1, locale)}</text>
            {active.map((s) => (
              <g key={s.k + range + data.length}>
                {data.length > 1 && <motion.polyline fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px ' + s.color + ')' }}
                  points={data.map((l) => X(l) + ',' + Y(l[s.k])).join(' ')} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: 'easeInOut' }} />}
                {data.map((l, i) => <motion.circle key={l.id} cx={X(l)} cy={Y(l[s.k])} fill={s.color} stroke="rgb(var(--surface))" strokeWidth="1"
                  initial={{ r: 0 }} animate={{ r: sel === i ? 5.5 : 2.8 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} />)}
              </g>
            ))}
            {point && <line x1={X(point)} x2={X(point)} y1={T} y2={H - B} stroke="rgb(var(--ink))" strokeOpacity=".4" />}
          </svg>
        )}
        <div className="h-12 mt-1 text-center text-xs">
          {point ? (
            <motion.div key={point.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-ink/60">{fmtDate(point.ts, locale)} · {fmtHM(point.ts, locale)}</p>
              <p className="font-bold"><span style={{ color: '#ff5c8a' }}>SYS {point.sys}</span> · <span style={{ color: '#06b6d4' }}>DIA {point.dia}</span> · <span style={{ color: '#65a30d' }}>♥ {point.hr}</span></p>
            </motion.div>
          ) : <p className="text-ink/40 pt-2">{t('trends.hint')}</p>}
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2">
        {SERIES.map((s, i) => { const st = stat(s.k); return (
          <motion.div key={s.k} className="glass p-3 text-center" style={{ borderRadius: 20 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <p className="text-[11px] font-black" style={{ color: s.color }}>{label(s)}</p>
            <p className="text-[10px] text-ink/40">{t('trends.avg')}</p>
            <p className="text-2xl font-black">{st ? st.avg : '–'}</p>
            <div className="flex justify-around text-[11px] mt-1"><span className="text-rose-500">▲{st ? st.max : '–'}</span><span className="text-sky-500">▼{st ? st.min : '–'}</span></div>
          </motion.div>
        ); })}
      </div>

      <section className="glass p-4">
        <p className="text-sm font-black mb-3">🧠 {t('trends.insights')}</p>
        <ul className="space-y-2.5">
          {insights.map((i, n) => (
            <motion.li key={range + n + i.text} className="flex gap-3 text-[13px] text-ink/85 rounded-xl p-3 bg-ink/5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: n * 0.07, type: 'spring', stiffness: 260, damping: 22 }}>
              <span className="text-lg">{i.icon}</span><span>{i.text}</span>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
