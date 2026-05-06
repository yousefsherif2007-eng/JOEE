#!/usr/bin/env python3
"""
@shivo Caption Generator — CLI tool
Generates Instagram captions using Claude API.

Usage:
  python3 caption_generator.py
  ANTHROPIC_API_KEY=sk-ant-... python3 caption_generator.py

Requires:
  pip install anthropic
"""

import os, sys, json, textwrap
try:
    import anthropic
except ImportError:
    print("Run: pip install anthropic")
    sys.exit(1)

MODEL = "claude-haiku-4-5-20251001"

TYPES = {
    "1": "Workout Reel",
    "2": "Nutrition Post",
    "3": "Transformation/Progress",
    "4": "Motivation Reel",
    "5": "Educational Tips Carousel",
}

TONES = {
    "1": "raw and real",
    "2": "motivational and hype",
    "3": "educational and calm",
    "4": "funny and relatable",
}

CTAS = {
    "1": "follow and leave a comment",
    "2": "save this post",
    "3": "share with a friend who needs this",
    "4": "DM me for help",
}

HOOKS = [
    "I lost [X] kg doing this every morning (not what you think)",
    "6 months ago I couldn't do a single pull-up. Now watch:",
    "The exercise that changed my physique more than bench press",
    "You're doing [exercise] wrong. Here's how to fix it:",
    "What I eat in a day to stay lean year-round (with macros)",
    "Stop training harder. Start training smarter.",
    "Everyone quits at this point in the gym. Don't be them.",
    "Custom — enter your own",
]

SEP = "─" * 60

def pick(options: dict, prompt: str) -> str:
    print(f"\n{prompt}")
    for k, v in options.items():
        print(f"  {k}. {v}")
    while True:
        choice = input("→ ").strip()
        if choice in options:
            return options[choice]
        print("  Invalid. Try again.")

def generate_caption(api_key: str, post_type: str, hook: str, details: str, tone: str, cta: str) -> str:
    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""You are a professional Instagram fitness content writer for @shivo — a male fitness creator building his brand.

Write an Instagram caption for a {post_type} post.

HOOK (first line — must grab attention immediately): {hook}
Extra context / key points to include: {details or 'none'}
Tone: {tone}
CTA at the end: encourage people to {cta}

RULES:
- First line = the hook. No extra words before it.
- Short paragraphs — 1-3 lines max. Instagram readers scan, they don't read.
- Real and personal voice — not corporate, not generic AI. Sound like a real guy who trains.
- No motivational fluff like "Embrace the journey" or "You got this". Be specific.
- End with a clear, simple CTA: comment, save, share, or follow.
- Add 5 relevant hashtags AT THE END only. Mix of popular and niche.
- Total caption length: 100-200 words maximum.
- Do NOT use emojis in every line — use 2-4 max, strategically.

Output ONLY the caption. No explanation, no title, no quotes around it."""

    msg = client.messages.create(
        model=MODEL,
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text.strip()

def main():
    print("\n" + SEP)
    print("  @shivo — Instagram Caption Generator")
    print(SEP)

    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        api_key = input("\nAnthropik API key (sk-ant-...): ").strip()
    if not api_key:
        print("No API key. Exiting.")
        sys.exit(1)

    while True:
        post_type = pick(TYPES, "Post type:")
        tone = pick(TONES, "Tone:")
        cta = pick(CTAS, "Call to action:")

        print(f"\n{SEP}\nHook options:")
        for i, h in enumerate(HOOKS, 1):
            print(f"  {i}. {h}")
        hook_choice = input("→ ").strip()
        if hook_choice == str(len(HOOKS)):
            hook = input("Your hook: ").strip()
        elif hook_choice.isdigit() and 1 <= int(hook_choice) <= len(HOOKS):
            hook = HOOKS[int(hook_choice) - 1]
        else:
            hook = HOOKS[0]

        details = input("\nKey details to include (press Enter to skip):\n→ ").strip()

        print(f"\n{SEP}")
        print("Generating caption with Claude…")

        try:
            caption = generate_caption(api_key, post_type, hook, details, tone, cta)
        except Exception as e:
            print(f"\nError: {e}")
            continue

        print(f"\n{SEP}")
        print("CAPTION:")
        print(SEP)
        print()
        print(caption)
        print()
        print(SEP)

        again = input("Generate another? (y/n): ").strip().lower()
        if again != "y":
            break

    print("\nDone. Go post it. 🔥\n")

if __name__ == "__main__":
    main()
