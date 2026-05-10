#!/usr/bin/env python3
"""
Binge Eating Disorder awareness reel — Arabic AI video generator.
Generates scene images via Replicate (FLUX), burns Arabic text with PIL,
assembles with crossfade transitions via FFmpeg.

Usage:
  REPLICATE_API_TOKEN=r8_xxx python3 build_binge_reel.py
"""

import os, sys, re, time, textwrap, subprocess, requests
import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ── Config ────────────────────────────────────────────────────────────────────
FONT_PATH  = "/home/user/JOEE/my-video/fonts/Cairo-Bold.ttf"
OUT_DIR    = "/home/user/JOEE/my-video/out/binge_reel"
FINAL_OUT  = "/home/user/JOEE/my-video/out/binge_reel_final.mp4"
W, H       = 1080, 1920
FPS        = 30
FADE_DUR   = 0.5          # seconds crossfade between scenes

for d in [OUT_DIR, f"{OUT_DIR}/images", f"{OUT_DIR}/clips"]:
    os.makedirs(d, exist_ok=True)

# ── Scenes ────────────────────────────────────────────────────────────────────
SCENES = [
    {
        "id": 1, "duration": 4,
        "prompt": (
            "abstract dark swirl of food floating in void, emotional chaos, "
            "deep red and black tones, cinematic, vertical portrait 9:16, "
            "4k ultra detailed, surreal digital art, no text"
        ),
        "text": "بتاكل… وبعدين بتكره نفسك…\nوبتعمله تاني",
        "text_y": 0.55,   # vertical centre of text block (fraction of height)
        "font_size": 72,
    },
    {
        "id": 2, "duration": 10,
        "prompt": (
            "brain made of tangled vines and food, abstract psychological concept, "
            "moody atmospheric dark lighting, cinematic, vertical portrait 9:16, "
            "digital art, no text"
        ),
        "text": "ده مش ضعف إرادة\nده اضطراب نفسي حقيقي\nاسمه Binge Eating Disorder",
        "text_y": 0.72,
        "font_size": 66,
    },
    {
        "id": 3, "duration": 12,
        "prompt": (
            "fast spinning clock melting into food fragments, abstract surreal, "
            "dark warm palette, cinematic, vertical portrait 9:16, "
            "high detail digital art, no text"
        ),
        "text": "بتاكل كتير في وقت قصير\nمش لأنك جعان\nوبعدين… ذنب + خجل + تكرار",
        "text_y": 0.72,
        "font_size": 64,
    },
    {
        "id": 4, "duration": 12,
        "prompt": (
            "two abstract hands holding scales, one side strict diet rules, "
            "other side chaotic food swirl, dark moody, cinematic, "
            "vertical portrait 9:16, digital art, no text"
        ),
        "text": "بييجي من ضغط نفسي\nأو حمية قاسية جداً\nالدايت الأقسى = أسوأ",
        "text_y": 0.73,
        "font_size": 66,
    },
    {
        "id": 5, "duration": 12,
        "prompt": (
            "one glowing hand reaching to another hand in darkness, warm amber light, "
            "hope and connection, abstract cinematic, vertical portrait 9:16, "
            "emotional digital art, no text"
        ),
        "text": "الحل مش قائمة أكل\nالأكل = العَرَض مش المشكلة\nالحل = متخصص نفسي",
        "text_y": 0.72,
        "font_size": 64,
    },
    {
        "id": 6, "duration": 10,
        "prompt": (
            "single light beam in deep dark abstract space, minimal composition, "
            "emotional, cinematic, vertical portrait 9:16, "
            "high quality digital art, no text"
        ),
        "text": "مش لوحدك",
        "text_y": 0.55,
        "font_size": 96,
    },
    {
        "id": 7, "duration": 5,
        "prompt": (
            "minimal dark background with soft warm glow in center, "
            "abstract, cinematic, vertical portrait 9:16, no text"
        ),
        "text": "ابعت الفيديو ده لحد محتاجه",
        "text_y": 0.60,
        "font_size": 68,
    },
]

# ── Arabic text helpers ───────────────────────────────────────────────────────
_EMOJI_RE = re.compile(
    "[\U00010000-\U0010FFFF"
    "\U00002600-\U000027BF"
    "\U0001F300-\U0001F9FF"
    "]+",
    flags=re.UNICODE,
)

def prepare_arabic(text: str) -> str:
    """Reshape + bidi a single line for correct RTL rendering."""
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)

def clean_line(line: str) -> str:
    """Remove emoji and strip extra whitespace for font rendering."""
    return _EMOJI_RE.sub("", line).strip()

def draw_arabic_text(img: Image.Image, raw_text: str, text_y_frac: float, font_size: int) -> Image.Image:
    """
    Burn multi-line Arabic text onto `img` centered horizontally,
    vertically anchored at text_y_frac (0=top, 1=bottom).
    Returns the modified image.
    """
    draw  = ImageDraw.Draw(img)
    font  = ImageFont.truetype(FONT_PATH, font_size)
    small = ImageFont.truetype(FONT_PATH, max(28, font_size - 20))

    lines      = raw_text.split("\n")
    line_gap   = int(font_size * 0.35)
    line_h     = int(font_size * 1.18)
    block_h    = len(lines) * line_h + (len(lines) - 1) * line_gap
    start_y    = int(H * text_y_frac) - block_h // 2

    for i, raw_line in enumerate(lines):
        clean = clean_line(raw_line)
        if not clean:
            continue
        bidi_line = prepare_arabic(clean)
        y = start_y + i * (line_h + line_gap)

        # Measure
        bbox = draw.textbbox((0, 0), bidi_line, font=font)
        tw   = bbox[2] - bbox[0]
        x    = (W - tw) // 2

        # Shadow / glow (draw offset copies in dark colour)
        for dx, dy in [(-3,-3),(3,-3),(-3,3),(3,3),(0,4),(0,-4)]:
            draw.text((x + dx, y + dy), bidi_line, font=font,
                      fill=(0, 0, 0, 210))

        # Main text — white
        draw.text((x, y), bidi_line, font=font, fill=(255, 255, 255, 255))

    return img

# ── Image generation via Replicate ───────────────────────────────────────────
def generate_image(prompt: str, scene_id: int) -> str:
    """Call Replicate FLUX-schnell, download result, return local path."""
    import replicate  # imported here so missing token gives a clear error

    dest = f"{OUT_DIR}/images/scene_{scene_id:02d}.png"
    if os.path.exists(dest):
        print(f"  [cache] {dest}")
        return dest

    print(f"  Generating image for scene {scene_id}…")
    output = replicate.run(
        "black-forest-labs/flux-schnell",
        input={
            "prompt": prompt,
            "width": 1080,
            "height": 1920,
            "num_outputs": 1,
            "num_inference_steps": 4,
            "output_format": "png",
        },
    )

    # output is a list of FileOutput objects
    url = str(output[0]) if hasattr(output[0], "__str__") else output[0].url
    r   = requests.get(url, timeout=120)
    r.raise_for_status()
    with open(dest, "wb") as f:
        f.write(r.content)
    print(f"  Saved → {dest}")
    return dest

# ── Build each scene clip ─────────────────────────────────────────────────────
def build_scene_clip(scene: dict) -> str:
    sid  = scene["id"]
    dur  = scene["duration"]
    clip = f"{OUT_DIR}/clips/scene_{sid:02d}.mp4"
    if os.path.exists(clip):
        print(f"  [cache] {clip}")
        return clip

    # 1. Get AI image
    img_path = generate_image(scene["prompt"], sid)

    # 2. Open, resize to exact 1080x1920
    img = Image.open(img_path).convert("RGBA")
    img = img.resize((W, H), Image.LANCZOS)

    # 3. Burn Arabic text
    img = draw_arabic_text(img, scene["text"], scene["text_y"], scene["font_size"])

    # 4. Save composited frame
    frame_path = f"{OUT_DIR}/images/scene_{sid:02d}_final.png"
    img.convert("RGB").save(frame_path, "PNG")

    # 5. FFmpeg: loop still image → video clip
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", frame_path,
        "-t", str(dur),
        "-r", str(FPS),
        "-vf", "scale=1080:1920,format=yuv420p",
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-an",
        clip,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"FFmpeg error:\n{r.stderr[-400:]}")
        sys.exit(1)
    print(f"  Clip ready → {clip}")
    return clip

# ── Crossfade assembly ────────────────────────────────────────────────────────
def assemble_with_crossfades(clips: list[str]) -> None:
    """
    Chain all clips with xfade crossfade transitions,
    output → FINAL_OUT.
    """
    if len(clips) == 1:
        subprocess.run(["cp", clips[0], FINAL_OUT])
        return

    # Build a nested xfade filter
    # Each xfade offsets by cumulative duration minus the fade overlap
    durations  = [SCENES[i]["duration"] for i in range(len(clips))]
    fade       = FADE_DUR

    # Input args
    inputs = []
    for c in clips:
        inputs += ["-i", c]

    # Filter complex: chain xfade
    fc_parts = []
    offset   = 0.0
    prev_label = "[0:v]"

    for i in range(1, len(clips)):
        offset += durations[i - 1] - fade
        out_label = "[v]" if i == len(clips) - 1 else f"[v{i}]"
        fc_parts.append(
            f"{prev_label}[{i}:v]xfade=transition=fade:duration={fade}:offset={offset:.3f}{out_label}"
        )
        prev_label = out_label if i < len(clips) - 1 else out_label

    fc = ";".join(fc_parts)

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", fc,
        "-map", "[v]",
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-pix_fmt", "yuv420p",
        "-an",
        FINAL_OUT,
    ]
    print("\nAssembling final video…")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"Assemble error:\n{r.stderr[-600:]}")
        sys.exit(1)

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    token = os.environ.get("REPLICATE_API_TOKEN", "")
    if not token:
        print("ERROR: Set REPLICATE_API_TOKEN environment variable first.")
        print("  export REPLICATE_API_TOKEN=r8_xxxx")
        sys.exit(1)

    print(f"Building {len(SCENES)}-scene BED awareness reel…\n")
    clips = []
    for scene in SCENES:
        print(f"Scene {scene['id']}/{len(SCENES)}  ({scene['duration']}s)")
        clip = build_scene_clip(scene)
        clips.append(clip)

    assemble_with_crossfades(clips)

    size_mb = os.path.getsize(FINAL_OUT) / 1024 / 1024
    print(f"\n✅  {FINAL_OUT}  ({size_mb:.1f} MB)")
    print(f"    Resolution: 1080x1920 | {FPS}fps | H.264 | No audio")

if __name__ == "__main__":
    main()
