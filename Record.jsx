import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Btn from '../components/Btn.jsx';
import { fmtDate, fmtTime } from '../lib/data.js';
import { useI18n } from '../lib/i18n.jsx';

// defined at module level so it keeps focus while typing
function NumField({ id, label, unit, value, onChange, color, ph }) {
  return (
    <label htmlFor={id} className="block">
      <div className="flex justify-between text-xs font-bold mb-1.5"><span style={{ color }}>{label}</span><span className="text-ink/40">{unit}</span></div>
      <motion.input id={id} whileFocus={{ scale: 1.02 }} className="field text-center text-4xl font-black py-4" type="text" inputMode="numeric" pattern="[0-9]*"
        enterKeyHint="next" autoComplete="off" placeholder={ph} value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 3))} />
    </label>
  );
}

export default function Record({ onSave }) {
  const { t, ta, locale } = useI18n();
  const [sys, setSys] = useState(''), [dia, setDia] = useState(''), [hr, setHr] = useState('');
  const [tag, setTag] = useState(''), [err, setErr] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const title = ta('record.title');

  const submit = (e) => {
    e.preventDefault();
    const s = +sys, d = +dia, h = +hr;
    if (!sys || !dia || !hr) return setErr(t('record.eFill'));
    if (s < 50 || s > 260) return setErr(t('record.eSys'));
    if (d < 30 || d > 160) return setErr(t('record.eDia'));
    if (h < 30 || h > 220) return setErr(t('record.eHr'));
    if (d >= s) return setErr(t('record.eOrder'));
    setErr('');
    onSave({ sys: s, dia: d, hr: h, tag: tag.trim() });
    setSys(''); setDia(''); setHr(''); setTag('');
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <header className="pt-1">
        <h1 className="text-2xl font-extrabold">{title[0]} <span className="text-accent">{title[1]}</span></h1>
        <p className="text-xs text-ink/50 mt-1">🕒 {fmtDate(now, locale)} · {fmtTime(now, locale)}</p>
      </header>
      <section className="glass p-5 space-y-4">
        <NumField id="sys" label={t('record.sys')} unit="mmHg" value={sys} onChange={(v) => { setSys(v); setErr(''); }} color="#ff5c8a" ph="120" />
        <NumField id="dia" label={t('record.dia')} unit="mmHg" value={dia} onChange={(v) => { setDia(v); setErr(''); }} color="#06b6d4" ph="80" />
        <NumField id="hr" label={t('record.hr')} unit="bpm" value={hr} onChange={(v) => { setHr(v); setErr(''); }} color="#65a30d" ph="72" />
      </section>
      <section className="glass p-5">
        <p className="text-xs font-bold text-ink/60 mb-2">{t('record.tagTitle')} <span className="text-ink/35">{t('record.tagOpt')}</span></p>
        <div className="flex flex-wrap gap-2 mb-3">
          {ta('record.tags').map((tg) => (
            <Btn key={tg} onClick={() => setTag(tag === tg ? '' : tg)} className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: tag === tg ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : 'rgb(var(--ink) / .1)', color: tag === tg ? '#fff' : 'inherit' }}>{tg}</Btn>
          ))}
        </div>
        <input className="field px-4 py-3 text-sm" placeholder={t('record.custom')} maxLength={40} value={tag} onChange={(e) => setTag(e.target.value)} />
      </section>
      <AnimatePresence>
        {err && <motion.p key={err} role="alert" className="text-sm text-rose-500 text-center font-semibold"
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>{err}</motion.p>}
      </AnimatePresence>
      <Btn type="submit" className="w-full py-4 rounded-2xl text-lg font-black text-white" style={{ background: 'linear-gradient(90deg,#7c3aed,#06b6d4,#10b981)', boxShadow: '0 8px 28px rgba(6,182,212,.45)' }}>
        💾 {t('record.save')}
      </Btn>
      <p className="text-[11px] text-center text-ink/40">{t('record.auto')}</p>
    </form>
  );
}
