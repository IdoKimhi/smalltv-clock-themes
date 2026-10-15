// Orbit: a mission-control HUD over deep space, with a ringed planet and a radar sweep.
import { canvas, newAssets, addImage, addAnimation, weatherIcons, weatherSource, meta, text, image, anim, degree, rng, mix } from '../lib.mjs';

const CYAN = '#5CF0FF', DIM = '#2C8FA8', FAINT = '#174E5E';

export default {
  blurb: 'Mission control over deep space: a nebula, a ringed gas giant, a rotating radar sweep and a cyan HUD reporting the surface conditions.',
  build() {
    const assets = newAssets(), g = canvas(240, 240).fill('#02030A'), r = rng(77);
    // Nebula: soft overlapping clouds of violet and teal.
    for (let i = 0; i < 26; i++) { const x = 20 + r() * 140, y = 100 + r() * 120, rr = 10 + Math.floor(r() * 26); g.color(r() > 0.5 ? '#5B2A86' : '#1B5E78', 14); g.disc(Math.round(x), Math.round(y), rr); }
    for (let i = 0; i < 140; i++) { const b = r(); g.color(mix('#22283A', '#FFFFFF', 0.25 + b * 0.75)); const x = Math.floor(r() * 240), y = Math.floor(r() * 240); g.set(x, y); if (b > 0.94) { g.set(x + 1, y); g.set(x - 1, y); g.set(x, y + 1); g.set(x, y - 1); } }
    // Gas giant with bands, light from the upper left, and a ring.
    const [px, py, pr] = [226, 246, 80];
    const BANDS = ['#E8C38A', '#D9A066', '#F1D9AC', '#C98552', '#E5B97C', '#B8703F'];
    for (let y = py - pr; y < 240; y++) for (let x = px - pr; x < 240; x++) {
      const dx = x - px, dy = y - py, d = dx * dx + dy * dy;
      if (d > pr * pr) continue;
      const band = BANDS[(Math.floor((dy + pr + Math.sin(dx * 0.05) * 4) / 14) % BANDS.length + BANDS.length) % BANDS.length];
      const light = Math.max(0, (-dx - dy) / (pr * 1.4)) * 0.35 - Math.max(0, (dx + dy) / (pr * 1.6)) * 0.45;
      g.color(light > 0 ? mix(band, '#FFFFFF', light) : mix(band, '#000000', -light)); g.set(x, y);
    }
    g.color('#D9C7A0', 170); for (let a = 0; a < Math.PI * 2; a += 0.004) { const x = px + Math.cos(a) * 112, y = py + Math.sin(a) * 26 - 30; if (Math.sin(a) > -0.15 || Math.hypot(x - px, y - py) > pr) g.set(x, y); }
    // HUD: corner brackets, dividers and labels.
    g.color(DIM); for (const [x, y, sx, sy] of [[4, 4, 1, 1], [235, 4, -1, 1], [4, 235, 1, -1], [235, 235, -1, -1]]) { g.line(x, y, x + sx * 14, y); g.line(x, y, x, y + sy * 14); }
    g.color(FAINT); g.rect(12, 64, 166, 64);
    g.text('MISSION TIME', 12, 10, 8, DIM);
    g.text('SURFACE CONDITIONS', 12, 72, 8, DIM);
    for (const [i, k] of ['FEELS LIKE', 'HUMIDITY', 'WIND KM/H'].entries()) g.text(k, 12, 148 + i * 22, 8, DIM);
    g.text('LINK OPEN-METEO', 12, 222, 8, DIM); g.color('#3DFF8A'); g.rect(106, 222, 111, 228);
    const radar = addAnimation(assets, 'radar', 16, f => {
      const s = canvas(60, 60), c = 29.5, a0 = f / 16 * Math.PI * 2;
      s.color(FAINT); s.ring(30, 30, 28); s.ring(30, 30, 18); s.ring(30, 30, 8); s.rect(2, 30, 58, 30); s.rect(30, 2, 30, 58);
      for (let k = 12; k >= 0; k--) { const a = a0 - k * 0.07; s.color(mix(CYAN, '#02030A', k / 13)); s.line(c, c, c + Math.cos(a) * 27, c + Math.sin(a) * 27); }
      for (const [bx, by, ba] of [[42, 18, 0.9], [20, 40, 3.4], [44, 40, 5.5]]) { const age = ((a0 - ba) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); if (age < 2.4) { s.color(mix('#3DFF8A', '#02030A', age / 2.4)); s.disc(bx, by, 1); } }
      return s;
    });
    const theme = meta('clock-orbit', 'Orbit');
    theme.display.background = '#02030A';
    theme.data = [weatherSource()];
    theme.layers = [
      image('bg', 0, 0, addImage(assets, 'bg', g)),
      anim('radar', 172, 6, radar, 8),
      text('time', 12, 22, '{HH}:{MM}:{SS}', 24, CYAN),
      text('date', 12, 50, '{WD} {DD} {MON} {YYYY}', 8, DIM),
      ...weatherIcons(assets, { x: 12, y: 84 }),
      text('temp', 160, 92, '{w.t}', 32, '#FFFFFF', { anchor: 'top-right' }),
      degree('temp-deg', 160, 92, 32, '#FFFFFF'),
      text('feels', 84, 144, '{w.f}', 16, CYAN),
      text('humidity', 84, 166, '{w.h}%', 16, CYAN),
      text('wind', 84, 188, '{w.w}', 16, CYAN),
    ];
    return { theme, assets };
  },
};
