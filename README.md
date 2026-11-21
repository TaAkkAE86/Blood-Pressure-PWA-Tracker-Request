# PulseQuest (Vite + React + Tailwind + Framer Motion)

```bash
npm install
npm run dev        # local dev (service worker is only registered in production builds)
npm run build      # outputs ./dist
npm run preview    # serve ./dist to test the PWA locally
```

Deploy the contents of `dist/` to any **HTTPS** host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).

- Android/Chrome: use the in-app Install button or the browser menu.
- iOS/Safari: Share -> Add to Home Screen. Notifications on iOS need iOS 16.4+ and the app installed to the home screen.

## Reminder limitations
Reminders are scheduled locally in the browser. They fire while the app is open, in the background, or resumed
(up to 60 minutes after the scheduled time). A browser cannot wake a fully closed app on a timer without a push server
(Web Push + a backend). That would be the next step if you need guaranteed delivery.

## Structure
- `src/lib/data.js`      logic: classification, EXP/badges, CSV, insights, storage
- `src/lib/i18n.jsx`     English / Thai dictionaries and provider
- `src/lib/reminders.js` notification helpers
- `src/components/`      Btn (spring + ripple), Confetti, Icon, SettingsSheet, ResultModal
- `src/screens/`         Home, Record, Trends, History
- `public/`              manifest, service worker, icons
