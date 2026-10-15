// Aquarium: fish swim past and bubbles rise behind the clock and the weather.
import { canvas, newAssets, addImage, addAnimation, weatherIcons, weatherSource, meta, text, image, anim, degree, rng, mix } from '../lib.mjs';

// 16x10 sprites, two tail positions. o orange, w white, k black, b blue, y yellow, d dark blue.
const CLOWN = [
  ['....kkkkk.......', '..kkoowookk....k', '.koooowoooookkok', 'kooookwoooowkook', 'kokooowoooowoook', 'kooookwoooowkook', '.koooowoooookkok', '..kkoowookk....k', '....kkkkk.......', '................'],
  ['....kkkkk.......', '..kkoowookk.....', '.koooowoooookk.k', 'kooookwoooowkkok', 'kokooowoooowooook', 'kooookwoooowkkok', '.koooowoooookk.k', '..kkoowookk.....', '....kkkkk.......', '................'],
];
const TANG = [
  ['.......ddddd....', '....ddbbbbbbdd..', 'y.ddbbbbbbbbbbd.', 'yyddbbbbbbbbkbbd', 'yyydbbbbbbbbbbbd', 'yyddbbbbbbbbbbbd', 'y.ddbbbbbbbbbbd.', '....ddbbbbbbdd..', '.......ddddd....', '................'],
  ['.......ddddd....', '....ddbbbbbbdd..', '..ddbbbbbbbbbbd.', 'y.ddbbbbbbbbkbbd', 'yyydbbbbbbbbbbbd', 'y.ddbbbbbbbbbbbd', '..ddbbbbbbbbbbd.', '....ddbbbbbbdd..', '.......ddddd....', '................'],
];
const COLORS = { o: '#FF7A1A', w: '#FFFFFF', k: '#1A1A1A', b: '#2E6BFF', y: '#FFD12E', d: '#173A8F' };
const sprite = (g, rows, x, y, flip) => rows.forEach((row, dy) => [...row].forEach((c, dx) => { if (COLORS[c]) { g.color(COLORS[c]); g.set(flip ? x + 15 - dx : x + dx, y + dy); } }));

export default {
  blurb: 'An aquarium with light rays, seaweed and sand: a clownfish and a blue tang swim past while bubbles rise beside the weather.',
  build() {
    const assets = newAssets(), g = canvas(240, 240), r = rng(8);
    g.vgrad(0, 0, 239, 239, [[0, '#1A7DB8'], [0.5, '#0E4F86'], [1, '#08305C']]);
    // Light rays from the surface.
    for (let y = 0; y < 200; y++) for (let x = 0; x < 240; x++) { const band = Math.sin((x + y * 0.45) * 0.07); if (band > 0.75) { g.color('#FFFFFF', Math.round((band - 0.75) * 120 * (1 - y / 200))); g.set(x, y); } }
    // Sand with pebbles, seaweed, rocks.
    for (let x = 0; x < 240; x++) { const top = 206 + Math.round(Math.sin(x * 0.05) * 3); g.color('#D9C08A'); g.rect(x, top, x, 239); }
    for (let i = 0; i < 70; i++) { g.color(r() > 0.5 ? '#B89C66' : '#EAD7A8'); g.set(Math.floor(r() * 240), 210 + Math.floor(r() * 30)); }
    const weed = (x0, h, color) => { g.color(color); for (let y = 0; y < h; y++) { const x = x0 + Math.round(Math.sin(y * 0.15) * 3); g.rect(x, 208 - y, x + 2, 208 - y); } };
    weed(8, 70, '#2E8B57'); weed(14, 50, '#3FA66B'); weed(226, 64, '#2E8B57'); weed(218, 40, '#3FA66B'); weed(118, 28, '#3FA66B');
    g.color('#5B6B7A'); g.disc(170, 210, 10); g.color('#6F8090'); g.disc(186, 214, 7); g.disc(60, 214, 8);
    // A bubble-shaped glass behind the weather icon.
    g.color('#FFFFFF', 40); g.disc(38, 108, 30); g.color('#FFFFFF', 90); g.ring(38, 108, 30); g.color('#FFFFFF', 160); g.disc(26, 92, 3);
    g.color('#0B2440', 160); g.rrect(40, 218, 200, 234, 7, '#0B2440', null);
    const fish = addAnimation(assets, 'fish', 24, f => {
      const s = canvas(240, 40), t = f / 24;
      sprite(s, CLOWN[f % 2], Math.round(-16 + t * 272), 6, false);
      sprite(s, TANG[(f + 1) % 2], Math.round(256 - ((t + 0.4) % 1) * 272), 24, true);
      return s;
    });
    const bubbles = addAnimation(assets, 'bubbles', 12, f => {
      const s = canvas(24, 120);
      for (const [x0, phase, size] of [[8, 0, 3], [16, 5, 2], [5, 8, 2], [14, 2, 1]]) {
        const y = 118 - ((f + phase) % 12) * 10, x = x0 + Math.round(Math.sin((f + phase) * 0.9) * 2);
        s.color('#E6F7FF', 200); s.ring(x, y, size); s.color('#FFFFFF'); s.set(x - 1, y - 1);
      }
      return s;
    });
    const theme = meta('clock-aquarium', 'Aquarium');
    theme.data = [weatherSource()];
    theme.layers = [
      image('bg', 0, 0, addImage(assets, 'bg', g)),
      anim('bubbles', 196, 76, bubbles, 4),
      anim('fish', 0, 146, fish, 3),
      text('time-shadow', 32, 12, '{HH}:{MM}', 48, '#06233F'),
      text('time', 30, 10, '{HH}:{MM}', 48, '#FFFFFF'),
      text('date', 120, 60, '{WEEKDAY}, {DD} {MON}', 16, '#BFE9FF', { anchor: 'top-center' }),
      ...weatherIcons(assets, { x: 14, y: 84 }),
      text('temp', 176, 92, '{w.t}', 32, '#FFFFFF', { anchor: 'top-right' }),
      degree('temp-deg', 176, 92, 32, '#FFFFFF'),
      text('feels', 176, 126, 'feels {w.f}', 8, '#BFE9FF', { anchor: 'top-right' }),
      text('details', 120, 222, '{w.h}% humidity  {w.w} km/h', 8, '#BFE9FF', { anchor: 'top-center' }),
    ];
    return { theme, assets };
  },
};
