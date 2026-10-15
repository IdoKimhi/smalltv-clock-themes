// Pocket: a four-shade handheld-console screen with a dialog box, stats and a little walker.
import { canvas, newAssets, addImage, addAnimation, weatherIcons, weatherSource, meta, text, image, anim, shades } from '../lib.mjs';

const [D0, D1, D2, D3] = ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'];
// Icons use the three darker shades so they stand out from the lightest-shade screen.
const lcd = shades([D0, D0, D1, D2]);

// 12x16 walker, two steps. '#' darkest, '+' dark, '.' light.
const WALK = [
  ['....####....', '...######...', '...#+##+#...', '...######...', '....####....', '..########..', '.##.####.##.', '.#..####..#.', '....####....', '....#..#....', '...##..##...', '...#....#...'],
  ['....####....', '...######...', '...#+##+#...', '...######...', '....####....', '..########..', '..#.####.#..', '..#.####.#..', '....####....', '....####....', '....#..#....', '....#..#....'],
];
function dialog(g, x0, y0, x1, y1) {
  g.color(D0); g.rect(x0, y0, x1, y1);
  g.color(D3); g.rect(x0 + 2, y0 + 2, x1 - 2, y1 - 2);
  g.color(D1); g.rect(x0 + 4, y0 + 4, x1 - 4, y0 + 4); g.rect(x0 + 4, y1 - 4, x1 - 4, y1 - 4); g.rect(x0 + 4, y0 + 4, x0 + 4, y1 - 4); g.rect(x1 - 4, y0 + 4, x1 - 4, y1 - 4);
}

export default {
  blurb: 'A four-shade handheld-console screen: dialog-box clock, an RPG-style stat window for the weather, and a character walking across the grass.',
  build() {
    const assets = newAssets(), g = canvas(240, 240).fill(D3);
    // Faint LCD pixel grid.
    g.color('#93B40F'); for (let i = 0; i < 240; i += 3) { g.rect(i, 0, i, 239); g.rect(0, i, 239, i); }
    dialog(g, 4, 4, 235, 74);
    dialog(g, 112, 82, 235, 160);
    for (const [i, k] of ['TMP', 'FEL', 'HUM', 'WND'].entries()) g.text(k, 122, 92 + i * 16, 16, D1);
    // Ground: grass line, tufts, a tree and a signpost.
    g.color(D2); g.rect(0, 196, 239, 239);
    g.color(D1); g.rect(0, 196, 239, 197);
    for (let x = 6; x < 240; x += 17) { g.set(x, 202); g.set(x + 1, 201); g.set(x + 2, 202); g.set(x + 8, 214); g.set(x + 9, 213); g.set(x + 10, 214); }
    g.color(D0); g.rect(28, 168, 31, 196); g.color(D1); g.disc(30, 160, 12); g.color(D0); g.disc(25, 156, 2); g.disc(35, 164, 2);
    g.color(D1); g.rect(206, 178, 207, 196); g.color(D0); g.rect(196, 172, 218, 180); g.color(D3); g.rect(198, 175, 216, 177);
    const walker = addAnimation(assets, 'walker', 24, f => {
      const s = canvas(240, 16), x = Math.round(-14 + f * 254 / 24), frame = WALK[f % 2];
      frame.forEach((row, y) => [...row].forEach((c, dx) => { if (c !== '.') { s.color(c === '#' ? D0 : D1); s.set(x + dx, y + 2); } }));
      return s;
    });
    const theme = meta('clock-pocket', 'Pocket');
    theme.display.background = D3;
    theme.data = [weatherSource()];
    theme.layers = [
      image('bg', 0, 0, addImage(assets, 'bg', g)),
      text('time', 16, 14, '{HH}:{MM}', 40, D0),
      text('seconds', 172, 30, '{SS}', 16, D1),
      text('date', 16, 56, '{WEEKDAY} {DD} {MON}', 8, D1),
      ...weatherIcons(assets, { x: 34, y: 92, palette: lcd }),
      text('temp', 166, 92, '{w.t}', 16, D0),
      text('feels', 166, 108, '{w.f}', 16, D0),
      text('humidity', 166, 124, '{w.h}%', 16, D0),
      text('wind', 166, 140, '{w.w}', 16, D0),
      anim('walker', 0, 180, walker, 4),
    ];
    return { theme, assets };
  },
};
