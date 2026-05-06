import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Video,
  staticFile,
} from "remotion";

// ─── 30-second vertical workout tips reel ────────────────────────────────────
// Format: 1080x1920 (9:16) | 30 fps | 900 frames = 30 seconds
// Sections: Hook (90f) → 5 Tips (120f each) → CTA (90f)
// Edit: customize TIPS array and CLIPS array with your footage

const ACCENT = "#f97316"; // orange — change to any brand color
const BG = "#050508";

const TIPS = [
  { number: "01", headline: "CONTROL THE NEGATIVE", sub: "3 seconds down on every rep. This is where muscle is built." },
  { number: "02", headline: "EAT BEFORE YOU TRAIN", sub: "Training fasted kills your performance. Eat 90 min before." },
  { number: "03", headline: "PROGRESSIVE OVERLOAD", sub: "Add weight or a rep every single week. Non-negotiable." },
  { number: "04", headline: "SLEEP = GAINS", sub: "7-9 hours. No supplement replaces sleep for muscle growth." },
  { number: "05", headline: "TRACK EVERYTHING", sub: "If you don't measure it, you can't improve it. Use a notebook." },
];

// Replace these filenames with your actual clips in my-video/public/
const CLIPS = [
  "joe 1.mp4",
  "joe 2.mp4",
  "joe 3.mp4",
  "joe 6.mp4",
  "joee.mp4",
];

// ─── Vignette ─────────────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
  }} />
);

// ─── Dark scrim for text legibility ──────────────────────────────────────────
const Scrim: React.FC<{ bottom?: boolean }> = ({ bottom = true }) => (
  <div style={{
    position: "absolute",
    inset: bottom ? "auto 0 0 0" : "0 0 auto 0",
    height: bottom ? 320 : 200,
    background: bottom
      ? "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)"
      : "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%)",
    zIndex: 15, pointerEvents: "none",
  }} />
);

// ─── Background video clip ────────────────────────────────────────────────────
const BgClip: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        src={staticFile(src)}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${zoom})`,
          filter: "brightness(0.55) contrast(1.15) saturate(0.8)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Hook screen (0-3s) ───────────────────────────────────────────────────────
const HookScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1Scale = spring({ frame, fps, config: { damping: 120, stiffness: 200 } });
  const line2Scale = spring({ frame: frame - 10, fps, config: { damping: 120, stiffness: 200 } });
  const line3Scale = spring({ frame: frame - 22, fps, config: { damping: 120, stiffness: 200 } });

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", zIndex: 50, gap: 8,
    }}>
      {[
        { text: "5 THINGS", scale: line1Scale, size: 72, color: "#fff" },
        { text: "KILLING", scale: line2Scale, size: 72, color: "#fff" },
        { text: "YOUR GAINS", scale: line3Scale, size: 72, color: ACCENT },
      ].map(({ text, scale, size, color }) => (
        <div key={text} style={{
          fontFamily: "'Arial Black', Impact, sans-serif",
          fontSize: size, fontWeight: 900, color,
          textTransform: "uppercase", letterSpacing: 3,
          transform: `scale(${scale})`,
          textShadow: "0 4px 30px rgba(0,0,0,0.9)",
          lineHeight: 1,
        }}>
          {text}
        </div>
      ))}
      <div style={{
        marginTop: 20, fontSize: 20, fontWeight: 600,
        color: "rgba(255,255,255,0.6)", letterSpacing: 8,
        textTransform: "uppercase",
        transform: `scale(${line3Scale})`,
      }}>
        by @shivo
      </div>
    </AbsoluteFill>
  );
};

// ─── Single tip card ──────────────────────────────────────────────────────────
const TipCard: React.FC<{ tip: typeof TIPS[0]; clipSrc: string }> = ({ tip, clipSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numScale = spring({ frame: frame - 5, fps, config: { damping: 140, stiffness: 220 } });
  const headScale = spring({ frame: frame - 15, fps, config: { damping: 140, stiffness: 220 } });
  const subOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <BgClip src={clipSrc} />
      <Vignette />
      <Scrim bottom={false} />
      <Scrim bottom />

      {/* Top: number */}
      <div style={{
        position: "absolute", top: 60, left: 40, zIndex: 30,
        fontFamily: "'Arial Black', sans-serif",
        fontSize: 22, fontWeight: 900, color: ACCENT,
        letterSpacing: 6, textTransform: "uppercase",
        transform: `scale(${numScale})`,
        transformOrigin: "left center",
      }}>
        TIP {tip.number}
      </div>

      {/* Bottom: headline + sub */}
      <div style={{
        position: "absolute", bottom: 80, left: 40, right: 40, zIndex: 30,
      }}>
        <div style={{
          fontFamily: "'Arial Black', Impact, sans-serif",
          fontSize: 52, fontWeight: 900, color: "#fff",
          textTransform: "uppercase", letterSpacing: 1,
          lineHeight: 1.05, marginBottom: 14,
          transform: `scale(${headScale})`,
          transformOrigin: "left bottom",
          textShadow: "0 4px 30px rgba(0,0,0,0.9)",
        }}>
          {tip.headline}
        </div>
        <div style={{
          fontSize: 18, color: "rgba(255,255,255,0.78)",
          fontWeight: 500, lineHeight: 1.5,
          opacity: subOpacity,
          textShadow: "0 2px 12px rgba(0,0,0,0.8)",
        }}>
          {tip.sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── CTA outro screen (last 3s) ───────────────────────────────────────────────
const CTAScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line1 = spring({ frame: frame - 10, fps, config: { damping: 130, stiffness: 180 } });
  const line2 = spring({ frame: frame - 24, fps, config: { damping: 130, stiffness: 180 } });
  const line3 = spring({ frame: frame - 38, fps, config: { damping: 130, stiffness: 180 } });

  return (
    <AbsoluteFill style={{
      background: BG, opacity: bgOpacity,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      <div style={{
        fontFamily: "'Arial Black', sans-serif",
        fontSize: 80, fontWeight: 900, color: "#fff",
        textTransform: "uppercase", letterSpacing: 4,
        transform: `scale(${line1})`,
        textShadow: `0 0 60px ${ACCENT}40`,
      }}>
        FOLLOW
      </div>
      <div style={{
        fontFamily: "'Arial Black', sans-serif",
        fontSize: 52, fontWeight: 900, color: ACCENT,
        letterSpacing: 8,
        transform: `scale(${line2})`,
      }}>
        @shivo
      </div>
      <div style={{
        fontFamily: "sans-serif", fontSize: 18,
        color: "rgba(255,255,255,0.45)", letterSpacing: 4,
        textTransform: "uppercase",
        transform: `scale(${line3})`,
      }}>
        For more tips every week
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
// Total: 900 frames = 30 seconds at 30fps
// Hook: 0-90 (3s) | Tips: 90-690 (each 120f = 4s) | CTA: 690-900 (7s)
export const ShivoReel: React.FC = () => {
  const HOOK_START = 0;
  const HOOK_DUR = 90;
  const TIP_DUR = 120;
  const TIPS_START = HOOK_DUR;
  const CTA_START = HOOK_DUR + TIPS.length * TIP_DUR; // 690

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Hook */}
      <Sequence from={HOOK_START} durationInFrames={HOOK_DUR}>
        <AbsoluteFill>
          <BgClip src={CLIPS[0]} />
          <Vignette />
          <Scrim />
          <HookScreen />
        </AbsoluteFill>
      </Sequence>

      {/* Tips */}
      {TIPS.map((tip, i) => (
        <Sequence key={i} from={TIPS_START + i * TIP_DUR} durationInFrames={TIP_DUR}>
          <TipCard tip={tip} clipSrc={CLIPS[i % CLIPS.length]} />
        </Sequence>
      ))}

      {/* CTA */}
      <Sequence from={CTA_START} durationInFrames={210}>
        <CTAScreen />
      </Sequence>
    </AbsoluteFill>
  );
};
