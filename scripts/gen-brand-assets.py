"""
Exam Bridge — brand asset generator (Phase 1)

Produces the OFFICIAL circular logo with NO background box, tile, border, drop
shadow or triangle, from the pristine artwork in public/logo-pwa-source.png.

That source is a 1254x1254 render: the emblem medallion is centred at (611, 601)
and sits on top of an old rounded-square green tile with a black matte behind it.
Instead of trusting a fixed radius, this script walks a ray per angle and finds
where the outer gold ring actually ends, then masks on that boundary. The tile and
the black matte are removed, and so is the dark fringe the render leaves against
the tile — which is what reads as a "shadow" in the UI.

Outputs (written into public/):
  logo.png, logo-circle.png    512x512 transparent circular mark (used by <Logo/>)
  logo-1024.png                1024x1024 same mark, retina / OG image
  icons/icon-192.png           student PWA "any" icon
  icons/icon-512.png
  icons/icon-maskable-*.png    maskable: mark padded on a white plate
  icons/apple-touch-icon.png   180x180, mark on white
  icons/favicon.ico            16/32/48
  icons/admin-192.png          admin: circular mark + ADMIN pill
  icons/admin-512.png
  icons/admin-maskable-*.png

Run:  python scripts/gen-brand-assets.py
"""

import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
ICONS = os.path.join(PUBLIC, "icons")
SRC = os.path.join(PUBLIC, "logo-pwa-source.png")

# emblem centre in the source render
CX, CY = 611, 601
# the gold ring never reaches further than this; beyond it is tile + matte
MAX_RADIUS = 546
MIN_RADIUS = 470

WHITE = (255, 255, 255, 255)
GREEN = (22, 101, 52, 255)
GOLD = (212, 164, 55, 255)

_source_cache = {}


def source() -> Image.Image:
    if "im" not in _source_cache:
        _source_cache["im"] = Image.open(SRC).convert("RGBA")
    return _source_cache["im"]


def is_gold(c) -> bool:
    r, g, b = c[0], c[1], c[2]
    return r > 110 and 60 < g < 225 and b < 140 and r > b + 40


def ring_boundary(samples: int = 720):
    """Per-angle radius at which the outer gold ring stops."""
    px = source().load()
    w, h = source().size
    out = []
    for i in range(samples):
        ang = 2 * math.pi * i / samples
        ca, sa = math.cos(ang), math.sin(ang)
        edge = MAX_RADIUS

        def at(r):
            x = int(round(CX + r * ca))
            y = int(round(CY - r * sa))
            return px[x, y] if 0 <= x < w and 0 <= y < h else None

        r = MIN_RADIUS
        while r < MAX_RADIUS:
            if at(r) and is_gold(at(r)):
                # gold run: the ring ends once gold stops for 16px straight
                gap = 0
                rr = r
                while rr < r + 16 and rr < MAX_RADIUS:
                    p = at(rr)
                    gap = 0 if (p and is_gold(p)) else gap + 1
                    rr += 1
                if gap >= 16:
                    edge = r + 1  # keep the last gold pixel, drop the fringe
                    break
            r += 1
        out.append(edge)

    # light smoothing: the drawn ring is not a perfect circle
    k = 4
    return [
        sum(out[(j % samples)] for j in range(i - k, i + k + 1)) / (2 * k + 1)
        for i in range(samples)
    ]


def ring_mask(size: int, boundary, feather: float = 0.7) -> Image.Image:
    """Alpha mask of the emblem silhouette, feathered for a clean antialiased edge."""
    samples = len(boundary)
    reach = max(boundary)
    ss = size * 6
    scale = (ss / 2) / (reach * 1.005)
    mask = Image.new("L", (ss, ss), 0)
    d = ImageDraw.Draw(mask)
    pts = []
    for i in range(samples):
        ang = 2 * math.pi * i / samples
        pts.append(
            (
                ss / 2 + boundary[i] * math.cos(ang) * scale,
                ss / 2 - boundary[i] * math.sin(ang) * scale,
            )
        )
    d.polygon(pts, fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    if feather:
        mask = mask.filter(ImageFilter.GaussianBlur(feather))
    return mask


def emblem(size: int) -> Image.Image:
    """The raw circular mark, transparent outside the gold ring."""
    src = source()
    reach = 560
    box = (CX - reach, CY - reach, CX + reach, CY + reach)
    crop = src.crop(box).resize((size, size), Image.LANCZOS)
    crop.putalpha(ring_mask(size, ring_boundary()))
    return crop


def on_plate(mark: Image.Image, canvas: int, bg=WHITE) -> Image.Image:
    """Mark centred on a solid square canvas (maskable / apple icons)."""
    out = Image.new("RGBA", (canvas, canvas), bg)
    pad = (canvas - mark.width) // 2
    out.alpha_composite(mark, (pad, pad))
    return out


def font(px: int):
    for p in ("arialbd.ttf", "Arial-Bold.ttf", "DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(p, px)
        except OSError:
            continue
    return ImageFont.load_default()


def admin_mark(size: int) -> Image.Image:
    """Circular mark + 'ADMIN' pill, transparent background."""
    m = emblem(size)
    pill_h = max(6, int(size * 0.15))
    gap = int(size * 0.03)
    canvas = Image.new("RGBA", (size, size + gap + pill_h), (0, 0, 0, 0))
    canvas.alpha_composite(m, (0, 0))
    d = ImageDraw.Draw(canvas)
    y0 = size + gap
    txt = "ADMIN"
    f = font(int(pill_h * 0.7))
    tb = d.textbbox((0, 0), txt, font=f)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    pw = tw + int(pill_h * 1.4)
    x0 = (canvas.width - pw) // 2
    d.rounded_rectangle((x0, y0, x0 + pw, y0 + pill_h), radius=pill_h // 2, fill=GOLD)
    d.text(
        (x0 + (pw - tw) // 2 - tb[0], y0 + (pill_h - th) // 2 - tb[1]),
        txt,
        font=f,
        fill=GREEN,
    )
    return canvas


def admin_icon(canvas: int, bg=None) -> Image.Image:
    """Square admin icon: mark + pill optically centred."""
    m = admin_mark(int(canvas * 0.8))
    out = Image.new("RGBA", (canvas, canvas), bg or (0, 0, 0, 0))
    out.alpha_composite(m, ((canvas - m.width) // 2, int(canvas * 0.06)))
    return out


def write(img: Image.Image, path: str):
    img.save(path)
    print("wrote", os.path.relpath(path, ROOT).replace("\\", "/"), img.size)


def main():
    os.makedirs(ICONS, exist_ok=True)

    # ---- in-app logo: raw circular mark, transparent, no box / shadow ----
    for name in ("logo.png", "logo-circle.png"):
        write(emblem(512), os.path.join(PUBLIC, name))
    write(emblem(1024), os.path.join(PUBLIC, "logo-1024.png"))

    # ---- student PWA icons ----
    write(emblem(192), os.path.join(ICONS, "icon-192.png"))
    write(emblem(512), os.path.join(ICONS, "icon-512.png"))
    # maskable: keep ~80% safe zone so the OS can apply its own shape
    write(on_plate(emblem(140), 192), os.path.join(ICONS, "icon-maskable-192.png"))
    write(on_plate(emblem(376), 512), os.path.join(ICONS, "icon-maskable-512.png"))
    # apple icons need an opaque canvas; iOS does not honour transparency
    write(on_plate(emblem(150), 180), os.path.join(ICONS, "apple-touch-icon.png"))

    # ---- admin PWA icons ----
    write(admin_icon(192), os.path.join(ICONS, "admin-192.png"))
    write(admin_icon(512), os.path.join(ICONS, "admin-512.png"))
    write(admin_icon(192, WHITE), os.path.join(ICONS, "admin-maskable-192.png"))
    write(admin_icon(512, WHITE), os.path.join(ICONS, "admin-maskable-512.png"))

    # ---- favicon (16 / 32 / 48) ----
    ico = os.path.join(ICONS, "favicon.ico")
    if os.path.exists(ico):
        os.remove(ico)
    emblem(48).save(ico, sizes=[(16, 16), (32, 32), (48, 48)])
    print("wrote public/icons/favicon.ico")


if __name__ == "__main__":
    main()
