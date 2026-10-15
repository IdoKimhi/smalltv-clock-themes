// Thermo Mood: the whole screen takes the color of the outdoor temperature.
import { canvas, newAssets, addImage, weatherIcons, weatherSource, meta, text, image, rect, degree, stops } from '../lib.mjs';

// Deep blue when freezing, through teal and green, to amber, orange and crimson in the heat.
const MOOD = [[-60, '#1E3A8A'], [0, '#2459D6'], [8, '#0F8F9F'], [14, '#1F9D5C'], [20, '#C99A12'], [26, '#E0680F'], [32, '#C2255C']];

export default {
  blurb: 'The whole background takes the color of the outdoor temperature, from icy blue to crimson, behind one huge reading.',
  samples: w => [['', w({ t: '18.4', f: '17.1', h: 72, c: 2, w: '15.8', d: 1 })], ['cold', w({ t: '-3.5', f: '-8.2', h: 88, c: 73, w: '22.0', d: 1 })], ['hot', w({ t: '34.1', f: '36.9', h: 21, c: 0, w: '9.4', d: 1 })]],
  build() {
    const assets = newAssets(), shade = canvas(240, 240);
    // Translucent shading over the color: darker at the top and bottom, a soft halo behind the number.
    for (let y = 0; y < 240; y++) for (let x = 0; x < 240; x++) {
      const top = Math.max(0, 1 - y / 70), bottom = Math.max(0, (y - 150) / 90), halo = Math.max(0, 1 - Math.hypot(x - 120, y - 112) / 95);
      const dark = 110 * top + 130 * bottom, light = 38 * halo;
      if (dark > light) { shade.color('#000000', Math.round(dark - light)); shade.set(x, y); }
      else if (light > 0) { shade.color('#FFFFFF', Math.round(light - dark)); shade.set(x, y); }
    }
    shade.color('#FFFFFF', 60); shade.rect(24, 188, 216, 188);
    for (const [label, x] of [['FEELS LIKE', 44], ['HUMIDITY', 120], ['WIND KM/H', 196]]) shade.text(label, x, 196, 8, '#FFFFFF', 'top-center', 170);

    const theme = meta('clock-mood', 'Thermo Mood');
    theme.data = [weatherSource()];
    theme.layers = [
      rect('mood', 0, 0, 240, 240, '#3A3F47', { bind: { fill: stops('w.t', ...MOOD) } }),
      image('shade', 0, 0, addImage(assets, 'shade', shade)),
      text('time', 14, 12, '{HH}:{MM}', 32, '#FFFFFF'),
      text('seconds', 138, 26, '{SS}', 16, '#FFFFFF'),
      text('date', 14, 48, '{WD} {DD} {MON}', 16, '#FFFFFF'),
      ...weatherIcons(assets, { x: 180, y: 12 }),
      text('temp', 204, 106, '{w.t}', 64, '#FFFFFF', { anchor: 'top-right' }),
      degree('temp-deg', 204, 106, 64, '#FFFFFF'),
      text('feels', 44, 210, '{w.f}', 16, '#FFFFFF', { anchor: 'top-center' }),
      text('humidity', 120, 210, '{w.h}%', 16, '#FFFFFF', { anchor: 'top-center' }),
      text('wind', 196, 210, '{w.w}', 16, '#FFFFFF', { anchor: 'top-center' }),
    ];
    return { theme, assets };
  },
};
