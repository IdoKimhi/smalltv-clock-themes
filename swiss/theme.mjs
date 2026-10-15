// Swiss Minimal: huge stacked hours and minutes on off-white paper, black and signal red.
import { canvas, newAssets, addImage, weatherIcons, weatherSource, meta, text, image, degree, luma, hex } from '../lib.mjs';

const PAPER = '#F2EFE8', INK = '#141414', RED = '#E3262E';
// Icons become flat silhouettes: warm colors (sun, lightning) red, everything else ink.
const swiss = c => { const [r, g, b] = hex(c); return r > 200 && g > 120 && b < 140 ? RED : luma(c) > 0.93 ? '#8C8A84' : INK; };

export default {
  blurb: 'International Typographic Style: giant stacked digits, a red rule, and a quiet date and weather column. Light theme.',
  build() {
    const assets = newAssets(), bg = canvas(240, 240).fill(PAPER);
    bg.color(RED); bg.rect(171, 14, 173, 226);
    bg.color(INK); bg.rect(14, 200, 160, 200);
    bg.text('FEELS LIKE', 14, 206, 8, '#6E6B64');
    bg.text('HUMIDITY', 14, 220, 8, '#6E6B64');
    bg.text('WIND', 106, 220, 8, '#6E6B64');
    const theme = meta('clock-swiss', 'Swiss Minimal');
    theme.display.background = PAPER;
    theme.data = [weatherSource()];
    theme.layers = [
      image('bg', 0, 0, addImage(assets, 'bg', bg)),
      text('hours', 14, 12, '{HH}', 96, INK),
      text('minutes', 14, 106, '{MM}', 96, INK),
      text('seconds', 182, 14, '{SS}', 24, RED),
      text('weekday', 182, 48, '{WD}', 16, INK),
      text('day', 182, 66, '{DD}', 32, INK),
      text('month', 182, 98, '{MON}', 16, INK),
      ...weatherIcons(assets, { x: 182, y: 126, palette: swiss }),
      text('temp', 224, 180, '{w.t}', 16, INK, { anchor: 'top-right' }),
      degree('temp-deg', 224, 180, 16, INK),
      text('feels', 160, 206, '{w.f}', 8, INK, { anchor: 'top-right' }),
      text('humidity', 94, 220, '{w.h}%', 8, INK, { anchor: 'top-right' }),
      text('wind', 160, 220, '{w.w}', 8, INK, { anchor: 'top-right' }),
    ];
    return { theme, assets };
  },
};
