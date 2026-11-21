import React, { useEffect, useRef } from 'react';

export default function Confetti({ trigger }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!trigger) return;
    const c = ref.current, ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const colors = ['#22d3ee', '#a855f7', '#f472b6', '#facc15', '#34d399', '#ffffff'];
    const ps = Array.from({ length: 140 }, () => {
      const a = Math.random() * Math.PI * 2, v = 6 + Math.random() * 12;
      return { x: c.width / 2, y: c.height * 0.55, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 7, g: 0.3 + Math.random() * 0.2,
        s: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, col: colors[(Math.random() * colors.length) | 0], dot: Math.random() > 0.6 };
    });
    let f = 0, raf;
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height); f++;
      ps.forEach((p) => {
        p.vy += p.g; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.globalAlpha = Math.max(0, 1 - f / 110); ctx.fillStyle = p.col; ctx.shadowColor = p.col; ctx.shadowBlur = 12;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        if (p.dot) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 7); ctx.fill(); } else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (f < 110) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, c.width, c.height);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [trigger]);
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none" style={{ zIndex: 80 }} />;
}
