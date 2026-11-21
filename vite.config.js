import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' lets the build be hosted in any folder (GitHub Pages, Netlify, etc.)
export default defineConfig({ base: './', plugins: [react()] });
