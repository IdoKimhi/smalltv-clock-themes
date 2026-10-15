// Digital Rain: falling green glyphs behind a black console showing the time and weather.
import { canvas, newAssets, addAnimation, weatherIcons, weatherSource, meta, text, anim, rng, mix, shades } from '../lib.mjs';

const GREEN = '#00FF41', PALE = '#C8FFD2';
const phosphor = shades(['#0A4D1C', '#17A33D', '#00FF41', '#C8FFD2']);
const FRAMES = 16, ROWS = 32, COLS = 40; // 6x8 glyph cells; the rain cycle is 32 rows

export default {
  blurb: 'Columns of falling green glyphs (a seamless 16-frame loop) above and below a black console with the time, seconds and weather.',
  build() {
    const assets = newAssets(), r = rng(42);
    const glyphs = '0123456789ABCDEFGHJKLMNPRSTUVXYZ$#*+=<>:'.split('');
    const grid = Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => glyphs[Math.floor(r() * glyphs.length)]));
    // Each column has a speed (1 or 2 cycles per loop), a start row and a trail length, so the loop is seamless.
    const cols = Array.from({ length: COLS }, () => ({ speed: r() < 0.6 ? 2 : 4, start: Math.floor(r() * ROWS), trail: 6 + Math.floor(r() * 12) }));
    // The rain is drawn full-screen but only the bands above and below the console are animated,
    // which keeps the package small enough for the TV's flash.
    const frames = Array.from({ length: FRAMES }, (_, f) => {
      const g = canvas(240, 240).fill('#000000');
      cols.forEach((c, x) => {
        const head = (c.start + f * c.speed) % ROWS;
        for (let k = 0; k <= c.trail; k++) {
          const row = (head - k + ROWS) % ROWS;
          if (row * 8 >= 240) continue;
          const ch = k > 0 && (f + x + row) % 7 === 0 ? glyphs[(row * 7 + f) % glyphs.length] : grid[x][row];
          g.text(ch, x * 6, row * 8, 8, k === 0 ? PALE : mix(GREEN, '#002A0C', k / c.trail));
        }
      });
      return g;
    });
    const band = (y0, h) => (f) => { const o = canvas(240, h); for (let y = 0; y < h; y++) o.px.set(frames[f].px.subarray((y0 + y) * 960, (y0 + y + 1) * 960), y * 960); return o; };
    const top = addAnimation(assets, 'rain-top', FRAMES, band(0, 52)), bottom = addAnimation(assets, 'rain-bottom', FRAMES, band(188, 52));
    const theme = meta('clock-matrix', 'Digital Rain');
    theme.data = [weatherSource()];
    theme.layers = [
      anim('rain-top', 0, 0, top, 6),
      anim('rain-bottom', 0, 188, bottom, 6),
      { id: 'console', type: 'shape', shape: 'rectangle', x: 6, y: 56, width: 228, height: 128, cornerRadius: 8, fill: '#000000', stroke: GREEN, strokeWidth: 1 },
      text('time', 120, 68, '{HH}:{MM}:{SS}', 24, PALE, { anchor: 'top-center' }),
      text('date', 120, 100, '{WEEKDAY} {DD} {MON}', 8, GREEN, { anchor: 'top-center' }),
      ...weatherIcons(assets, { x: 30, y: 120, palette: phosphor }),
      text('temp', 88, 128, '{w.t} C', 16, PALE),
      text('details', 88, 152, '{w.h}% RH  {w.w} KM/H', 8, GREEN),
    ];
    return { theme, assets };
  },
};
