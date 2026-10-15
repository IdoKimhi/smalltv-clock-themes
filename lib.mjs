// Shared toolkit for the clock & weather themes: raster drawing, the device font,
// recolorable animated weather icons, Open-Meteo data and manifest helpers.
import { createServer } from 'vite';

export const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
export const C = await vite.ssrLoadModule('/src/core/core.ts');
export const S = await vite.ssrLoadModule('/src/core/source.ts');
const { font } = await vite.ssrLoadModule('/src/core/font.ts');

/* ---------- weather data: Open-Meteo, free and keyless ---------- */
// Change latitude/longitude (and add &temperature_unit=fahrenheit or &wind_speed_unit=mph) in the Data tab.
export const WEATHER_URL = 'http://api.open-meteo.com/v1/forecast?latitude=51.51&longitude=-0.13&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=auto';
// w.t temperature, w.f feels like, w.h humidity %, w.c WMO weather code, w.w wind, w.d 1 by day / 0 at night
export const weatherSource = (fields = ['t', 'f', 'h', 'c', 'w', 'd']) => ({
  id: 'w', url: WEATHER_URL, interval: 600,
  fields: fields.map(id => ({ id, path: 'current.' + { t: 'temperature_2m', f: 'apparent_temperature', h: 'relative_humidity_2m', c: 'weather_code', w: 'wind_speed_10m', d: 'is_day' }[id] })),
});

/* ---------- colors ---------- */
export const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
export const toHex = rgb => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
export const ramp = (stops, t) => {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
  return stops.at(-1)[1];
};
export const luma = c => { const [r, g, b] = hex(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
// Maps any color onto a fixed set of shades by brightness (Game Boy, phosphor green...).
export const shades = list => c => list[Math.min(list.length - 1, Math.floor(luma(c) * list.length))];
// Deterministic random numbers, so every build is identical.
export const rng = (seed = 1) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/* ---------- raster ---------- */
export function canvas(w, h, palette = c => c) {
  const px = new Uint8ClampedArray(w * h * 4);
  const g = {
    w, h, px, c: [255, 255, 255], a: 255, palette,
    color(c, a = 255) { g.c = hex(g.palette(c)); g.a = a; return g; },
    set(x, y) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const i = (y * w + x) * 4;
      if (g.a >= 255 || px[i + 3] === 0) { px.set([...g.c, g.a], i); return; }
      const t = g.a / 255; // blend over what is already there
      px.set([px[i] + (g.c[0] - px[i]) * t, px[i + 1] + (g.c[1] - px[i + 1]) * t, px[i + 2] + (g.c[2] - px[i + 2]) * t, Math.max(px[i + 3], g.a)], i);
    },
    get(x, y) { const i = (y * w + x) * 4; return [px[i], px[i + 1], px[i + 2], px[i + 3]]; },
    has(x, y) { return x >= 0 && y >= 0 && x < w && y < h && px[(y * w + x) * 4 + 3] > 0; },
    erase(x, y) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < w && y < h) px.fill(0, (y * w + x) * 4, (y * w + x) * 4 + 4); },
    fill(c) { g.color(c); g.rect(0, 0, w - 1, h - 1); return g; },
    rect(x0, y0, x1, y1) { for (let y = Math.round(y0); y <= y1; y++) for (let x = Math.round(x0); x <= x1; x++) g.set(x, y); },
    disc(cx, cy, r, f = g.set) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) f(cx + x, cy + y); },
    ring(cx, cy, r, t = 1) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = x * x + y * y; if (d <= r * r + r * 0.6 && d > (r - t) * (r - t) + (r - t) * 0.6) g.set(cx + x, cy + y); } },
    line(x0, y0, x1, y1, t = 1) {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 || 1;
      for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; for (let a = 0; a < t; a++) for (let b = 0; b < t; b++) g.set(x + a - (t >> 1), y + b - (t >> 1)); }
    },
    // Rounded rectangle, optionally outlined.
    rrect(x0, y0, x1, y1, r, fill, stroke) {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r), d = (x - cx) ** 2 + (y - cy) ** 2;
        if (d > r * r + r * 0.4) continue;
        const edge = stroke && (x === x0 || x === x1 || y === y0 || y === y1 || d > (r - 1) * (r - 1) + (r - 1) * 0.4);
        g.color(edge ? stroke : fill); g.set(x, y);
      }
    },
    // Vertical gradient between y0 and y1.
    vgrad(x0, y0, x1, y1, stops) { for (let y = y0; y <= y1; y++) { g.color(ramp(stops, (y - y0) / Math.max(1, y1 - y0))); g.rect(x0, y, x1, y); } },
    blit(src, ox, oy) { for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) { const p = src.get(x, y); if (p[3]) { g.c = [p[0], p[1], p[2]]; g.a = p[3]; g.set(ox + x, oy + y); } } g.a = 255; },
    // Text in the device font, pixel for pixel like the firmware draws it.
    text(s, x, y, size, color, anchor = 'top-left', alpha = 255) {
      const cell = Math.ceil(size * 6 / 8), w = s.length * cell, a = ['top-left', 'top-center', 'top-right'].indexOf(anchor);
      const left = x - Math.trunc(w * Math.max(0, a) / 2);
      g.color(color, alpha);
      for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < w; dx++) {
        const col = Math.floor((dx % cell) * 6 / cell), row = Math.floor(dy * 8 / size), ch = s.charCodeAt(Math.floor(dx / cell));
        if (col < 5 && (font[ch * 5 + col] & (1 << row))) g.set(left + dx, y + dy);
      }
      return w;
    },
  };
  return g;
}
export const scale = (g, k) => {
  const o = canvas(g.w * k, g.h * k);
  for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) { const i = (Math.floor(y / k) * g.w + Math.floor(x / k)) * 4; o.px.set(g.px.subarray(i, i + 4), (y * o.w + x) * 4); }
  return o;
};
export const shift = (g, dx, dy = 0) => {
  const o = canvas(g.w, g.h);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const sx = x - dx, sy = y - dy; if (sx >= 0 && sy >= 0 && sx < g.w && sy < g.h) o.px.set(g.px.subarray((sy * g.w + sx) * 4, (sy * g.w + sx) * 4 + 4), (y * g.w + x) * 4); }
  return o;
};

/* ---------- assets ---------- */
export const newAssets = () => new Map();
export const addImage = (assets, name, g) => { assets.set('images/' + name + '.png.sti', C.fromRGBA(g.w, g.h, g.px)); return 'images/' + name + '.png'; };
export const addAnimation = (assets, name, frames, draw) => {
  let w, h;
  for (let f = 0; f < frames; f++) { const g = draw(f, frames); w = g.w; h = g.h; assets.set('anim/' + name + '/' + String(f).padStart(3, '0') + '.png.sti', C.fromRGBA(g.w, g.h, g.px)); }
  return { source: 'anim/' + name, width: w, height: h, frames };
};

/* ---------- 24x24 weather glyphs (calm animations), recolorable through the canvas palette ---------- */
const cloudShape = (g, ox, oy, dy = 0) => { g.disc(ox + 7, oy + 14 + dy, 4); g.disc(ox + 12, oy + 10 + dy, 6); g.disc(ox + 17, oy + 14 + dy, 4); g.rect(ox + 7, oy + 14 + dy, ox + 17, oy + 18 + dy); };
const cloud = (g, ox, oy, dy, top, shade) => { g.color(shade); cloudShape(g, ox, oy, dy); g.color(top); cloudShape(g, ox, oy - 1, dy); };
const rays = (g, cx, cy, r0, r1) => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.line(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 2); } };
const drops = (g, ox, oy, f, color) => { g.color(color); [[8, 0], [13, 2], [18, 4]].forEach(([x, p]) => { const y = 15 + ((f + p) % 6); g.line(ox + x, oy + y, ox + x - 1, oy + y + 2, 2); }); };
export const glyphs = {
  sun(g, f, n) { g.color('#FFB347'); rays(g, 12, 12, 8, 10.5); g.color('#FFCC00'); g.disc(12, 12, 5); g.color('#FFE680'); g.disc(11, 11, 2); },
  moon(g, f) {
    g.color('#C9D6FF'); g.disc(10, 13, 7); g.disc(14, 10, 6, (x, y) => g.erase(x, y));
    const star = (x, y, on) => { g.color(on ? '#FFFFFF' : '#5A6A8A'); g.set(x, y); if (on) { g.set(x - 1, y); g.set(x + 1, y); g.set(x, y - 1); g.set(x, y + 1); } };
    star(19, 5, f % 4 < 2); star(21, 15, f % 4 >= 2); star(15, 21, (f + 1) % 4 < 2);
  },
  partly(g) { g.color('#FFB347'); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.line(15 + Math.cos(a) * 6, 8 + Math.sin(a) * 6, 15 + Math.cos(a) * 8, 8 + Math.sin(a) * 8, 2); } g.color('#FFCC00'); g.disc(15, 8, 4); cloud(g, -2, 0, 2, '#E0E6EE', '#9AA5B1'); },
  cloud(g) { cloud(g, 0, 0, 1, '#C8D2DC', '#8A949E'); },
  rain(g, f) { cloud(g, 0, 0, -3, '#B8C4D0', '#7A8794'); drops(g, 0, 0, f, '#4DA6FF'); },
  snow(g, f, n) {
    cloud(g, 0, 0, -3, '#E0E6EE', '#9AA5B1'); g.color('#FFFFFF');
    [[7, 0], [12, 3], [17, 1], [10, 5], [15, 4]].forEach(([x, p]) => { const t = (f + p) % n, y = 16 + t * 7 / n; g.rect(x + (t % 4 < 2 ? 0 : 1), y, x + (t % 4 < 2 ? 1 : 2), y + 1); });
  },
  storm(g, f) {
    cloud(g, 0, 0, -3, '#9AA5B1', '#5E6873'); drops(g, 0, 0, f, '#4DA6FF');
    if (f === 0) { g.color('#FFE066'); g.line(13, 12, 10, 17, 2); g.line(10, 17, 14, 17, 2); g.line(14, 17, 11, 23, 2); }
  },
};
// WMO weather-code bands, each shown by its own layer. [id, glyph, lowest code, highest code, frames, fps, day]
export const BANDS = [
  ['sun', 'sun', 0, 1, 8, 2, 1], ['moon', 'moon', 0, 1, 8, 2, 0], ['partly', 'partly', 2, 2, 8, 2],
  ['cloud', 'cloud', 3, 48, 8, 2], ['rain', 'rain', 49, 67, 6, 4], ['snow', 'snow', 68, 79, 8, 3],
  ['showers', 'rain', 80, 84, 6, 4], ['flurries', 'snow', 85, 94, 8, 3], ['storm', 'storm', 95, 99, 8, 4],
];
const DRIFT = { cloud: true, partly: true, sun: true };
/* Builds the animated icon set and returns the layers that show the right one.
 * k: 1 (24px) or 2 (48px); palette recolors every pixel; decorate(g, f, band) draws extras (e.g. a caption) onto each frame. */
export function weatherIcons(assets, { prefix = 'wx', x, y, k = 2, palette = c => c, field = 'w.c', dayField = 'w.d', decorate, pad = 0 }) {
  const OFF = 300;
  return BANDS.map(([id, glyph, lo, hi, frames, fps, day]) => {
    const anim = addAnimation(assets, prefix + '-' + id, frames, f => {
      const g = canvas(24, 24, palette); glyphs[glyph](g, f, frames);
      let out = scale(g, k);
      if (DRIFT[glyph]) out = shift(out, Math.round(Math.sin(f / frames * 2 * Math.PI)));
      if (pad || decorate) { const o = canvas(out.w + 2 * pad, out.h + 2 * pad + (decorate ? 12 : 0), palette); o.blit(out, pad, pad); decorate?.(o, f, id); out = o; }
      return out;
    });
    return { id: prefix + '-' + id, type: 'animation', x: OFF, y: OFF, ...anim, fps, loop: true, bind: bandBind(lo, hi, day, x, y, field, dayField) };
  });
}
/* Shows a layer at (x, y) only while the weather code is within [lo, hi]: x leaves when the code is above,
 * y when it is below. Clear-sky bands use y for day (1) / night (0) instead, since no code is below 0. */
export function bandBind(lo, hi, day, x, y, field = 'w.c', dayField = 'w.d') {
  const OFF = 300, bind = { x: { source: field, input: [hi + 0.5, hi + 0.51], output: [x, OFF] } };
  bind.y = day === undefined ? { source: field, input: [lo - 0.51, lo - 0.5], output: [OFF, y] }
    : day ? { source: dayField, input: [0.49, 0.5], output: [OFF, y] } : { source: dayField, input: [0.5, 0.51], output: [y, OFF] };
  return bind;
}

/* ---------- manifest helpers ---------- */
export const text = (id, x, y, value, size, color, extra = {}) => ({ id, type: 'text', x, y, value, size, color, ...extra });
export const image = (id, x, y, source, extra = {}) => ({ id, type: 'image', x, y, source, ...extra });
export const anim = (id, x, y, a, fps, extra = {}) => ({ id, type: 'animation', x, y, ...a, fps, loop: true, ...extra });
export const rect = (id, x, y, width, height, fill, extra = {}) => ({ id, type: 'shape', shape: 'rectangle', x, y, width, height, fill, ...extra });
export const circle = (id, x, y, radius, extra) => ({ id, type: 'shape', shape: 'circle', x, y, radius, ...extra });
export const stops = (source, ...pairs) => ({ source, stops: pairs.map(([at, value]) => ({ at, value })) });
// A degree ring after right-aligned text that ends at x (size 16 / 24 / 32 text).
export const degree = (id, x, y, size, color, bind) => circle(id, x + Math.round(size / 8) + 2, y + Math.round(size / 8) + 1, Math.max(2, Math.round(size / 8)), { stroke: color, strokeWidth: size >= 24 ? 2 : 1, ...(bind && { bind: { stroke: bind } }) });
export const meta = (id, name, version = '1.0.0') => ({ spec: 1, theme: { id, name, author: 'idokimhi', version }, display: { width: 240, height: 240, background: '#000000' } });
export const TEMP_STOPS = [[-60, '#7FB2FF'], [5, '#8FD3FF'], [14, '#B8F0C8'], [20, '#FFE27A'], [27, '#FFB054'], [33, '#FF6A5C']];
