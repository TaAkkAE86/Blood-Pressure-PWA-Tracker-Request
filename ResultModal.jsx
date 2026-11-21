import React from 'react';
import { motion } from 'framer-motion';
import Btn from './Btn.jsx';
import { fmtDate, fmtTime, hrStatus } from '../lib/data.js';
import { useI18n } from '../lib/i18n.jsx';

export default function ResultModal({ result, onClose }) {
  const { t, ta, locale } = useI18n();
  const { entry, gain, cat, levelUp, newBadges, level } = result;
  const hs = hrStatus(entry.hr);
  return (
    <motion.div className="fixed inset-0 flex items-end sm:items-center justify-center p-4" style={{ zIndex: 70, background: 'rgba(8,5,25,.7)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div role="dialog" aria-modal="true" className="glass w-full max-w-md max-h-[90vh] overflow-y-auto hide-scroll p-5" style={{ background: 'var(--modal)' }}
        initial={{ y: 80, scale: 0.85, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 60, scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
        <div className="text-center">
          <div className="text-4xl heartbeat">{cat.emoji}</div>
          <h2 className="text-xl font-black mt-1">{t('modal.saved')}</h2>
          <p className="text-xs text-ink/50">{fmtDate(entry.ts, locale)} · {fmtTime(entry.ts, locale)}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 my-4 text-center">
          {[['SYS', entry.sys, '#ff5c8a'], ['DIA', entry.dia, '#06b6d4'], [t('trends.pulse'), entry.hr, hs.color]].map(([l, v, c], i) => (
            <motion.div key={l} className="rounded-2xl py-3 bg-ink/5" style={{ border: '1px solid ' + c + '66' }}
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 400, damping: 15 }}>
              <div className="text-3xl font-black" style={{ color: c }}>{v}</div>
              <div className="text-[10px] text-ink/50 font-bold">{l}</div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mb-3">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-black" style={{ background: cat.color + '26', color: cat.color, border: '1px solid ' + cat.color }}>{t('cats.' + cat.key + '.label')}</span>
          {entry.tag && <span className="ml-2 text-xs text-ink/60">🏷️ {entry.tag}</span>}
        </div>
        <motion.div className="rounded-2xl p-3 text-center mb-3" style={{ background: 'linear-gradient(90deg,rgba(168,85,247,.3),rgba(34,211,238,.3))' }}
          initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 350, damping: 12, delay: 0.3 }}>
          <div className="text-2xl font-black text-accent">+{gain} EXP ✨</div>
          {levelUp && <div className="text-sm font-bold text-yellow-500">{t('modal.levelUp', { n: level })}</div>}
          {newBadges.map((b) => <div key={b.id} className="text-sm font-bold text-emerald-500">{b.icon} {t('modal.badge', { name: t('badges.' + b.id + '.name') })}</div>)}
        </motion.div>
        <div className="rounded-2xl p-4 mb-3 bg-ink/5" style={{ borderLeft: '4px solid ' + cat.color }}>
          <p className="text-sm font-bold mb-2">{t('cats.' + cat.key + '.summary')}</p>
          <ul className="space-y-1.5">
            {ta('cats.' + cat.key + '.tips').map((tip, i) => (
              <motion.li key={i} className="text-[13px] text-ink/80 flex gap-2" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}>
                <span style={{ color: cat.color }}>●</span><span>{tip}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        <p className="text-[10px] text-ink/40 text-center mb-3">{t('modal.disclaimer')}</p>
        <Btn onClick={onClose} className="w-full py-3.5 rounded-2xl font-black text-white" style={{ background: 'linear-gradient(90deg,#7c3aed,#06b6d4)' }}>{t('modal.ok')}</Btn>
      </motion.div>
    </motion.div>
  );
}
