import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Btn from './Btn.jsx';
import Icon from './Icon.jsx';
import { useI18n } from '../lib/i18n.jsx';
import { notify, notifSupported } from '../lib/reminders.js';

function Seg({ value, options, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-2xl bg-ink/10">
      {options.map(([k, label]) => (
        <Btn key={k} onClick={() => onChange(k)} className="flex-1 py-2 rounded-xl text-sm font-bold"
          style={{ background: value === k ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : 'transparent', color: value === k ? '#fff' : 'inherit' }}>{label}</Btn>
      ))}
    </div>
  );
}

export default function SettingsSheet({ settings, setSettings, onClose }) {
  const { t, lang, setLang } = useI18n();
  const [msg, setMsg] = useState('');
  const rem = settings.reminders;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const setRem = (patch) => setSettings({ ...settings, reminders: { ...rem, ...patch } });

  const ensurePerm = async () => {
    if (!notifSupported()) { setMsg(t('set.unsupported')); return false; }
    let p = Notification.permission;
    if (p === 'default') p = await Notification.requestPermission();
    if (p !== 'granted') { setMsg(t('set.denied')); return false; }
    return true;
  };
  const toggle = async () => {
    setMsg('');
    if (rem.enabled) return setRem({ enabled: false });
    if (await ensurePerm()) setRem({ enabled: true });
  };
  const test = async () => {
    setMsg('');
    if (await ensurePerm()) { const ok = await notify(t('rem.title'), t('rem.body')); setMsg(ok ? t('set.sent') : t('set.unsupported')); }
  };
  const setTime = (i, v) => setRem({ times: rem.times.map((x, n) => (n === i ? v : x)) });

  return (
    <motion.div className="fixed inset-0 flex items-end sm:items-center justify-center p-3" style={{ zIndex: 75, background: 'rgba(8,5,25,.65)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="glass w-full max-w-md max-h-[92vh] overflow-y-auto hide-scroll p-5 space-y-5" style={{ background: 'var(--modal)' }}
        initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">⚙️ {t('set.title')}</h2>
          <Btn onClick={onClose} label={t('set.close')} className="w-9 h-9 rounded-full flex items-center justify-center bg-ink/10"><Icon name="x" className="w-5 h-5" /></Btn>
        </div>

        <div>
          <p className="text-xs font-bold text-ink/60 mb-2">{t('set.theme')}</p>
          <Seg value={settings.theme} onChange={(v) => setSettings({ ...settings, theme: v })} options={[['auto', t('set.auto')], ['light', '☀️ ' + t('set.light')], ['dark', '🌙 ' + t('set.dark')]]} />
        </div>
        <div>
          <p className="text-xs font-bold text-ink/60 mb-2">{t('set.language')}</p>
          <Seg value={lang} onChange={setLang} options={[['en', 'English'], ['th', 'ไทย']]} />
        </div>

        <div className="rounded-2xl p-4 bg-ink/5">
          <div className="flex items-center gap-3">
            <Icon name="bell" className="w-6 h-6 text-accent" />
            <div className="flex-1">
              <p className="font-bold text-sm">{t('set.reminders')}</p>
              <p className="text-[11px] text-ink/55">{t('set.remDesc')}</p>
            </div>
            <button onClick={toggle} role="switch" aria-checked={rem.enabled} className="relative w-14 h-8 rounded-full transition-colors" style={{ background: rem.enabled ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : 'rgb(var(--ink) / .2)' }}>
              <motion.span className="absolute top-1 w-6 h-6 rounded-full bg-white shadow" animate={{ left: rem.enabled ? 30 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 26 }} />
            </button>
          </div>

          {rem.enabled && (
            <motion.div className="mt-4 space-y-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <p className="text-xs font-bold text-ink/60">{t('set.times')}</p>
              {rem.times.map((tm, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="time" value={tm} onChange={(e) => e.target.value && setTime(i, e.target.value)} className="field px-4 py-2.5 text-lg font-bold" />
                  <Btn onClick={() => setRem({ times: rem.times.filter((_, n) => n !== i) })} label={t('set.remove')} disabled={rem.times.length <= 1}
                    className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-ink/10 text-rose-500"><Icon name="trash" className="w-5 h-5" /></Btn>
                </div>
              ))}
              {rem.times.length < 5 && (
                <Btn onClick={() => setRem({ times: [...rem.times, '12:00'] })} className="w-full py-2.5 rounded-xl text-sm font-bold bg-ink/10 text-accent">{t('set.add')}</Btn>
              )}
            </motion.div>
          )}
          <Btn onClick={test} className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg,#7c3aed,#06b6d4)' }}>🔔 {t('set.test')}</Btn>
          {msg && <p className="text-xs mt-2 text-center font-semibold text-amber-500" role="status">{msg}</p>}
          {isIOS && !standalone && <p className="text-[11px] mt-2 text-ink/55">{t('set.iosHint')}</p>}
          <p className="text-[10px] mt-2 text-ink/40">{t('set.limits')}</p>
        </div>
        <Btn onClick={onClose} className="w-full py-3 rounded-2xl font-black text-white" style={{ background: 'linear-gradient(90deg,#7c3aed,#06b6d4)' }}>{t('set.close')}</Btn>
      </motion.div>
    </motion.div>
  );
}
