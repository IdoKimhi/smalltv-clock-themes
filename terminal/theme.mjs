// Terminal: a green-phosphor CRT session that prints the time and the weather.
import { canvas, newAssets, addImage, addAnimation, weatherIcons, weatherSource, meta, text, image, anim, shades } from '../lib.mjs';

const BRIGHT = '#8CFF9E', MID = '#38D45A', DIM = '#1F7A36';
const phosphor = shades(['#0C3D18', '#1F7A36', '#38D45A', '#8CFF9E']);

export default {
  blurb: 'A green-phosphor CRT shell session: scanlines, prompts, key/value weather output and a blinking cursor.',
  build() {
    const assets = newAssets(), bg = canvas(240, 240);
    for (let y = 0; y < 240; y++) for (let x = 0; x < 240; x++) {
      // Scanlines, plus a glow that fades towards the curved corners.
      const d = Math.hypot((x - 120) / 120, (y - 120) / 120), v = Math.max(0, 1 - d * 0.55);
      bg.color('#000000'); bg.c = [2, (y % 2 ? 9 : 15) * v + 2, (y % 2 ? 4 : 7) * v + 1]; bg.set(x, y);
    }
    const prompt = 'pi@smalltv:~$ ';
    bg.text(prompt + 'date', 6, 6, 8, DIM);
    bg.text(prompt + 'weather --now', 6, 80, 8, DIM);
    for (const [i, k] of ['temp', 'feel', 'humi', 'wind'].entries()) bg.text(k, 62, 94 + i * 18, 16, MID);
    bg.text('[ ok ] ntp: clock synchronised', 6, 186, 8, DIM);
    bg.text('[ ok ] open-meteo: 200 OK', 6, 198, 8, DIM);
    bg.text(prompt, 6, 218, 8, MID);
    const cursor = addAnimation(assets, 'cursor', 2, f => { const g = canvas(6, 9); if (f === 0) g.color(BRIGHT).rect(0, 0, 5, 8); return g; });

    const theme = meta('clock-terminal', 'Terminal');
    theme.data = [weatherSource()];
    theme.layers = [
      image('bg', 0, 0, addImage(assets, 'bg', bg)),
      text('time', 6, 20, '{HH}:{MM}:{SS}', 32, BRIGHT),
      text('date', 6, 56, '{WD} {DD} {MON} {YYYY}', 16, MID),
      ...weatherIcons(assets, { x: 6, y: 100, palette: phosphor }),
      text('temp', 122, 94, '{w.t} C', 16, BRIGHT),
      text('feels', 122, 112, '{w.f} C', 16, BRIGHT),
      text('humidity', 122, 130, '{w.h} %', 16, BRIGHT),
      text('wind', 122, 148, '{w.w} km/h', 16, BRIGHT),
      anim('cursor', 90, 217, cursor, 1),
    ];
    return { theme, assets };
  },
};
