// Day & Night: a landscape that switches between a bright day sky and a starry night with the sun.
import { canvas, newAssets, addImage, weatherIcons, weatherSource, meta, text, image, degree, rng, mix } from '../lib.mjs';

function landscape(night) {
  const g = canvas(240, 240), r = rng(night ? 11 : 5);
  g.vgrad(0, 0, 239, 239, night ? [[0, '#040A22'], [0.6, '#13265A'], [1, '#2A3F7A']] : [[0, '#2F7FD6'], [0.65, '#7CC0F0'], [1, '#CDEBFA']]);
  if (night) for (let i = 0; i < 90; i++) { const x = Math.floor(r() * 240), y = Math.floor(r() * 170), b = r(); g.color(mix('#2A3F7A', '#FFFFFF', 0.35 + b * 0.65)); g.set(x, y); if (b > 0.9) { g.set(x + 1, y); g.set(x, y + 1); } }
  else for (const [cx, cy, s] of [[16, 172, 0.7], [104, 166, 0.6], [214, 150, 0.5]]) {
    // Soft pixel clouds.
    g.color('#FFFFFF', 200);
    for (const [dx, dy, rr] of [[0, 0, 10], [12, -5, 12], [26, 0, 9], [13, 4, 10]]) g.disc(Math.round(cx + dx * s), Math.round(cy + dy * s), Math.round(rr * s));
  }
  // Rolling hills in two layers, then a little house with a lit window at night.
  const hill = (base, amp, freq, phase, color) => { g.color(color); for (let x = 0; x < 240; x++) { const top = Math.round(base - amp * Math.sin(x * freq + phase)); g.rect(x, top, x, 239); } };
  hill(196, 14, 0.026, 0.8, night ? '#14304A' : '#6DB35A');
  hill(214, 10, 0.034, 2.4, night ? '#0C2133' : '#4C9A45');
  g.color(night ? '#0A1622' : '#7A4B32'); g.rect(176, 186, 196, 200);
  g.color(night ? '#08121C' : '#B34A3A'); for (let i = 0; i < 11; i++) g.rect(172 + i, 185 - i, 200 - i, 185 - i);
  g.color(night ? '#FFD36B' : '#3B2A20'); g.rect(182, 190, 186, 194);
  // Translucent band behind humidity and wind.
  g.rrect(36, 216, 204, 236, 10, night ? '#0A1830' : '#2F6B34', null);
  g.color('#9FD4FF'); g.disc(54, 228, 3); g.line(54, 221, 51, 226); g.line(54, 221, 57, 226);
  g.color('#FFFFFF'); g.line(126, 224, 136, 224); g.line(126, 228, 138, 228); g.line(126, 232, 134, 232);
  return g;
}

export default {
  blurb: 'A pixel landscape that switches between a bright day sky and a starry night with a lit window, following sunrise and sunset.',
  samples: w => [['', w({ t: '18.4', f: '17.1', h: 72, c: 2, w: '15.8', d: 1 })], ['night', w({ t: '11.2', f: '9.8', h: 81, c: 0, w: '6.1', d: 0 }), Date.UTC(2026, 9, 15, 22, 41, 12)]],
  build() {
    const assets = newAssets();
    const day = addImage(assets, 'day', landscape(false)), night = addImage(assets, 'night', landscape(true));
    const theme = meta('clock-sky', 'Day & Night');
    theme.data = [weatherSource()];
    theme.layers = [
      // is_day picks the scene: the other one is moved off-screen.
      image('night', 300, 0, night, { bind: { x: { source: 'w.d', input: [0.5, 0.51], output: [0, 300] } } }),
      image('day', 0, 0, day, { bind: { x: { source: 'w.d', input: [0.49, 0.5], output: [300, 0] } } }),
      text('time-shadow', 17, 22, '{HH}:{MM}', 56, '#0B1B3A'),
      text('time', 15, 20, '{HH}:{MM}', 56, '#FFFFFF'),
      text('date-shadow', 121, 79, '{WEEKDAY}, {DD} {MON}', 16, '#0B1B3A', { anchor: 'top-center' }),
      text('date', 120, 78, '{WEEKDAY}, {DD} {MON}', 16, '#FFFFFF', { anchor: 'top-center' }),
      ...weatherIcons(assets, { x: 34, y: 104 }),
      text('temp-shadow', 192, 116, '{w.t}', 32, '#0B1B3A', { anchor: 'top-right' }),
      text('temp', 190, 114, '{w.t}', 32, '#FFFFFF', { anchor: 'top-right' }),
      degree('temp-deg', 190, 114, 32, '#FFFFFF'),
      text('feels', 190, 148, 'feels {w.f}', 8, '#FFFFFF', { anchor: 'top-right' }),
      text('humidity', 64, 222, '{w.h}%', 16, '#FFFFFF'),
      text('wind', 142, 222, '{w.w}', 16, '#FFFFFF'),
    ];
    return { theme, assets };
  },
};
