from PIL import Image, ImageDraw, ImageFont
import os

SIZES = [192, 512]
BG = (245, 245, 243)
FG = (26, 26, 26)

def make_icon(size, path, mask=False):
    img = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(img)
    stroke = max(2, size // 40)
    margin = size * 0.30
    x0, y0 = margin, margin
    x1 = margin + size * 0.10
    y1 = size - margin
    draw.rectangle([x0, y0, x1, y1], fill=FG)
    draw.rectangle([x0, y1 - size * 0.10, size - margin, y1], fill=FG)
    if mask:
        img = img.convert("RGBA")
    img.save(path)

out_dir = os.path.dirname(os.path.abspath(__file__))
for s in SIZES:
    make_icon(s, os.path.join(out_dir, f"icon-{s}.png"))
make_icon(180, os.path.join(out_dir, "apple-touch-icon.png"))
print("done")
