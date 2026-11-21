import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Btn from '../components/Btn.jsx';
import Icon from '../components/Icon.jsx';
import { classify, exportCSV, fmtDate, fmtHM, hrStatus } from '../lib/data.js';
import { useI18n } from '../lib/i18n.jsx';

export default function History({ logs, onDelete, onReset }) {
  const { t, ta, locale } = useI18n();
  const [confirmId, setConfirmId] = useState(null);
  const sorted = [...logs].sort((a, b) => b.ts - a.ts);
  const title = ta('hist.title');
  useEffect(() => { if (!confirmId) return; const x = setTimeout(() => setConfirmId(null), 3000); return () => clearTimeout(x); }, [confirmId]);

  return (
    <div className="space-y-4">
      <header className="pt-1 flex items-end justify-between">
        <h1 className="text-2xl font-extrabold">{title[0]} <span className="text-accent">{title[1]}</span></h1>
        <span className="text-xs text-ink/50">{t('hist.entries', { n: sorted.length })}</span>
      </header>
      <Btn onClick={() => exportCSV(logs, t)} disabled={!logs.length} className="w-full py-4 rounded-2xl text-base font-black text-white flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(90deg,#059669,#06b6d4)', boxShadow: '0 8px 26px rgba(16,185,129,.4)', opacity: logs.length ? 1 : 0.5 }}>
        <Icon name="dl" /> {t('hist.export')}
      </Btn>
      {sorted.length === 0 && <p className="text-center text-ink/50 py-10">{t('hist.none')}</p>}
      <ul className="space-y-2.5">
        <AnimatePresence initial>
          {sorted.map((l, i) => {
            const c = classify(l.sys, l.dia), h = hrStatus(l.hr);
            return (
              <motion.li key={l.id} layout className="glass flex items-center gap-3 p-3.5" style={{ borderLeft: '6px solid ' + c.color, borderRadius: 18 }}
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0, transition: { delay: Math.min(i, 10) * 0.04, type: 'spring', stiffness: 260, damping: 22 } }}
                exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.25 } }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{l.sys}/{l.dia}</span>
                    <span className="text-sm font-bold" style={{ color: h.color }}>♥ {l.hr}</span>
                  </div>
                  <p className="text-[11px] font-bold" style={{ color: c.color }}>{t('cats.' + c.key + '.label')}{l.tag ? <span className="text-ink/50 font-normal"> · {l.tag}</span> : ''}</p>
                  <p className="text-[11px] text-ink/45">{fmtDate(l.ts, locale)} · {fmtHM(l.ts, locale)}</p>
                </div>
                <Btn label={t('hist.delete')} onClick={() => (confirmId === l.id ? (setConfirmId(null), onDelete(l.id)) : setConfirmId(l.id))}
                  className="rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-1" style={{ background: confirmId === l.id ? '#e11d48' : 'rgb(var(--ink) / .1)', color: confirmId === l.id ? '#fff' : '#e11d48' }}>
                  <Icon name="trash" className="w-4 h-4" />{confirmId === l.id ? t('hist.sure') : ''}
                </Btn>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <div className="text-center pt-2"><button onClick={() => { if (window.confirm(t('hist.resetConfirm'))) onReset(); }} className="text-[11px] text-ink/40 underline">{t('hist.reset')}</button></div>
    </div>
  );
}
