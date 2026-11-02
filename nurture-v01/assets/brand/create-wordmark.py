"""Outline the NURTURE wordmark from the locally licensed Cormorant source.

Run with Python + fontTools[woff] installed. The runtime SVG needs no font.
Custom spacing is intentional; keep all brand source and output in assets/.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

assets = Path(__file__).resolve().parent.parent
font = TTFont(assets / "fonts/cormorant-garamond-latin-400-normal.woff2")
glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
paths, cursor, bounds = [], 0, []
spacing = [54, 38, 42, 18, 45, 37, 0]
for letter, tracking in zip("NURTURE", spacing):
    glyph = glyphs[cmap[ord(letter)]]
    pen = SVGPathPen(glyphs)
    glyph.draw(pen)
    measure = BoundsPen(glyphs)
    glyph.draw(measure)
    x0, y0, x1, y1 = measure.bounds
    bounds.append((cursor + x0, y0, cursor + x1, y1))
    paths.append(f'<path transform="translate({cursor} 0)" d="{pen.getCommands()}"/>')
    cursor += glyph.width + tracking
x0, y0 = min(b[0] for b in bounds), min(b[1] for b in bounds)
x1, y1 = max(b[2] for b in bounds), max(b[3] for b in bounds)
width, height = x1 - x0 + 8, y1 - y0 + 8
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title">
<title id="title">NURTURE</title>
<g fill="#382a22" transform="translate({4-x0} {y1+4}) scale(1 -1)">{''.join(paths)}</g>
</svg>\n'''
(assets / "brand/nurture-wordmark.svg").write_text(svg, encoding="utf-8")
print(f"NURTURE outlined wordmark: {width} × {height}; seven paths.")
