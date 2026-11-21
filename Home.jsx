import React from 'react';
import { motion } from 'framer-motion';
import Btn from '../components/Btn.jsx';
import Icon from '../components/Icon.jsx';
import { BADGES, classify, dayKey, earnedIds, effStreak, fmtDate, fmtHM, hrStatus, levelOf, trafficColor } from '../lib/data.js';
import { useI18n } from '../lib/i18n.jsx';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } } };

export default function Home({ state, go, installEvt, onInstall }) {
  const { t, locale } = useI18n();
  const { logs, exp } = state;
  const lvl = levelOf(exp), inLvl = exp % 100;
  const streak = effStreak(state);
  const earned = earnedIds(state);
  const nextBadge = BADGES.find((b) => !earned.includes(b.id));
  const latest = [...logs].sort((a, b) => b.ts - a.ts)[0];
  const cat = latest && classify(latest.sys, latest.dia);
  const hs = latest && hrStatus(latest.hr);
  const loggedToday = logs.some((l) => dayKey(l.ts) === dayKey(Date.now()));
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
      {!loggedToday && (
        <motion.button variants={item} onClick={() => go('record')} className="w-full glass p-3 flex items-center gap-3 text-left" whileTap={{ scale: 0.97 }}>
          <span className="text-2xl heartbeat">⏰</span><span className="text-sm font-semibold">{t('home.nudge')}</span>
        </motion.button>
      )}

      <motion.section variants={item} className="glass p-5">
        <div className="flex items-center gap-4">
          <motion.div className="relative w-20 h-20 shrink-0 rounded-full flex items-center justify-center" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ background: 'conic-gradient(#22d3ee ' + inLvl * 3.6 + 'deg, rgb(var(--ink) / .12) 0)', boxShadow: '0 0 26px rgba(34,211,238,.5)' }}>
            <div className="w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center bg-surface">
              <span className="text-[10px] text-accent font-bold tracking-widest">{t('home.level')}</span>
              <motion.span key={lvl} initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }} className="text-3xl font-black leading-none">{lvl}</motion.span>
            </div>
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs font-semibold mb-1"><span>EXP</span><span className="text-accent">{inLvl} / 100</span></div>
            <div className="h-3.5 rounded-full bg-ink/15 overflow-hidden">
              <motion.div className="h-full rounded-full shimmer" initial={{ width: 0 }} animate={{ width: inLvl + '%' }} transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.2 }}
                style={{ backgroundImage: 'linear-gradient(90deg,#a855f7,#22d3ee,#34d399,#a855f7)', boxShadow: '0 0 14px #22d3ee' }} />
            </div>
            <p className="text-[11px] text-ink/50 mt-1">{t('home.toNext', { n: 100 - inLvl, l: lvl + 1 })}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-orange-400/20 text-orange-500">
              <span className={streak ? 'heartbeat' : ''}>🔥</span> {t('home.streak', { n: streak })}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">{t('home.badges')} · {earned.length}/{BADGES.length}</p>
          <div className="grid grid-cols-7 gap-1.5">
            {BADGES.map((b, i) => {
              const on = earned.includes(b.id);
              return (
                <motion.div key={b.id} title={t('badges.' + b.id + '.name') + ': ' + t('badges.' + b.id + '.desc')} whileTap={{ scale: 0.85, rotate: -8 }}
                  initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 400, damping: 14 }}
                  className={'aspect-square rounded-xl flex items-center justify-center text-xl ' + (on ? '' : 'badge-locked')}
                  style={{ background: on ? 'linear-gradient(145deg,rgba(168,85,247,.5),rgba(34,211,238,.4))' : 'rgb(var(--ink) / .1)', boxShadow: on ? '0 0 14px rgba(34,211,238,.45)' : 'none' }}>
                  {b.icon}
                </motion.div>
              );
            })}
          </div>
          <p className="text-[11px] text-ink/45 mt-2">{nextBadge ? t('home.next') + ': ' + t('badges.' + nextBadge.id + '.name') + ' – ' + t('badges.' + nextBadge.id + '.desc') : t('home.allBadges')}</p>
        </div>
      </motion.section>

      {latest ? (
        <motion.section variants={item} className="glass p-5">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs uppercase tracking-widest text-ink/50">{t('home.latest')}</p>
            <p className="text-[11px] text-ink/50">{fmtDate(latest.ts, locale)} · {fmtHM(latest.ts, locale)}</p>
          </div>
          <div className="grid grid-cols-5 gap-3 items-center">
            <div className="col-span-3">
              <div className="flex items-baseline gap-1" style={{ color: trafficColor(cat) }}>
                <span className="text-5xl font-black" style={{ textShadow: '0 0 18px ' + trafficColor(cat) + '88' }}>{latest.sys}</span>
                <span className="text-3xl text-ink/40">/</span>
                <span className="text-4xl font-black">{latest.dia}</span>
              </div>
              <p className="text-[11px] text-ink/50">{t('home.sysdia')}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: trafficColor(cat) + '26', color: trafficColor(cat) }}>
                <span className="w-2 h-2 rounded-full" style={{ background: trafficColor(cat), boxShadow: '0 0 8px ' + trafficColor(cat) }} /> {t('cats.' + cat.key + '.label')}
              </span>
            </div>
            <div className="col-span-2 rounded-2xl p-3 text-center bg-ink/5" style={{ border: '1px solid ' + hs.color + '66' }}>
              <span className="heartbeat text-xl">💓</span>
              <div className="text-3xl font-black" style={{ color: hs.color }}>{latest.hr}</div>
              <div className="text-[11px] text-ink/50">{t('home.bpm')} · {t('hrs.' + hs.key)}</div>
            </div>
          </div>
        </motion.section>
      ) : <motion.section variants={item} className="glass p-6 text-center text-ink/60">{t('home.noReadings')}</motion.section>}

      <motion.div variants={item} className="flex justify-center py-3">
        <Btn onClick={() => go('record')} className="cta-pulse rounded-full w-44 h-44 flex flex-col items-center justify-center text-white font-black"
          style={{ background: 'radial-gradient(circle at 30% 25%, #67e8f9, #7c3aed 70%)' }}>
          <Icon name="plus" className="w-12 h-12" />
          <span className="text-lg mt-1">{t('home.log')}</span>
          <span className="text-[11px] font-semibold text-white/80">+20 EXP</span>
        </Btn>
      </motion.div>

      {!standalone && (installEvt || isIOS) && (
        <motion.section variants={item} className="glass p-4 flex items-center gap-3">
          <span className="text-2xl">📲</span>
          <div className="flex-1 text-sm"><b>{t('home.install')}</b><p className="text-xs text-ink/60">{installEvt ? t('home.installDesc') : t('home.installIOS')}</p></div>
          {installEvt && <Btn onClick={onInstall} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg,#7c3aed,#06b6d4)' }}>{t('home.installBtn')}</Btn>}
        </motion.section>
      )}
    </motion.div>
  );
}
