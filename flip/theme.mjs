// Flip Clock: split-flap cards for hours and minutes, with a weather strip below.
import { canvas, newAssets, addImage, weatherIcons, weatherSource, meta, text, image, degree, stops, rng, TEMP_STOPS } from '../lib.mjs';

export default {
  blurb: 'Split-flap cards for hours and minutes, amber seconds, and a weather strip with an animated icon.',
  build() {
    const assets = newAssets(), bg = canvas(240, 240);
    // Charcoal with a soft vignette and a little grain.
    const r = rng(3);
    for (let y = 0; y < 240; y++) for (let x = 0; x < 240; x++) {
      const d = Math.hypot(x - 120, y - 110) / 170, v = 26 - d * 14 + r() * 3;
      bg.color('#000000'); bg.c = [v, v, v + 1]; bg.set(x, y);
    }
    // Two flip cards: lighter top half, darker bottom half, a highlight along the top edge.
    const CARD = [[10, 114], [126, 230]], TOP = 16, BOT = 116, MID = 66;
    for (const [x0, x1] of CARD) {
      bg.rrect(x0 + 2, TOP + 4, x1 + 2, BOT + 4, 9, '#0B0B0C');
      bg.rrect(x0, TOP, x1, BOT, 9, '#2E2E31');
      for (let y = MID; y <= BOT; y++) for (let x = x0; x <= x1; x++) { const p = bg.get(x, y); if (p[0] === 46) { bg.color('#27272A'); bg.set(x, y); } }
      bg.color('#3D3D41'); bg.rect(x0 + 8, TOP, x1 - 8, TOP);
    }
    // Seconds pill and the weather strip.
    bg.rrect(98, 122, 142, 142, 10, '#1E1E20', '#3A3A3D');
    bg.rrect(8, 166, 232, 232, 10, '#1B1B1D', '#2C2C2F');
    // Small humidity drop and wind lines next to their values.
    bg.color('#7FB7FF'); bg.disc(181, 186, 3); bg.line(181, 179, 178, 184); bg.line(181, 179, 184, 184);
    bg.color('#C8C8CC'); bg.line(164, 207, 175, 207); bg.line(164, 211, 177, 211); bg.line(164, 215, 172, 215);
    bg.text('FEELS', 126, 215, 8, '#77777C', 'top-right');
    const bgPath = addImage(assets, 'bg', bg);

    // The split line and hinges, drawn over the digits.
    const split = canvas(224, 8);
    for (const [x0, x1] of CARD) {
      split.color('#0A0A0B'); split.rect(x0 - 8, 3, x1 - 8, 4);
      split.color('#000000', 90); split.rect(x0 - 8, 5, x1 - 8, 5);
      split.color('#111113'); split.rect(x0 - 10, 1, x0 - 7, 6); split.rect(x1 - 9, 1, x1 - 6, 6);
    }
    const splitPath = addImage(assets, 'split', split);

    const theme = meta('clock-flip', 'Flip Clock');
    theme.data = [weatherSource(['t', 'f', 'h', 'c', 'w', 'd'])];
    theme.layers = [
      image('bg', 0, 0, bgPath),
      text('hours', 62, 38, '{HH}', 64, '#F2F2F2', { anchor: 'top-center' }),
      text('minutes', 178, 38, '{MM}', 64, '#F2F2F2', { anchor: 'top-center' }),
      image('split', 8, MID - 4, splitPath),
      text('seconds', 120, 126, '{SS}', 16, '#FFB000', { anchor: 'top-center' }),
      text('date', 120, 148, '{WEEKDAY}, {DD} {MON}', 16, '#B5B5BA', { anchor: 'top-center' }),
      ...weatherIcons(assets, { x: 6, y: 175 }),
      text('temp', 154, 178, '{w.t}', 32, '#FFE27A', { anchor: 'top-right', bind: { color: stops('w.t', ...TEMP_STOPS) } }),
      degree('temp-deg', 154, 178, 32, '#FFE27A', stops('w.t', ...TEMP_STOPS)),
      text('feels', 154, 215, '{w.f}', 8, '#A0A0A6', { anchor: 'top-right' }),
      text('humidity', 226, 178, '{w.h}%', 16, '#7FB7FF', { anchor: 'top-right' }),
      text('wind', 226, 204, '{w.w}', 16, '#E2E2E6', { anchor: 'top-right' }),
    ];
    return { theme, assets };
  },
};
