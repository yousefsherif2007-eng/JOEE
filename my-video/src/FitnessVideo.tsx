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

const CLIP_DURATION = 150; // 5s each at 30fps
const TRANSITION = 18;     // 0.6s cross-dissolve
const TEXT_DURATION = 55;

// ─── Cinematic letterbox bars ────────────────────────────────────────────────
const LetterBox: React.FC = () => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, backgroundColor: "#000", zIndex: 100 }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, backgroundColor: "#000", zIndex: 100 }} />
  </>
);

// ─── Radial vignette ─────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)",
      zIndex: 20,
      pointerEvents: "none",
    }}
  />
);

// ─── White flash on cut ───────────────────────────────────────────────────────
const FlashCut: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, 18], [0.9, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#fff", opacity, zIndex: 300, pointerEvents: "none" }} />
  );
};

// ─── Single cinematic clip with slow-zoom + grade ────────────────────────────
const CinematicClip: React.FC<{
  src: string;
  startFrom?: number;
  zoomTo?: number;
  brightness?: number;
  fadeIn?: boolean;
}> = ({ src, startFrom = 0, zoomTo = 1.08, brightness = 0.82, fadeIn = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const zoom = interpolate(frame, [0, durationInFrames], [1, zoomTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = fadeIn
    ? interpolate(frame, [0, TRANSITION], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <Video
        src={staticFile(src)}
        startFrom={startFrom}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoom})`,
          filter: `brightness(${brightness}) contrast(1.15) saturate(0.75)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Motivational text overlay ────────────────────────────────────────────────
const MotivationalText: React.FC<{ lines: string[]; accent?: string }> = ({
  lines,
  accent = "#fff",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [0, 12, TEXT_DURATION - 12, TEXT_DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        opacity: containerOpacity,
        gap: 12,
      }}
    >
      {lines.map((line, i) => {
        const scale = spring({
          frame: frame - i * 8,
          fps,
          config: { damping: 180, stiffness: 220 },
        });
        const isAccent = i === lines.length - 1 && lines.length > 1;
        return (
          <div
            key={i}
            style={{
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              fontWeight: 900,
              fontSize: isAccent ? 52 : 88,
              color: isAccent ? accent : "#fff",
              textTransform: "uppercase",
              letterSpacing: isAccent ? 14 : 5,
              textAlign: "center",
              transform: `scale(${scale})`,
              textShadow: "0 4px 30px rgba(0,0,0,0.8), 0 0 60px rgba(255,255,255,0.15)",
              lineHeight: 1.05,
              padding: "0 60px",
            }}
          >
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Outro CTA screen ─────────────────────────────────────────────────────────
const OutroScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line1 = spring({ frame: frame - 10, fps, config: { damping: 150, stiffness: 180 } });
  const line2 = spring({ frame: frame - 25, fps, config: { damping: 150, stiffness: 180 } });
  const line3 = spring({ frame: frame - 45, fps, config: { damping: 150, stiffness: 180 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        opacity: bgOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily: "'Arial Black', sans-serif",
          fontWeight: 900,
          fontSize: 96,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: 6,
          transform: `scale(${line1})`,
          textShadow: "0 0 80px rgba(255,255,255,0.2)",
        }}
      >
        START TODAY.
      </div>
      <div
        style={{
          fontFamily: "'Arial Black', sans-serif",
          fontWeight: 900,
          fontSize: 48,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: 16,
          transform: `scale(${line2})`,
        }}
      >
        NOT TOMORROW.
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: "sans-serif",
          fontWeight: 400,
          fontSize: 24,
          color: "#444",
          textTransform: "uppercase",
          letterSpacing: 8,
          transform: `scale(${line3})`,
        }}
      >
        The only bad workout is the one that didn't happen.
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const FitnessVideo: React.FC = () => {
  const clips = [
    { src: "IMG_2052.MOV",                              zoomTo: 1.10, brightness: 0.78 },
    { src: "00E22736-0A26-470D-84FB-EC72E7184283.mp4",  zoomTo: 1.08, brightness: 0.82 },
    { src: "IMG_1417.mov",                              zoomTo: 1.12, brightness: 0.80 },
    { src: "IMG_1435.mov",                              zoomTo: 1.06, brightness: 0.84 },
  ];

  const texts: { start: number; lines: string[]; accent?: string }[] = [
    { start: 20,                      lines: ["No Excuses."],                       accent: "#fff" },
    { start: CLIP_DURATION + 20,      lines: ["Discipline", "Over Motivation"],     accent: "#aaa" },
    { start: CLIP_DURATION * 2 + 20,  lines: ["Your Future Self", "Is Watching."], accent: "#aaa" },
    { start: CLIP_DURATION * 3 + 20,  lines: ["The Time", "Is Now."],              accent: "#aaa" },
  ];

  const OUTRO_START = CLIP_DURATION * 4;
  const OUTRO_DURATION = 100;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ── Video clips with cross-dissolve transitions ── */}
      {clips.map((clip, i) => (
        <Sequence key={i} from={i === 0 ? 0 : CLIP_DURATION * i - TRANSITION} durationInFrames={CLIP_DURATION + (i === clips.length - 1 ? 0 : TRANSITION)}>
          <CinematicClip
            src={clip.src}
            zoomTo={clip.zoomTo}
            brightness={clip.brightness}
            fadeIn={i > 0}
          />
        </Sequence>
      ))}

      {/* ── Vignette (always on) ── */}
      <Vignette />

      {/* ── Motivational text overlays ── */}
      {texts.map(({ start, lines, accent }, i) => (
        <Sequence key={i} from={start} durationInFrames={TEXT_DURATION}>
          <MotivationalText lines={lines} accent={accent} />
        </Sequence>
      ))}

      {/* ── Flash cuts on every transition ── */}
      {clips.slice(1).map((_, i) => (
        <Sequence key={i} from={CLIP_DURATION * (i + 1) - TRANSITION} durationInFrames={20}>
          <FlashCut />
        </Sequence>
      ))}

      {/* ── Outro CTA ── */}
      <Sequence from={OUTRO_START} durationInFrames={OUTRO_DURATION}>
        <OutroScreen />
      </Sequence>

      {/* ── Cinematic bars (always on top) ── */}
      <LetterBox />
    </AbsoluteFill>
  );
};
