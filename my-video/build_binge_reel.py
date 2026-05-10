#!/usr/bin/env python3
"""
BED awareness reel — procedural cinematic visuals + Arabic text.
No external API needed. All images generated with numpy + PIL.
"""

import os, sys, re, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import arabic_reshaper
from bidi.algorithm import get_display

# ── Config ────────────────────────────────────────────────────────────────────
FONT_PATH = "/home/user/JOEE/my-video/fonts/Cairo-Bold.ttf"
OUT_DIR   = "/home/user/JOEE/my-video/out/binge_reel"
FINAL_OUT = "/home/user/JOEE/my-video/out/binge_reel_final.mp4"
W, H      = 1080, 1920
FPS       = 30
FADE_DUR  = 0.6

for d in [OUT_DIR, f"{OUT_DIR}/images", f"{OUT_DIR}/clips"]:
    os.makedirs(d, exist_ok=True)

# ── Scenes ────────────────────────────────────────────────────────────────────
SCENES = [
    {
        "id": 1, "duration": 4,
        "text": "بتاكل… وبعدين بتكره نفسك…\nوبتعمله تاني",
        "text_y": 0.56, "font_size": 72,
        "palette": "crimson",   # deep red chaos
    },
    {
        "id": 2, "duration": 10,
        "text": "ده مش ضعف إرادة\nده اضطراب نفسي حقيقي\nاسمه Binge Eating Disorder",
        "text_y": 0.73, "font_size": 64,
        "palette": "violet",    # dark purple-teal brain
    },
    {
        "id": 3, "duration": 12,
        "text": "بتاكل كتير في وقت قصير\nمش لأنك جعان\nوبعدين… ذنب + خجل + تكرار",
        "text_y": 0.73, "font_size": 62,
        "palette": "amber",     # melting clock warm
    },
    {
        "id": 4, "duration": 12,
        "text": "بييجي من ضغط نفسي\nأو حمية قاسية جداً\nالدايت الأقسى = أسوأ",
        "text_y": 0.73, "font_size": 64,
        "palette": "steel",     # cold blue-gray scales
    },
    {
        "id": 5, "duration": 12,
        "text": "الحل مش قائمة أكل\nالأكل = العَرَض مش المشكلة\nالحل = متخصص نفسي",
        "text_y": 0.73, "font_size": 62,
        "palette": "gold",      # warm amber hope / reaching hands
    },
    {
        "id": 6, "duration": 10,
        "text": "مش لوحدك",
        "text_y": 0.55, "font_size": 100,
        "palette": "beam",      # single light beam in void
    },
    {
        "id": 7, "duration": 5,
        "text": "ابعت الفيديو ده لحد محتاجه",
        "text_y": 0.60, "font_size": 68,
        "palette": "minimal",   # minimal glow center
    },
]

# ── Procedural image generator ────────────────────────────────────────────────
rng = np.random.default_rng(42)

def noise(scale=1.0, octaves=4) -> np.ndarray:
    """Layered smooth random field → (H, W) float32 0..1."""
    out = np.zeros((H, W), dtype=np.float32)
    amp, freq = 1.0, 1.0
    total = 0.0
    for _ in range(octaves):
        sh = (max(2, int(H // (8 * freq))), max(2, int(W // (8 * freq))))
        layer = rng.random(sh).astype(np.float32)
        layer = np.array(Image.fromarray((layer * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)) / 255.0
        out  += layer * amp
        total += amp
        amp  *= 0.5
        freq *= 2.0
    return np.clip(out / total * scale, 0, 1)

def radial(cx=0.5, cy=0.5, r=0.6, power=1.8) -> np.ndarray:
    """Radial gradient: bright at centre, dark at edge → (H,W) float32."""
    ys = np.linspace(0, 1, H)[:, None]
    xs = np.linspace(0, 1, W)[None, :]
    d  = np.sqrt(((xs - cx) / (W / H * r))**2 + ((ys - cy) / r)**2)
    return np.clip(1 - d ** power, 0, 1).astype(np.float32)

def vignette(strength=0.75) -> np.ndarray:
    return 1 - radial(0.5, 0.5, 0.7, 1.4) * strength

def swirl(field: np.ndarray, amount=40) -> np.ndarray:
    """Warp a 2-D field with a swirl distortion."""
    cx, cy = W // 2, H // 2
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    dx, dy = xs - cx, ys - cy
    angle  = np.arctan2(dy, dx)
    radius = np.sqrt(dx**2 + dy**2)
    twist  = amount / (radius + 1)
    nx     = np.clip(cx + radius * np.cos(angle + twist), 0, W - 1).astype(np.int32)
    ny     = np.clip(cy + radius * np.sin(angle + twist), 0, H - 1).astype(np.int32)
    return field[ny, nx]

def compose_rgb(r_field, g_field, b_field) -> np.ndarray:
    rgb = np.stack([r_field, g_field, b_field], axis=-1)
    return (np.clip(rgb, 0, 1) * 255).astype(np.uint8)

def apply_vignette_to_rgb(rgb: np.ndarray, strength=0.72) -> np.ndarray:
    vig = vignette(strength)[..., None]
    return (rgb.astype(np.float32) * vig).clip(0, 255).astype(np.uint8)

def streaks(n=6, color=(1.0, 0.7, 0.2)) -> np.ndarray:
    """Light streaks / rays from a point near centre."""
    out = np.zeros((H, W), dtype=np.float32)
    cx, cy = W // 2, H // 2 - H // 8
    for _ in range(n):
        angle = rng.uniform(0, np.pi * 2)
        length = rng.uniform(0.3, 0.9) * max(W, H)
        width_px = rng.uniform(6, 30)
        ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
        # distance from ray line
        dx, dy = np.cos(angle), np.sin(angle)
        t   = (xs - cx) * dx + (ys - cy) * dy
        px  = cx + t * dx
        py  = cy + t * dy
        dist = np.sqrt((xs - px)**2 + (ys - py)**2)
        mask = (t > 0) & (t < length)
        ray  = np.exp(-dist**2 / (2 * width_px**2)) * mask
        out += ray * rng.uniform(0.4, 1.0)
    out = np.clip(out, 0, 1)
    rgb = np.stack([out * color[0], out * color[1], out * color[2]], axis=-1)
    return (rgb * 255).astype(np.uint8)

# ── Per-palette scene generators ─────────────────────────────────────────────

def gen_crimson() -> Image.Image:
    """Deep red chaos swirl — emotional, dark."""
    n1 = swirl(noise(1.0, 5), 60)
    n2 = noise(0.8, 3)
    r  = np.clip(n1 * 0.9 + 0.08, 0, 1)
    g  = np.clip(n2 * 0.12, 0, 1)
    b  = np.clip(n2 * 0.08, 0, 1)
    rgb = apply_vignette_to_rgb(compose_rgb(r, g, b), 0.80)
    img = Image.fromarray(rgb).filter(ImageFilter.GaussianBlur(3))
    # Red glow overlay
    glow = np.zeros((H, W, 3), np.float32)
    rd   = radial(0.5, 0.45, 0.45, 2.2)
    glow[..., 0] = rd * 0.55
    glow[..., 1] = rd * 0.04
    glow_img = Image.fromarray((glow * 255).clip(0, 255).astype(np.uint8))
    return Image.alpha_composite(img.convert("RGBA"), glow_img.convert("RGBA")).convert("RGB")

def gen_violet() -> Image.Image:
    """Dark purple-teal — psychological / brain."""
    n1 = noise(1.0, 6)
    n2 = swirl(noise(0.9, 4), 30)
    r  = np.clip(n1 * 0.35 + n2 * 0.15, 0, 1)
    g  = np.clip(n2 * 0.25 + n1 * 0.05, 0, 1)
    b  = np.clip(n1 * 0.60 + n2 * 0.20, 0, 1)
    rgb = apply_vignette_to_rgb(compose_rgb(r, g, b), 0.78)
    img = Image.fromarray(rgb).filter(ImageFilter.GaussianBlur(4))
    # Teal highlight
    glow = np.zeros((H, W, 3), np.float32)
    rd   = radial(0.5, 0.42, 0.38, 2.0)
    glow[..., 0] = rd * 0.05
    glow[..., 1] = rd * 0.45
    glow[..., 2] = rd * 0.50
    glow_img = Image.fromarray((glow * 255).clip(0, 255).astype(np.uint8))
    return Image.alpha_composite(img.convert("RGBA"), glow_img.convert("RGBA")).convert("RGB")

def gen_amber() -> Image.Image:
    """Warm amber / melting — time distortion."""
    n1 = swirl(noise(1.0, 5), 45)
    n2 = noise(0.7, 3)
    r  = np.clip(n1 * 0.85 + 0.10, 0, 1)
    g  = np.clip(n1 * 0.45 + n2 * 0.10, 0, 1)
    b  = np.clip(n2 * 0.08, 0, 1)
    rgb = apply_vignette_to_rgb(compose_rgb(r, g, b), 0.75)
    img = Image.fromarray(rgb).filter(ImageFilter.GaussianBlur(3))
    glow = np.zeros((H, W, 3), np.float32)
    rd   = radial(0.5, 0.40, 0.40, 2.0)
    glow[..., 0] = rd * 0.60
    glow[..., 1] = rd * 0.30
    glow[..., 2] = rd * 0.00
    glow_img = Image.fromarray((glow * 255).clip(0, 255).astype(np.uint8))
    return Image.alpha_composite(img.convert("RGBA"), glow_img.convert("RGBA")).convert("RGB")

def gen_steel() -> Image.Image:
    """Cold blue-gray — restriction / scales."""
    n1 = noise(1.0, 5)
    n2 = noise(0.6, 3)
    r  = np.clip(n1 * 0.22 + n2 * 0.08, 0, 1)
    g  = np.clip(n1 * 0.28 + n2 * 0.10, 0, 1)
    b  = np.clip(n1 * 0.50 + n2 * 0.20, 0, 1)
    rgb = apply_vignette_to_rgb(compose_rgb(r, g, b), 0.80)
    img = Image.fromarray(rgb).filter(ImageFilter.GaussianBlur(5))
    glow = np.zeros((H, W, 3), np.float32)
    rd   = radial(0.5, 0.44, 0.35, 1.8)
    glow[..., 0] = rd * 0.10
    glow[..., 1] = rd * 0.28
    glow[..., 2] = rd * 0.55
    glow_img = Image.fromarray((glow * 255).clip(0, 255).astype(np.uint8))
    return Image.alpha_composite(img.convert("RGBA"), glow_img.convert("RGBA")).convert("RGB")

def gen_gold() -> Image.Image:
    """Warm amber hope — reaching hands."""
    n1 = noise(0.8, 4)
    st = streaks(8, color=(1.0, 0.72, 0.18))
    r  = np.clip(n1 * 0.30, 0, 1)
    g  = np.clip(n1 * 0.18, 0, 1)
    b  = np.clip(n1 * 0.08, 0, 1)
    bg  = apply_vignette_to_rgb(compose_rgb(r, g, b), 0.85)
    img = Image.fromarray(bg)
    ray = Image.fromarray(st).filter(ImageFilter.GaussianBlur(8))
    img = Image.blend(img, ray, 0.55)
    glow = np.zeros((H, W, 3), np.float32)
    rd   = radial(0.5, 0.38, 0.32, 2.2)
    glow[..., 0] = rd * 0.80
    glow[..., 1] = rd * 0.52
    glow[..., 2] = rd * 0.10
    glow_img = Image.fromarray((glow * 255).clip(0, 255).astype(np.uint8))
    return Image.alpha_composite(img.convert("RGBA"), glow_img.convert("RGBA")).convert("RGB")

def gen_beam() -> Image.Image:
    """Single white/silver beam — lone light in void."""
    base = np.zeros((H, W, 3), np.float32)
    # Narrow vertical beam
    xs = np.linspace(0, 1, W)[None, :]
    cx = 0.5
    beam_w = 0.018
    beam = np.exp(-((xs - cx) ** 2) / (2 * beam_w**2))
    beam = beam * np.ones((H, 1), np.float32)
    # Fade beam intensity top-to-bottom
    ys = np.linspace(0, 1, H)[:, None]
    beam *= (1 - ys) ** 0.4
    base[..., 0] = beam * 0.90
    base[..., 1] = beam * 0.92
    base[..., 2] = beam * 1.00
    # Subtle noise background
    n1 = noise(0.15, 3)
    bg = np.stack([n1 * 0.06, n1 * 0.06, n1 * 0.10], axis=-1)
    combined = np.clip(base + bg, 0, 1)
    rgb = (combined * 255).astype(np.uint8)
    img = Image.fromarray(rgb).filter(ImageFilter.GaussianBlur(2))
    return apply_vignette_to_rgb(np.array(img), 0.70)

def gen_minimal() -> Image.Image:
    """Minimal dark with warm soft glow."""
    n1 = noise(0.25, 3)
    bg = np.stack([n1 * 0.07, n1 * 0.05, n1 * 0.04], axis=-1)
    glow = np.zeros((H, W, 3), np.float32)
    rd   = radial(0.5, 0.52, 0.30, 2.8)
    glow[..., 0] = rd * 0.45
    glow[..., 1] = rd * 0.28
    glow[..., 2] = rd * 0.10
    combined = np.clip(bg + glow, 0, 1)
    rgb = (combined * 255).astype(np.uint8)
    img = Image.fromarray(rgb).filter(ImageFilter.GaussianBlur(6))
    return apply_vignette_to_rgb(np.array(img), 0.60)

PALETTE_FN = {
    "crimson": gen_crimson,
    "violet":  gen_violet,
    "amber":   gen_amber,
    "steel":   gen_steel,
    "gold":    gen_gold,
    "beam":    gen_beam,
    "minimal": gen_minimal,
}

# ── Arabic text overlay ───────────────────────────────────────────────────────
_EMOJI_RE = re.compile(
    "[\U00010000-\U0010FFFF\U00002600-\U000027BF\U0001F300-\U0001F9FF]+",
    flags=re.UNICODE,
)

def prepare(line: str) -> str:
    clean = _EMOJI_RE.sub("", line).strip()
    return get_display(arabic_reshaper.reshape(clean))

def burn_text(img_arr: np.ndarray, raw_text: str, text_y_frac: float, font_size: int) -> Image.Image:
    img   = Image.fromarray(img_arr).convert("RGBA")
    over  = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw  = ImageDraw.Draw(over)
    font  = ImageFont.truetype(FONT_PATH, font_size)

    lines  = raw_text.split("\n")
    line_h = int(font_size * 1.22)
    gap    = int(font_size * 0.28)
    block_h = len(lines) * line_h + (len(lines) - 1) * gap
    top_y   = int(H * text_y_frac) - block_h // 2

    for i, raw in enumerate(lines):
        bidi = prepare(raw)
        if not bidi:
            continue
        y = top_y + i * (line_h + gap)
        bbox = draw.textbbox((0, 0), bidi, font=font)
        tw   = bbox[2] - bbox[0]
        x    = (W - tw) // 2

        # Multi-offset shadow for glow/depth
        for dx, dy, alpha in [(-3,-3,180),(3,-3,180),(-3,3,180),(3,3,180),(0,5,160),(0,-5,160),(0,0,220)]:
            col = (0, 0, 0, alpha) if (dx, dy) != (0, 0) else (0, 0, 0, 0)
            if (dx, dy) != (0, 0):
                draw.text((x+dx, y+dy), bidi, font=font, fill=col)
        draw.text((x, y), bidi, font=font, fill=(255, 255, 255, 255))

    return Image.alpha_composite(img, over).convert("RGB")

# ── Scene builder ─────────────────────────────────────────────────────────────
def build_scene(scene: dict) -> str:
    sid  = scene["id"]
    clip = f"{OUT_DIR}/clips/scene_{sid:02d}.mp4"
    if os.path.exists(clip):
        print(f"  [cached] scene {sid}")
        return clip

    print(f"  Generating visual…")
    raw_img = PALETTE_FN[scene["palette"]]()
    if isinstance(raw_img, np.ndarray):
        raw_img = Image.fromarray(raw_img)

    print(f"  Burning Arabic text…")
    final_img = burn_text(np.array(raw_img), scene["text"], scene["text_y"], scene["font_size"])

    frame_path = f"{OUT_DIR}/images/scene_{sid:02d}.png"
    final_img.save(frame_path)
    print(f"  Saved frame → {frame_path}")

    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", frame_path,
        "-t", str(scene["duration"]),
        "-r", str(FPS),
        "-vf", "scale=1080:1920,format=yuv420p",
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-an", clip,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"FFmpeg error: {r.stderr[-300:]}")
        sys.exit(1)
    print(f"  Clip → {clip}")
    return clip

# ── Crossfade assembly ────────────────────────────────────────────────────────
def assemble(clips: list) -> None:
    durations = [s["duration"] for s in SCENES]
    fade      = FADE_DUR
    inputs    = []
    for c in clips:
        inputs += ["-i", c]

    fc_parts   = []
    offset     = 0.0
    prev_label = "[0:v]"
    for i in range(1, len(clips)):
        offset    += durations[i - 1] - fade
        out_label  = "[v]" if i == len(clips) - 1 else f"[v{i}]"
        fc_parts.append(
            f"{prev_label}[{i}:v]xfade=transition=fade:"
            f"duration={fade}:offset={offset:.3f}{out_label}"
        )
        prev_label = out_label

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", ";".join(fc_parts),
        "-map", "[v]",
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-pix_fmt", "yuv420p", "-an",
        FINAL_OUT,
    ]
    print("\nAssembling with crossfades…")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"Assemble error:\n{r.stderr[-600:]}")
        sys.exit(1)

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"Building BED awareness reel — {len(SCENES)} scenes\n")
    clips = []
    for scene in SCENES:
        print(f"Scene {scene['id']}/{len(SCENES)}  ({scene['duration']}s)  [{scene['palette']}]")
        clips.append(build_scene(scene))

    assemble(clips)

    mb = os.path.getsize(FINAL_OUT) / 1024 / 1024
    print(f"\n✅  {FINAL_OUT}  ({mb:.1f} MB)")
    print(f"    1080×1920 | {FPS}fps | H.264 | No audio | ~{sum(s['duration'] for s in SCENES)}s")

if __name__ == "__main__":
    main()
