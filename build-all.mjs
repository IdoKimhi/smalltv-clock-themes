// Builds every clock & weather theme (or the ones named on the command line), with previews.
// Run from the smalltv-studio root:  node clock-themes/build-all.mjs [flip swiss ...]
// then:                              python clock-themes/gallery.py
import { mkdirSync, writeFileSync } from 'node:fs';
import { C, S, vite } from './lib.mjs';

export const ALL = ['flip', 'swiss', 'terminal', 'sky', 'mood', 'calendar', 'pocket', 'matrix', 'aquarium', 'bauhaus', 'window', 'orbit'];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const weather = o => Object.fromEntries(Object.entries(o).map(([k, v]) => ['w.' + k, String(v)]));
// Open-Meteo sends decimals as written (18.4) and integers for humidity, codes and day/night.
export const SAMPLE = weather({ t: '18.4', f: '17.1', h: 72, c: 2, w: '15.8', d: 1 });
const TIME = Date.UTC(2026, 9, 15, 14, 27, 36);
const FRAMES = new URL('frames/', import.meta.url);
mkdirSync(FRAMES, { recursive: true });

const up = rgba => { const big = new Uint8ClampedArray(480 * 480 * 4); for (let y = 0; y < 480; y++) for (let x = 0; x < 480; x++) big.set(rgba.subarray(((y >> 1) * 240 + (x >> 1)) * 4, ((y >> 1) * 240 + (x >> 1)) * 4 + 4), (y * 480 + x) * 4); return big; };
for (const id of ids) {
  const dir = new URL(id + '/', import.meta.url), mod = (await import(new URL('theme.mjs', dir))).default;
  const { theme, assets } = await mod.build();
  const errors = C.validate(theme, assets);
  if (errors.length) { console.error(id + ':\n  ' + errors.join('\n  ')); continue; }
  const pkg = C.pack(theme, assets);
  writeFileSync(new URL('clock-' + id + '.stheme', dir), pkg);
  const samples = mod.samples?.(weather) ?? [['', SAMPLE]];
  for (const [name, data, time = TIME] of samples)
    writeFileSync(new URL('preview' + (name ? '-' + name : '') + '.png', dir), await S.encodePNG(480, 480, up(C.render(theme, assets, new Date(time), 0, data))));
  // Six seconds of animation for the GIF, with the clock ticking.
  const [, data, time = TIME] = samples[0], frames = [];
  for (let ms = 0; ms < 6000; ms += 250) frames.push(Buffer.from(C.render(theme, assets, new Date(time + ms), ms, data).buffer));
  writeFileSync(new URL(id + '.rgba', FRAMES), Buffer.concat(frames));
  writeFileSync(new URL(id + '.json', FRAMES), JSON.stringify({ id, name: theme.theme.name, blurb: mod.blurb, layers: theme.layers.length, bytes: pkg.length, extra: samples.slice(1).map(s => s[0]) }));
  console.log(id.padEnd(9), theme.layers.length + ' layers', (pkg.length / 1024).toFixed(0) + ' KiB');
}
await vite.close();
