#!/usr/bin/env python3
import subprocess, os, sys

DIR = "/home/user/JOEE/my-video/public"
OUT = "/home/user/JOEE/my-video/out"
SEG = f"{OUT}/segments"
os.makedirs(SEG, exist_ok=True)

# Cinematic grade: S-curve, desaturate -13%, warm push, vignette, light sharpen
GRADE = ",".join([
    "curves=r='0/0 0.08/0.12 0.5/0.53 0.92/0.88 1/1'"
    ":g='0/0 0.08/0.11 0.5/0.52 0.92/0.87 1/1'"
    ":b='0/0 0.08/0.10 0.5/0.50 0.92/0.86 1/1'",
    "hue=s=0.87",
    "vignette=PI/4",
    "unsharp=luma_msize_x=3:luma_msize_y=3:luma_amount=0.4",
    "fps=30",
])

def build_vf(orient, zoom=False, slowmo=False):
    parts = []
    # zoom-punch = scale 5% larger than target, then center-crop back to 1080x1920
    W, H = (1134, 2016) if zoom else (1080, 1920)

    if orient == "landscape":
        # Crop landscape (1024x576) to exact 9:16, then scale
        parts.append("crop=ih*9/16:ih:(iw-ih*9/16)/2:0")
        parts.append(f"scale={W}:{H}")
    else:
        # Portrait is already ~9:16, just scale up with slight crop
        parts.append(f"scale={W}:{H}:force_original_aspect_ratio=increase")
        parts.append(f"crop={W}:{H}")

    if zoom:
        parts.append("crop=1080:1920")

    if slowmo:
        parts.append("setpts=2.0*PTS")

    parts.append(GRADE)
    return ",".join(parts)

# (filename, start_sec, end_sec, orientation, zoom_punch, slowmo)
segments = [
    ("joe 1.mp4",  1.5,  4.5,  "landscape", False, False),  # 01 — HOOK
    ("joe 1.mp4",  5.0,  6.4,  "landscape", False, False),  # 02 — punch cut
    ("joe 2.mp4",  0.0,  3.5,  "portrait",  False, False),  # 03
    ("joe 2.mp4",  12.0, 15.0, "portrait",  False, False),  # 04
    ("joe 2.mp4",  28.0, 31.5, "portrait",  True,  False),  # 05 — zoom-punch
    ("joe 2.mp4",  40.0, 43.0, "portrait",  False, False),  # 06
    ("joe 3.mp4",  5.0,  9.0,  "landscape", False, False),  # 07 — slow compound
    ("joe 3.mp4",  22.0, 25.0, "landscape", False, False),  # 08
    ("joe 3.mp4",  50.0, 53.0, "landscape", True,  False),  # 09 — zoom-punch
    ("joe 3.mp4",  75.0, 78.0, "landscape", False, False),  # 10
    ("joee.mp4",   0.0,  1.6,  "landscape", False, False),  # 11 — flash cut
    ("joe 6.mp4",  0.0,  4.0,  "portrait",  False, False),  # 12
    ("joe 6.mp4",  12.0, 15.0, "portrait",  False, False),  # 13
    ("joe 6.mp4",  23.0, 25.0, "portrait",  False, True),   # 14 — SLOW-MO OUTRO
]

TOTAL = len(segments)
print(f"Building leg day reel — {TOTAL} segments\n")

for i, (fname, start, end, orient, zoom, slowmo) in enumerate(segments):
    src = f"{DIR}/{fname}"
    dst = f"{SEG}/seg_{i:02d}.mp4"
    dur = end - start
    vf  = build_vf(orient, zoom, slowmo)

    tag = " [HOOK]" if i == 0 else (" [ZOOM-PUNCH]" if zoom else (" [SLOW-MO]" if slowmo else ""))
    print(f"[{i+1:02d}/{TOTAL}] {fname}  {start}s → {end}s{tag}")

    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start), "-t", str(dur),
        "-i", src,
        "-vf", vf,
        "-an",
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-pix_fmt", "yuv420p",
        dst,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ERROR:\n{r.stderr[-600:]}")
        sys.exit(1)
    print(f"  ✓")

# Build concat list
concat_txt = f"{OUT}/concat.txt"
with open(concat_txt, "w") as f:
    for i in range(TOTAL):
        f.write(f"file '{SEG}/seg_{i:02d}.mp4'\n")

final = f"{OUT}/leg_day_reel_final.mp4"
print(f"\nConcatenating all segments → {final}")

r = subprocess.run([
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0",
    "-i", concat_txt,
    "-c", "copy",
    final,
], capture_output=True, text=True)

if r.returncode != 0:
    print(f"Concat ERROR:\n{r.stderr[-600:]}")
    sys.exit(1)

size_mb = os.path.getsize(final) / 1024 / 1024
print(f"\n✅  leg_day_reel_final.mp4  —  {size_mb:.1f} MB")
