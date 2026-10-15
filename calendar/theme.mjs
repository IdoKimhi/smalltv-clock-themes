// Tear-off Calendar: a paper day page on a wooden desk, with the time and weather at the bottom.
import { canvas, newAssets, addImage, weatherIcons, weatherSource, meta, text, image, degree, rng, mix } from '../lib.mjs';

const RED = '#D93A2B', INK = '#262321', PAPER = '#FBF8F1';

export default {
  blurb: 'A tear-off calendar page on a wooden desk: month header, a giant day number, the weekday, and time and weather at the foot.',
  build() {
    const assets = newAssets(), g = canvas(240, 240), r = rng(21);
    // Wood grain.
    for (let y = 0; y < 240; y++) for (let x = 0; x < 240; x++) {
      const grain = Math.sin(y * 0.35 + Math.sin(x * 0.03 + y * 0.02) * 3) * 0.5 + 0.5;
      g.color(mix('#4A3122', '#5E412E', grain * 0.8 + r() * 0.2)); g.set(x, y);
    }
    // Shadow, page, red header, binding rings and the perforation line.
    g.color('#000000', 90); g.rect(20, 14, 228, 234);
    g.color(PAPER); g.rect(16, 10, 224, 230);
    g.color('#ECE6D8'); g.rect(16, 226, 224, 230);
    g.color(RED); g.rect(16, 10, 224, 54);
    g.color('#B32E22'); g.rect(16, 54, 224, 55);
    for (const x of [64, 176]) { g.color('#2B2B2B'); g.disc(x, 12, 6); g.color('#8E8E8E'); g.ring(x, 12, 6, 2); g.color('#1A1A1A'); g.disc(x, 14, 2); }
    g.color('#C9C1AE'); for (let x = 22; x < 220; x += 6) g.rect(x, 176, x + 2, 176);
    const theme = meta('clock-calendar', 'Tear-off Calendar');
    theme.display.background = '#4A3122';
    theme.data = [weatherSource()];
    theme.layers = [
      image('bg', 0, 0, addImage(assets, 'bg', g)),
      text('month', 120, 26, '{MONTH}', 24, '#FFFFFF', { anchor: 'top-center' }),
      text('day', 120, 64, '{DD}', 96, INK, { anchor: 'top-center' }),
      text('weekday', 120, 154, '{WEEKDAY}', 16, RED, { anchor: 'top-center' }),
      text('time', 26, 188, '{HH}:{MM}', 24, INK),
      text('year', 26, 214, '{YYYY}', 8, '#8A8172'),
      ...weatherIcons(assets, { x: 128, y: 186, k: 1 }),
      text('temp', 206, 188, '{w.t}', 16, INK, { anchor: 'top-right' }),
      degree('temp-deg', 206, 188, 16, INK),
      text('details', 214, 210, '{w.h}%  {w.w}km/h', 8, '#8A8172', { anchor: 'top-right' }),
    ];
    return { theme, assets };
  },
};
