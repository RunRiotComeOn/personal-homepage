import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
const playing = /\/play-atlas(?:\/|\/index\.html)?$/.test(window.location.pathname) || new URLSearchParams(window.location.search).get('play') === '1';
document.title = playing ? 'Play Atlas — Yixu’s Ocean' : 'Yixu Huang — AI Researcher';
const { default: App } = playing
  ? await import('./App.tsx')
  : await import('./Portfolio.tsx');
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
