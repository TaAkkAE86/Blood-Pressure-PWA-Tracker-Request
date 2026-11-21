import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Spring press/release + ripple + glow on hover
export default function Btn({ children, className = '', style, onClick, type = 'button', disabled, label }) {
  const [ripples, setRipples] = useState([]);
  const down = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    setRipples((p) => [...p, { id: Math.random(), x: e.clientX - r.left - size / 2, y: e.clientY - r.top - size / 2, size }]);
    if (navigator.vibrate) navigator.vibrate(8);
  };
  return (
    <motion.button
      type={type} disabled={disabled} aria-label={label} onClick={onClick} onPointerDown={down} style={style}
      whileHover={disabled ? undefined : { scale: 1.03, filter: 'brightness(1.12)' }}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 520, damping: 16 }}
      className={'relative overflow-hidden border-0 outline-none cursor-pointer touch-manipulation ' + className}
    >
      {children}
      {ripples.map((r) => (
        <motion.span key={r.id} className="absolute rounded-full pointer-events-none" style={{ left: r.x, top: r.y, width: r.size, height: r.size, background: 'rgba(255,255,255,.55)' }}
          initial={{ scale: 0, opacity: 0.6 }} animate={{ scale: 4, opacity: 0 }} transition={{ duration: 0.65, ease: 'easeOut' }}
          onAnimationComplete={() => setRipples((p) => p.filter((x) => x.id !== r.id))} />
      ))}
    </motion.button>
  );
}
