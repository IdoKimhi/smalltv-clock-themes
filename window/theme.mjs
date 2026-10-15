// Room with a View: a cozy pixel room; the window shows the actual weather outside.
import { canvas, newAssets, addImage, addAnimation, weatherSource, meta, text, image, anim, degree, bandBind, BANDS, rng, mix, scale } from '../lib.mjs';

const W = 86, H = 80; // the scene seen through the glass
const SKIES = {
  day: ['#3C93E0', '#BFE4FA'], night: ['#0A1636', '#26407A'], partly: ['#5AA2DE', '#CFE6F5'], cloudy: ['#8592A3', '#C9D0D9'],
  rain: ['#56606E', '#8B95A2'], snow: ['#A9B3C0', '#E1E6EC'], storm: ['#262B3A', '#4A5163'],
};
function puff(g, cx, cy, s, color, alpha = 255) { g.color(color, alpha); for (const [dx, dy, r] of [[0, 0, 7], [8, -4, 9], [18, 0, 7], [9, 3, 7]]) g.disc(Math.round(cx + dx * s), Math.round(cy + dy * s), Math.round(r * s)); }
function scene(kind, f, n) {
  const g = canvas(W, H), r = rng(5), sway = Math.round(Math.sin(f / n * 2 * Math.PI) * 2);
  if (kind === 'storm' && f === 0) g.vgrad(0, 0, W - 1, H - 1, [[0, '#8A93AD'], [1, '#B9C0D2']]); // lightning flash
  else g.vgrad(0, 0, W - 1, H - 1, [[0, SKIES[kind][0]], [1, SKIES[kind][1]]]);
  if (kind === 'night') {
    for (let i = 0; i < 26; i++) { const x = Math.floor(r() * W), y = Math.floor(r() * 50), on = (i + f) % 5 !== 0; g.color(on ? '#FFFFFF' : '#5A6C9A'); g.set(x, y); }
    g.color('#F4F1D8'); g.disc(64, 16, 7); g.color(SKIES.night[0]); g.disc(68, 13, 6);
  }
  if (kind === 'day' || kind === 'partly') {
    g.color('#FFE37A'); g.disc(kind === 'day' ? 62 : 56, 18, 8); g.color('#FFF4BF'); g.disc(kind === 'day' ? 60 : 54, 16, 3);
    // Two birds gliding across.
    g.color('#22324A'); const bx = (f * 11) % (W + 20) - 10;
    for (const [x, y] of [[bx, 30], [bx - 9, 36]]) { g.line(x - 3, y - 2, x, y); g.line(x, y, x + 3, y - 2); }
  }
  if (kind === 'day') puff(g, 8 + sway, 30, 0.8, '#FFFFFF', 230);
  if (kind === 'partly') { puff(g, 34 + sway, 22, 1.1, '#FFFFFF'); puff(g, 4 - sway, 40, 0.8, '#F2F5F8'); }
  if (kind === 'cloudy') { puff(g, -4 + sway, 14, 1.2, '#E4E8ED'); puff(g, 44 - sway, 24, 1.1, '#D3D9E0'); puff(g, 14 + sway, 38, 0.9, '#EEF1F4'); }
  if (kind === 'rain' || kind === 'storm' || kind === 'snow') { puff(g, -6, 4, 1.3, kind === 'storm' ? '#1E222E' : '#7C8693'); puff(g, 40, 2, 1.4, kind === 'storm' ? '#1A1E29' : '#717B88'); }
  // Hills, a house and its chimney; snow covers them in winter.
  const ground = kind === 'snow' ? ['#F4F7FA', '#DCE3EA'] : kind === 'night' ? ['#13304A', '#0C2133'] : kind === 'storm' || kind === 'rain' ? ['#3E6B45', '#2F5737'] : ['#6DB35A', '#4C9A45'];
  for (let x = 0; x < W; x++) { g.color(ground[0]); g.rect(x, Math.round(60 - 6 * Math.sin(x * 0.05 + 0.6)), x, H - 1); g.color(ground[1]); g.rect(x, Math.round(70 - 4 * Math.sin(x * 0.08 + 2)), x, H - 1); }
  g.color(kind === 'night' ? '#0A1622' : '#B9876A'); g.rect(14, 52, 28, 62); g.color(kind === 'snow' ? '#FFFFFF' : kind === 'night' ? '#08121C' : '#9C3B30'); for (let i = 0; i < 9; i++) g.rect(11 + i, 52 - i, 31 - i, 52 - i);
  g.color(kind === 'night' ? '#FFD36B' : '#3B2A20'); g.rect(19, 55, 22, 58);
  if (kind === 'rain' || kind === 'storm') { g.color('#A8C8EE', 200); for (let i = 0; i < 22; i++) { const x = Math.floor(r() * (W + 20)) - 10, y = (Math.floor(r() * H) + f * 14) % (H + 10) - 5; g.line(x, y, x - 2, y + 5); } }
  if (kind === 'storm' && f === 0) { g.color('#FFF6B0'); g.line(52, 6, 46, 22, 2); g.line(46, 22, 54, 22, 2); g.line(54, 22, 47, 40, 2); }
  if (kind === 'snow') { g.color('#FFFFFF'); for (let i = 0; i < 24; i++) { const x = (Math.floor(r() * W) + Math.round(Math.sin(f + i) * 2) + W) % W, y = (Math.floor(r() * H) + f * 5) % H; g.set(x, y); if (i % 3 === 0) g.set(x + 1, y); } }
  return g;
}
// Which scene each weather band shows. Showers and flurries reuse the rain and snow scenes.
const SCENE = { sun: 'day', moon: 'night', partly: 'partly', cloud: 'cloudy', rain: 'rain', snow: 'snow', showers: 'rain', flurries: 'snow', storm: 'storm' };
const TIMING = { day: [8, 2], night: [8, 2], partly: [8, 2], cloudy: [8, 2], rain: [6, 5], snow: [8, 3], storm: [8, 4] };
const CAT = ['....##..##.......', '...#..##..#......', '...#......#......', '..#..#..#..#.....', '..#........######', '.#..........#####', '.#...........####', '..###########.###'];

export default {
  blurb: 'A cozy pixel room. The window shows the real weather outside (sun and birds, clouds, rain, snow, lightning, or a starry night), next to an LED clock, a wall calendar and a chalkboard. A cat sleeps on the rug.',
  samples: w => [['', w({ t: '18.4', f: '17.1', h: 72, c: 2, w: '15.8', d: 1 })], ['rain', w({ t: '9.6', f: '6.8', h: 94, c: 63, w: '28.1', d: 1 })], ['night', w({ t: '7.2', f: '5.0', h: 80, c: 0, w: '4.2', d: 0 }), Date.UTC(2026, 9, 15, 23, 5, 0)]],
  build() {
    const assets = newAssets(), g = canvas(240, 240), r = rng(13);
    // Wallpaper with thin stripes, a skirting board and a plank floor with a round rug.
    for (let x = 0; x < 240; x++) { g.color(x % 12 < 2 ? '#E2C79E' : '#ECD5B0'); g.rect(x, 0, x, 185); }
    g.color('#7A5236'); g.rect(0, 184, 239, 189);
    for (let y = 190; y < 240; y += 10) for (let x = 0; x < 240; x++) { g.color(((x + (y / 10) * 37) % 60) < 1 ? '#5E3D27' : mix('#8A5A3B', '#7A4E33', ((y - 190) % 10) / 10)); g.set(x, y); g.set(x, y + 1); for (let k = 2; k < 10; k++) { g.color(((x + (y / 10) * 37) % 60) < 1 ? '#5E3D27' : '#8A5A3B'); g.set(x, y + k); } }
    for (let y = 196; y < 236; y++) for (let x = 6; x < 120; x++) { const d = ((x - 63) / 56) ** 2 + ((y - 216) / 18) ** 2; if (d < 1) { g.color(d > 0.75 ? '#7E2F3A' : d > 0.55 ? '#D9B36A' : '#A33B48'); g.set(x, y); } }
    // Curtain rod, curtains, window frame and sill (the glass area is left for the scene layers).
    g.color('#4A3220'); g.rect(2, 18, 128, 20); g.disc(3, 19, 3); g.disc(127, 19, 3);
    for (const x0 of [4, 110]) for (let x = x0; x < x0 + 16; x++) { g.color(((x - x0) % 5) < 2 ? '#9E2B30' : '#C23B3F'); g.rect(x, 21, x, 150); }
    g.color('#6B4A2E'); g.rect(16, 26, 113, 117);
    g.color('#8A6240'); g.rect(10, 117, 119, 123); g.color('#5A3C24'); g.rect(10, 123, 119, 124);
    // LED clock, wall calendar and chalkboard.
    g.rrect(132, 20, 234, 66, 6, '#232326', '#3B3B40');
    g.color('#000000', 60); g.rect(150, 76, 220, 124);
    g.color('#FAF7F0'); g.rect(148, 74, 218, 122); g.color('#D93A2B'); g.rect(148, 74, 218, 86);
    g.rrect(130, 132, 236, 178, 3, '#6B4A2E'); g.color('#2F4F3A'); g.rect(134, 136, 232, 174);
    g.color('#FFFFFF', 90); g.rect(140, 170, 152, 171);
    const scenes = {};
    for (const [kind, [frames]] of Object.entries(TIMING)) scenes[kind] = addAnimation(assets, 'scene-' + kind, frames, f => scene(kind, f, frames));
    // Window bars and a glass reflection, drawn over the scenes.
    const glass = canvas(W, H);
    glass.color('#6B4A2E'); glass.rect(W / 2 - 2, 0, W / 2 + 1, H - 1); glass.rect(0, H / 2 - 2, W - 1, H / 2 + 1);
    glass.color('#FFFFFF', 45); for (let i = 0; i < 18; i++) { glass.set(6 + i, 30 - i); glass.set(7 + i, 30 - i); glass.set(50 + i, 74 - i); }
    const cat = addAnimation(assets, 'cat', 2, f => {
      const s = canvas(20, 12);
      CAT.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') { s.color(y < 2 ? '#B9621E' : '#E0893A'); s.set(x, y + (f && y > 3 ? 0 : 1) + 2); } }));
      s.color('#B9621E'); s.rect(1, 10, 16, 11);
      return scale(s, 2);
    });
    const theme = meta('clock-window', 'Room with a View');
    theme.display.background = '#ECD5B0';
    theme.data = [weatherSource()];
    theme.layers = [
      image('bg', 0, 0, addImage(assets, 'bg', g)),
      ...BANDS.map(([id, , lo, hi, , , day]) => { const kind = SCENE[id], [, fps] = TIMING[kind]; return { id: 'scene-' + id, type: 'animation', x: 300, y: 300, ...scenes[kind], fps, loop: true, bind: bandBind(lo, hi, day, 22, 32) }; }),
      image('glass', 22, 32, addImage(assets, 'glass', glass)),
      anim('cat', 44, 194, cat, 1),
      text('time', 183, 28, '{HH}:{MM}', 24, '#FF4D3D', { anchor: 'top-center' }),
      text('weekday', 183, 54, '{WEEKDAY}', 8, '#B0362C', { anchor: 'top-center' }),
      text('month', 183, 77, '{MON}', 8, '#FFFFFF', { anchor: 'top-center' }),
      text('day', 183, 92, '{DD}', 24, '#262321', { anchor: 'top-center' }),
      text('temp', 214, 142, '{w.t}', 24, '#F4F4EE', { anchor: 'top-right' }),
      degree('temp-deg', 214, 142, 24, '#F4F4EE'),
      text('details', 228, 164, '{w.h}%  {w.w}km/h', 8, '#CFE3D2', { anchor: 'top-right' }),
    ];
    return { theme, assets };
  },
};
