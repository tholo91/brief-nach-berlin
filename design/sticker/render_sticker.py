"""Renders print-ready Brief-nach-Berlin stickers (100 x 56 mm + 2 mm bleed, 600 dpi).

Run from repo root:  python3 design/sticker/render_sticker.py
Needs Pillow + qrcode and the brand fonts from web/.next (run `npm run build` once if missing).
"""
import glob
import os
import random

import qrcode
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "design", "sticker")
MEDIA = os.path.join(ROOT, "web", ".next", "static", "media")

DPI = 600
PX = DPI / 25.4
TRIM_W, TRIM_H, BLEED = 100, 56, 2
W, H = round((TRIM_W + 2 * BLEED) * PX), round((TRIM_H + 2 * BLEED) * PX)

PAPER = (246, 241, 231)
STAMP = (255, 253, 248)
INK = (43, 43, 43)
PEN_BLUE = (29, 53, 87)
RED = (193, 18, 31)
BLUE = (29, 53, 87)
GREEN = (45, 106, 79)
GREEN_DARK = (27, 67, 50)

VARIANTS = [
    {
        "key": "1-aergert",
        "ref": "st1",
        "typed": "Ärgert dich was?",
        "hand": "Schreib's nach Berlin.",
        "sub": "In 2 Minuten zum Brief\nan deine Abgeordneten.\nKostenlos, ohne Account.",
    },
    {
        "key": "2-sitzt",
        "ref": "st2",
        "typed": "Sitzt du grad?",
        "hand": "Dann schreib nach Berlin.",
        "sub": "2 Minuten reichen für einen Brief\nan deine Abgeordneten.\nKostenlos, ohne Account.",
    },
    {
        "key": "3-meckern",
        "ref": "st3",
        "typed": "Meckern bringt nix.",
        "hand": "Briefe schon.",
        "sub": "Handgeschriebene Briefe\nwerden gelesen. Wir helfen\ndir in 2 Minuten beim Text.",
    },
]


def mm(v):
    return round(v * PX)


def tx(v):
    return mm(BLEED + v)


def font(prefix, size_mm, weight=None):
    path = glob.glob(os.path.join(MEDIA, prefix + "*.woff2"))[0]
    f = ImageFont.truetype(path, mm(size_mm))
    if weight:
        f.set_variation_by_axes([weight])
    return f


def fit(prefix, text, max_w_mm, max_size_mm, weight=None):
    size = max_size_mm
    while size > 1:
        f = font(prefix, size, weight)
        if f.getlength(text) <= mm(max_w_mm):
            return f
        size -= 0.1
    return f


def wrap(f, text, max_w):
    if "\n" in text:
        return text.split("\n")
    lines, cur = [], ""
    for word in text.split():
        trial = (cur + " " + word).strip()
        if f.getlength(trial) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    lines.append(cur)
    return lines


COURIER_BOLD = "5f440d3eea613716"
CAVEAT = "a85fe84266768609"
SOURCE_SANS = "47df9ba1c7236d3b"


def paper_texture(img):
    noise = Image.effect_noise((W // 4, H // 4), 18).resize((W, H), Image.BICUBIC)
    noise = noise.point(lambda v: 128 + (v - 128) * 0.12)
    tinted = Image.merge("RGB", [noise] * 3)
    return Image.blend(img, Image.composite(img, tinted, Image.new("L", (W, H), 245)), 0.5)


def airmail_border(img, band_mm=4.6):
    stripes = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(stripes)
    period, width = mm(15), mm(5)
    for k in range(-H // period - 2, (W + H) // period + 2):
        for offset, color in ((0, RED), (period // 2, BLUE)):
            u = k * period + offset
            d.polygon([(u, 0), (u + width, 0), (u + width - H, H), (u - H, H)], fill=color)
    mask = Image.new("L", (W, H), 255)
    md = ImageDraw.Draw(mask)
    md.rectangle([tx(band_mm), tx(band_mm), tx(TRIM_W - band_mm), mm(BLEED + TRIM_H - band_mm)], fill=0)
    img.paste(stripes, (0, 0), mask)


def make_qr(url, size_px):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0, box_size=20)
    qr.add_data(url)
    qr.make(fit=True)
    q = qr.make_image(fill_color=GREEN_DARK, back_color=STAMP).convert("RGB")
    q = q.resize((size_px, size_px), Image.NEAREST)

    logo = Image.open(os.path.join(ROOT, "web", "public", "images", "img-umschlag-icon.webp")).convert("RGBA")
    pad = round(size_px * 0.22)
    plate = Image.new("RGBA", (pad, pad), (0, 0, 0, 0))
    ImageDraw.Draw(plate).rounded_rectangle([0, 0, pad - 1, pad - 1], radius=pad // 5, fill=STAMP + (255,))
    inner = round(pad * 0.86)
    logo = logo.resize((inner, inner), Image.LANCZOS)
    plate.alpha_composite(logo, ((pad - inner) // 2, (pad - inner) // 2))
    q.paste(plate, ((size_px - pad) // 2, (size_px - pad) // 2), plate)
    return q, qr.version


def stamp(img, x_mm, y_mm, w_mm, h_mm, url):
    x0, y0, x1, y1 = tx(x_mm), tx(y_mm), tx(x_mm + w_mm), tx(y_mm + h_mm)

    shadow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(shadow).rectangle([x0 + mm(0.3), y0 + mm(0.4), x1 + mm(0.3), y1 + mm(0.4)], fill=60)
    shadow = shadow.filter(ImageFilter.GaussianBlur(mm(0.5)))
    img.paste(Image.new("RGB", (W, H), (120, 105, 85)), (0, 0), shadow)

    m = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(m)
    md.rectangle([x0, y0, x1, y1], fill=255)
    r, step = mm(0.75), mm(2.4)
    for edge_x in (x0, x1):
        n = round((y1 - y0) / step)
        for i in range(n + 1):
            cy = y0 + (y1 - y0) * i / n
            md.ellipse([edge_x - r, cy - r, edge_x + r, cy + r], fill=0)
    for edge_y in (y0, y1):
        n = round((x1 - x0) / step)
        for i in range(n + 1):
            cx = x0 + (x1 - x0) * i / n
            md.ellipse([cx - r, edge_y - r, cx + r, edge_y + r], fill=0)
    img.paste(Image.new("RGB", (W, H), STAMP), (0, 0), m)

    d = ImageDraw.Draw(img)

    qr_mm = 30
    q, version = make_qr(url, mm(qr_mm))
    qx = x0 + (x1 - x0 - q.width) // 2
    qy = y0 + mm(4.4)
    img.paste(q, (qx, qy))

    label = font(SOURCE_SANS, 2.5, 700)
    text = "Scannen & losschreiben"
    tw = label.getlength(text)
    d.text(((x0 + x1) / 2 - tw / 2, qy + q.height + mm(1.6)), text, font=label, fill=GREEN_DARK)
    return version


def render(v):
    img = Image.new("RGB", (W, H), PAPER)
    img = paper_texture(img)
    airmail_border(img)

    url = f"https://brief-nach-berlin.de?utm_source={v['ref']}"
    stamp_w, stamp_h = 38.5, 44
    stamp_x = TRIM_W - 4.6 - 3.2 - stamp_w
    stamp_y = (TRIM_H - stamp_h) / 2
    version = stamp(img, stamp_x, stamp_y, stamp_w, stamp_h, url)

    d = ImageDraw.Draw(img)
    left, text_w = 9.0, stamp_x - 9.0 - 4.0

    typed = fit(COURIER_BOLD, v["typed"], text_w, 5.4)
    hand = fit(CAVEAT, v["hand"], text_w, 9.0, 700)
    sub = font(SOURCE_SANS, 2.75, 560)
    url_f = fit(COURIER_BOLD, "brief-nach-berlin.de", text_w, 3.4)

    sub_lines = wrap(sub, v["sub"], mm(text_w))
    sub_lh = mm(3.55)

    blocks = [
        ("typed", typed.getbbox(v["typed"])[3]),
        ("gap", mm(1.2)),
        ("hand", hand.getbbox(v["hand"])[3]),
        ("gap", mm(2.6)),
        ("sub", sub_lh * len(sub_lines)),
        ("gap", mm(2.4)),
        ("url", url_f.getbbox("brief-nach-berlin.de")[3]),
    ]
    total = sum(h for _, h in blocks)
    y = tx(TRIM_H / 2) - total / 2 - mm(0.4)
    x = tx(left)
    for kind, h in blocks:
        if kind == "typed":
            d.text((x, y), v["typed"], font=typed, fill=INK)
        elif kind == "hand":
            d.text((x - mm(0.3), y), v["hand"], font=hand, fill=PEN_BLUE)
        elif kind == "sub":
            for i, line in enumerate(sub_lines):
                d.text((x, y + i * sub_lh), line, font=sub, fill=INK)
        elif kind == "url":
            d.line([x, y - mm(1.1), x + mm(9), y - mm(1.1)], fill=RED, width=mm(0.35))
            d.text((x, y), "brief-nach-berlin.de", font=url_f, fill=GREEN)
        y += h

    name = f"sticker-{v['key']}"
    img.save(os.path.join(OUT, name + "-druck.pdf"), resolution=DPI)
    img.save(os.path.join(OUT, name + "-druck.png"), dpi=(DPI, DPI))
    preview(img, name)
    return url, version


def preview(img, name):
    """Cut to trim with 3 mm rounded corners on a grey table, plus a proof with trim/safe lines."""
    trim = img.crop((mm(BLEED), mm(BLEED), mm(BLEED + TRIM_W), mm(BLEED + TRIM_H)))
    corner = Image.new("L", trim.size, 0)
    ImageDraw.Draw(corner).rounded_rectangle([0, 0, trim.width - 1, trim.height - 1], radius=mm(3), fill=255)
    pad = mm(10)
    bg = Image.new("RGB", (trim.width + 2 * pad, trim.height + 2 * pad), (228, 226, 222))
    sh = Image.new("L", bg.size, 0)
    ImageDraw.Draw(sh).rounded_rectangle(
        [pad + mm(0.4), pad + mm(1.0), pad + trim.width + mm(0.4), pad + trim.height + mm(1.0)], radius=mm(3), fill=90
    )
    sh = sh.filter(ImageFilter.GaussianBlur(mm(1.2)))
    bg.paste((150, 145, 138), (0, 0), sh)
    bg.paste(trim, (pad, pad), corner)
    bg.resize((bg.width // 2, bg.height // 2), Image.LANCZOS).save(os.path.join(OUT, name + "-vorschau.png"))

    proof = img.copy()
    d = ImageDraw.Draw(proof)
    d.rounded_rectangle([mm(BLEED), mm(BLEED), mm(BLEED + TRIM_W), mm(BLEED + TRIM_H)], radius=mm(3), outline=(255, 0, 255), width=mm(0.2))
    d.rectangle([mm(BLEED + 3), mm(BLEED + 3), mm(BLEED + TRIM_W - 3), mm(BLEED + TRIM_H - 3)], outline=(0, 170, 255), width=mm(0.15))
    proof.resize((proof.width // 2, proof.height // 2), Image.LANCZOS).save(os.path.join(OUT, name + "-schnittlinien.png"))


if __name__ == "__main__":
    random.seed(1)
    for v in VARIANTS:
        url, version = render(v)
        print(v["key"], url, "QR version", version)
