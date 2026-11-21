import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Btn from './components/Btn.jsx';
import Confetti from './components/Confetti.jsx';
import Icon from './components/Icon.jsx';
import ResultModal from './components/ResultModal.jsx';
import SettingsSheet from './components/SettingsSheet.jsx';
import Home from './screens/Home.jsx';
import Record from './screens/Record.jsx';
import Trends from './screens/Trends.jsx';
import History from './screens/History.jsx';
import { BADGES, DAY, classify, dayKey, earnedIds, levelOf, load, save, seed } from './lib/data.js';
import { loadFired, notify, saveFired } from './lib/reminders.js';
import { useI18n } from './lib/i18n.jsx';

const SKEY = 'pulsequest-settings';
const DEFAULTS = { theme: 'auto', reminders: { enabled: false, times: ['08:00', '20:00'] } };
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SKEY) || '{}');
    return { ...DEFAULTS, ...s, reminders: { ...DEFAULTS.reminders, ...(s.reminders || {}) } };
  } catch (e) { return DEFAULTS; }
}

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [state, setState] = useState(load);
  const [settings, setSettings] = useState(loadSettings);
  const [screen, setScreen] = useState(() => (new URLSearchParams(location.search).get('screen') === 'record' ? 'record' : 'home'));
  const [result, setResult] = useState(null);
  const [burst, setBurst] = useState(0);
  const [installEvt, setInstallEvt] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(false);
  const [sysDark, setSysDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);

  // persistence
  useEffect(() => save(state), [state]);
  useEffect(() => { try { localStorage.setItem(SKEY, JSON.stringify(settings)); } catch (e) {} }, [settings]);

  // theme
  const dark = settings.theme === 'dark' || (settings.theme === 'auto' && sysDark);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const h = (e) => setSysDark(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    const m = document.querySelector('meta[name=theme-color]');
    if (m) m.setAttribute('content', dark ? '#0f0a2a' : '#f4f1ff');
  }, [dark]);

  // install prompt + notification tap from service worker
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallEvt(e); };
    const done = () => setInstallEvt(null);
    const msg = (e) => { if (e.data && e.data.type === 'open-record') setScreen('record'); };
    window.addEventListener('beforeinstallprompt', h);
    window.addEventListener('appinstalled', done);
    navigator.serviceWorker && navigator.serviceWorker.addEventListener('message', msg);
    return () => {
      window.removeEventListener('beforeinstallprompt', h);
      window.removeEventListener('appinstalled', done);
      navigator.serviceWorker && navigator.serviceWorker.removeEventListener('message', msg);
    };
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  // reminders: check every 15s and whenever the app becomes visible (60-minute grace window)
  useEffect(() => {
    if (!settings.reminders.enabled) return;
    const check = () => {
      const now = new Date(), today = dayKey(now.getTime()), fired = loadFired(today);
      settings.reminders.times.forEach((tm) => {
        const [h, m] = tm.split(':').map(Number);
        const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
        const k = today + ' ' + tm;
        if (Date.now() >= due && Date.now() - due < 60 * 60000 && !fired[k]) {
          fired[k] = 1; saveFired(fired);
          if (!state.logs.some((l) => Date.now() - l.ts < 2 * 3600000)) {
            notify(t('rem.title'), t('rem.body'));
            if (document.visibilityState === 'visible') { setToast(true); setTimeout(() => setToast(false), 8000); }
          }
        }
      });
    };
    check();
    const id = setInterval(check, 15000);
    document.addEventListener('visibilitychange', check);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', check); };
  }, [settings.reminders, state.logs, lang]);

  const install = async () => { if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice; setInstallEvt(null); };

  const saveReading = ({ sys, dia, hr, tag }) => {
    const ts = Date.now(); // exact moment of saving
    const entry = { id: 'e' + ts + Math.random().toString(36).slice(2, 6), ts, sys, dia, hr, tag };
    const today = dayKey(ts), firstToday = state.lastDay !== today;
    let streak = state.streak;
    if (firstToday) streak = state.lastDay === dayKey(ts - DAY) ? state.streak + 1 : 1;
    const gain = 20 + (tag ? 5 : 0) + (firstToday ? Math.min(streak * 2, 20) : 0);
    const next = { logs: [...state.logs, entry], exp: state.exp + gain, streak, lastDay: today };
    const before = earnedIds(state), after = earnedIds(next);
    setState(next);
    setResult({ entry, gain, cat: classify(sys, dia), level: levelOf(next.exp), levelUp: levelOf(next.exp) > levelOf(state.exp),
      newBadges: BADGES.filter((b) => after.includes(b.id) && !before.includes(b.id)) });
    setBurst((b) => b + 1);
  };

  const nav = [['home', 'home'], ['record', 'plus'], ['trends', 'chart'], ['history', 'list']];
  const iconBtn = 'w-10 h-10 rounded-full flex items-center justify-center glass';

  return (
    <div className="max-w-md mx-auto px-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)', paddingBottom: 'calc(110px + env(safe-area-inset-bottom))' }}>
      <Confetti trigger={burst} />

      {/* top bar: brand + quick toggles */}
      <div className="flex items-center justify-between pb-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-accent/90">{t('app.tagline')}</p>
          <p className="text-xl font-extrabold leading-tight">Pulse<span className="text-accent">Quest</span> <span className="heartbeat">❤️</span></p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => setLang(lang === 'en' ? 'th' : 'en')} label="Language" className={iconBtn + ' text-xs font-black'}>{lang === 'en' ? 'TH' : 'EN'}</Btn>
          <Btn onClick={() => setSettings({ ...settings, theme: dark ? 'light' : 'dark' })} label="Theme" className={iconBtn}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={dark ? 'm' : 's'} initial={{ rotate: -90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}>
                <Icon name={dark ? 'moon' : 'sun'} className="w-5 h-5" />
              </motion.span>
            </AnimatePresence>
          </Btn>
          <Btn onClick={() => setShowSettings(true)} label={t('set.title')} className={iconBtn}>
            <Icon name={settings.reminders.enabled ? 'bell' : 'gear'} className="w-5 h-5" />
          </Btn>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.button key="toast" className="fixed left-4 right-4 max-w-md mx-auto glass p-3 flex items-center gap-3 text-left" style={{ top: 'max(env(safe-area-inset-top), 12px)', zIndex: 65, background: 'var(--modal)' }}
            initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={() => { setToast(false); setScreen('record'); }}>
            <span className="text-2xl heartbeat">🔔</span><span className="text-sm font-bold">{t('rem.toast')}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main key={screen} initial={{ opacity: 0, y: 22, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -14, scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 26, duration: 0.25 }}>
          {screen === 'home' && <Home state={state} go={setScreen} installEvt={installEvt} onInstall={install} />}
          {screen === 'record' && <Record onSave={saveReading} />}
          {screen === 'trends' && <Trends logs={state.logs} />}
          {screen === 'history' && <History logs={state.logs} onDelete={(id) => setState({ ...state, logs: state.logs.filter((l) => l.id !== id) })} onReset={() => setState(seed())} />}
        </motion.main>
      </AnimatePresence>

      <AnimatePresence>{result && <ResultModal key="result" result={result} onClose={() => { setResult(null); setScreen('home'); }} />}</AnimatePresence>
      <AnimatePresence>{showSettings && <SettingsSheet key="settings" settings={settings} setSettings={setSettings} onClose={() => setShowSettings(false)} />}</AnimatePresence>

      <nav className="fixed left-0 right-0 bottom-0 flex justify-center px-3" style={{ zIndex: 60, paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}>
        <div className="glass w-full max-w-md grid grid-cols-4 p-1.5 relative" style={{ borderRadius: 28, background: 'var(--nav)' }}>
          {nav.map(([k, icon]) => {
            const act = screen === k;
            return (
              <Btn key={k} onClick={() => setScreen(k)} label={t('nav.' + k)} className="flex flex-col items-center py-2 rounded-3xl" style={{ background: 'transparent', color: act ? '#fff' : 'rgb(var(--ink) / .55)' }}>
                {act && <motion.span layoutId="navpill" className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(145deg,rgba(124,58,237,.9),rgba(6,182,212,.75))', boxShadow: '0 0 18px rgba(34,211,238,.45)' }} transition={{ type: 'spring', stiffness: 380, damping: 28 }} />}
                <motion.span className="relative" animate={{ y: act ? -2 : 0, scale: act ? 1.15 : 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}><Icon name={icon} className={k === 'record' ? 'w-7 h-7' : 'w-6 h-6'} /></motion.span>
                <span className="relative text-[10px] font-bold mt-0.5">{t('nav.' + k)}</span>
              </Btn>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
