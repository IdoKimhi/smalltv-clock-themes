"""Turns build-all.mjs output into per-theme GIFs, a contact sheet and a self-contained HTML gallery."""
import base64, json
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).parent
FRAMES = HERE / 'frames'
SIZE = 240 * 240 * 4
ORDER = ['flip', 'swiss', 'terminal', 'sky', 'mood', 'calendar', 'pocket', 'matrix', 'aquarium', 'bauhaus', 'window', 'orbit']

themes = []
for i, tid in enumerate(t for t in ORDER if (FRAMES / f'{t}.rgba').exists()):
    meta = json.loads((FRAMES / f'{tid}.json').read_text())
    raw = (FRAMES / f'{tid}.rgba').read_bytes()
    frames = [Image.frombytes('RGBA', (240, 240), raw[j:j + SIZE]).convert('RGB').resize((480, 480), Image.NEAREST) for j in range(0, len(raw), SIZE)]
    gif = HERE / tid / 'preview.gif'
    frames[0].save(gif, save_all=True, append_images=frames[1:], duration=250, loop=0, optimize=True)
    meta['n'] = i + 1
    themes.append(meta)
    print(f'{tid:9s} {gif.stat().st_size // 1024} KiB gif')

# Contact sheet: 4 x 3, numbered.
cols, cell, pad, cap = 4, 240, 12, 22
rows = (len(themes) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cell + (cols + 1) * pad, rows * (cell + cap) + (rows + 1) * pad), (24, 24, 27))
draw = ImageDraw.Draw(sheet)
for k, t in enumerate(themes):
    x, y = pad + (k % cols) * (cell + pad), pad + (k // cols) * (cell + cap + pad)
    sheet.paste(Image.open(HERE / t['id'] / 'preview.png').resize((cell, cell), Image.NEAREST), (x, y))
    draw.text((x, y + cell + 5), f"{t['n']}. {t['name']}", fill=(230, 230, 235))
sheet = sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST)
sheet.save(HERE / 'gallery.png')

# HTML gallery with every GIF and extra state embedded, so it opens anywhere.
def data_uri(path, kind):
    return f'data:image/{kind};base64,' + base64.b64encode(path.read_bytes()).decode()
cards = []
for t in themes:
    extras = ''.join(f'<figure><img src="{data_uri(HERE / t["id"] / f"preview-{e}.png", "png")}" alt=""><figcaption>{e}</figcaption></figure>' for e in t['extra'])
    cards.append(f'''<article>
  <img class="main" src="{data_uri(HERE / t["id"] / "preview.gif", "gif")}" alt="{t["name"]}">
  <div class="body"><h2><span>{t["n"]}</span>{t["name"]}</h2><p>{t["blurb"]}</p>
  <p class="meta">{t["layers"]} layers · {t["bytes"] // 1024} KiB</p>
  {f'<div class="extras">{extras}</div>' if extras else ''}</div>
</article>''')
html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Clock Theme Gallery</title><style>
:root {{ --bg:#f4f3ef; --card:#ffffff; --text:#1d1d1f; --muted:#6b6b70; --line:#e2e0da; --accent:#d9442e; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg:#121214; --card:#1c1c1f; --text:#ececef; --muted:#9a9aa2; --line:#2c2c31; --accent:#ff6b52; }} }}
* {{ box-sizing:border-box }} body {{ margin:0; background:var(--bg); color:var(--text); font:15px/1.5 system-ui, -apple-system, Segoe UI, sans-serif; }}
header {{ max-width:1120px; margin:0 auto; padding:32px 16px 8px }} h1 {{ margin:0 0 6px; font-size:26px }} header p {{ margin:0; color:var(--muted); max-width:70ch }}
main {{ max-width:1120px; margin:0 auto; padding:16px; display:grid; gap:16px; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)) }}
article {{ background:var(--card); border:1px solid var(--line); border-radius:14px; overflow:hidden; display:flex; flex-direction:column }}
img {{ image-rendering:pixelated; display:block; width:100% }} .main {{ aspect-ratio:1; background:#000 }}
.body {{ padding:12px 14px 14px }} h2 {{ margin:0 0 4px; font-size:17px; display:flex; gap:8px; align-items:center }}
h2 span {{ background:var(--accent); color:#fff; border-radius:999px; min-width:24px; height:24px; font-size:13px; display:inline-grid; place-items:center }}
p {{ margin:0 0 6px }} .meta {{ color:var(--muted); font-size:13px }} .extras {{ display:flex; gap:8px; margin-top:8px }}
figure {{ margin:0; width:96px }} figcaption {{ font-size:12px; color:var(--muted); text-align:center }}
</style></head><body>
<header><h1>Clock &amp; weather themes</h1><p>Rendered with the device-exact renderer: 6 seconds of each theme's real animation, with the clock ticking. Weather comes from Open-Meteo (free, no key). Smaller images show other states (night, rain, cold, hot).</p></header>
<main>{''.join(cards)}</main></body></html>'''
(HERE / 'gallery.html').write_text(html, encoding='utf-8')
print('gallery.html', (HERE / 'gallery.html').stat().st_size // 1024, 'KiB')
