// Bauhaus: flat primary shapes; the big circle takes the color of the weather.
import { canvas, newAssets, addImage, weatherSource, meta, text, image, circle, stops } from '../lib.mjs';

const CREAM = '#EFE6D2', INK = '#141414', RED = '#D7372B', BLUE = '#1F4E9C', YELLOW = '#F2B705';
// Weather code -> circle color (8 stops at most): sun yellow, cloud and fog greys, rain blue, snow white, storm violet.
const SKY = [[0, YELLOW], [3, '#BDB6A6'], [45, '#8E887C'], [51, '#3B6DB3'], [71, '#FAFAF5'], [80, '#2F5E9E'], [85, '#FAFAF5'], [95, '#5E3A8C']];
const ON_SKY = [[0, INK], [51, '#FFFFFF'], [71, INK], [80, '#FFFFFF'], [85, INK], [95, '#FFFFFF']];

export default {
  blurb: 'Flat primary shapes in a Bauhaus poster. Instead of an icon, the big circle changes color with the weather: yellow sun, grey cloud, blue rain, white snow, violet storm.',
  samples: w => [['', w({ t: '18.4', f: '17.1', h: 72, c: 0, w: '15.8', d: 1 })], ['rain', w({ t: '12.9', f: '10.2', h: 91, c: 63, w: '24.3', d: 1 })]],
  build() {
    const assets = newAssets(), g = canvas(240, 240).fill(CREAM);
    g.color(BLUE); g.rect(134, 0, 239, 62);
    g.color(INK); g.rect(122, 12, 126, 140); g.rect(14, 146, 126, 149);
    g.color(RED); g.disc(0, 240, 78);
    g.color(INK); g.disc(102, 204, 10);
    g.color(YELLOW); g.rect(40, 214, 72, 226);
    const theme = meta('clock-bauhaus', 'Bauhaus');
    theme.display.background = CREAM;
    theme.data = [weatherSource(['t', 'h', 'c', 'w'])];
    theme.layers = [
      image('bg', 0, 0, addImage(assets, 'bg', g)),
      text('hours', 14, 12, '{HH}', 64, INK),
      text('minutes', 14, 78, '{MM}', 64, INK),
      text('seconds', 150, 16, '{SS}', 32, '#FFFFFF'),
      text('date', 140, 72, '{WD} {DD}', 16, INK),
      text('month', 140, 92, '{MON} {YYYY}', 16, INK),
      circle('sky', 182, 168, 48, { fill: '#BDB6A6', bind: { fill: stops('w.c', ...SKY) } }),
      text('temp', 182, 148, '{w.t}', 24, INK, { anchor: 'top-center', bind: { color: stops('w.c', ...ON_SKY) } }),
      circle('deg', 176, 182, 3, { stroke: INK, strokeWidth: 1, bind: { stroke: stops('w.c', ...ON_SKY) } }),
      text('unit', 182, 180, 'C', 16, INK, { bind: { color: stops('w.c', ...ON_SKY) } }),
      text('details', 232, 224, '{w.h}% {w.w}KM/H', 8, INK, { anchor: 'top-right' }),
    ];
    return { theme, assets };
  },
};
