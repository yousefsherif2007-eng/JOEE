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

// ── Videos ───────────────────────────────────────────────────────────────────
const V = {
  gindy:    "processed/gindy.mp4",
  abdullah: "processed/abdullah.mp4",
  malky:    "processed/malky.mp4",
  yehia:    "processed/yehia.mp4",
};

// ── Durations (full clip, nothing cut) ───────────────────────────────────────
const INTRO_DUR    = 60;    // 2s  – title card
const GINDY_DUR    = 2368;  // 78.9s full clip
const ABDULLAH_DUR = 1029;  // 34.3s full clip
const MALKY_DUR    = 381;   // 12.7s full clip
const YEHIA_DUR    = 566;   // 18.9s full clip
const OUTRO_DUR    = 60;    // 2s  – end card
// Total: 4464 frames ≈ 148.8s

// ── Timeline starts ───────────────────────────────────────────────────────────
const G_START   = INTRO_DUR;
const A_START   = G_START   + GINDY_DUR;
const M_START   = A_START   + ABDULLAH_DUR;
const Y_START   = M_START   + MALKY_DUR;
const OUT_START = Y_START   + YEHIA_DUR;

const FONT = "Arial, sans-serif";

// ── Shared: subtle vignette ───────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <div style={{
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)",
    zIndex: 5, pointerEvents: "none",
  }} />
);

// ── Shared: clean video clip (minimal grade) ──────────────────────────────────
const CleanClip: React.FC<{ src: string; fadeIn?: boolean }> = ({ src, fadeIn = false }) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn
    ? interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <Video
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(1.02) contrast(1.05) saturate(1.05)",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Shared: lower third name tag ──────────────────────────────────────────────
const NameTag: React.FC<{ name: string; role?: string }> = ({ name, role }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slide = spring({ frame: frame - 10, fps, config: { damping: 140, stiffness: 160 } });
  const x = interpolate(slide, [0, 1], [-320, 0]);

  const fadeOut = interpolate(frame, [180, 210], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      bottom: 140,
      left: 36,
      transform: `translateX(${x}px)`,
      opacity: fadeOut,
      zIndex: 50,
    }}>
      <div style={{
        backgroundColor: "rgba(0,0,0,0.72)",
        borderRadius: 6,
        padding: "10px 20px",
        borderLeft: "4px solid #ffffff",
      }}>
        <div style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 28,
          color: "#ffffff",
          letterSpacing: 0.5,
        }}>{name}</div>
        {role && (
          <div style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 16,
            color: "#cccccc",
            marginTop: 2,
            letterSpacing: 1,
          }}>{role}</div>
        )}
      </div>
    </div>
  );
};

// ── Intro title card ──────────────────────────────────────────────────────────
const IntroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bg = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const title = spring({ frame: frame - 8, fps, config: { damping: 130, stiffness: 140 } });
  const sub   = spring({ frame: frame - 22, fps, config: { damping: 130, stiffness: 140 } });

  return (
    <AbsoluteFill style={{
      backgroundColor: "#0a0a0a",
      opacity: bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    }}>
      <div style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 68,
        color: "#ffffff",
        textAlign: "center",
        letterSpacing: 2,
        transform: `scale(${title})`,
        padding: "0 60px",
        lineHeight: 1.2,
      }}>
        Clickbait &amp; Media Literacy
      </div>
      <div style={{
        fontFamily: FONT,
        fontWeight: 400,
        fontSize: 26,
        color: "#888888",
        textAlign: "center",
        letterSpacing: 3,
        textTransform: "uppercase",
        transform: `scale(${sub})`,
      }}>
        A Group Discussion
      </div>
    </AbsoluteFill>
  );
};

// ── Outro card ────────────────────────────────────────────────────────────────
const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bg = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l1 = spring({ frame: frame - 8,  fps, config: { damping: 130, stiffness: 140 } });
  const l2 = spring({ frame: frame - 22, fps, config: { damping: 130, stiffness: 140 } });

  return (
    <AbsoluteFill style={{
      backgroundColor: "#0a0a0a",
      opacity: bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    }}>
      <div style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 64,
        color: "#ffffff",
        textAlign: "center",
        letterSpacing: 2,
        transform: `scale(${l1})`,
      }}>
        Thank You.
      </div>
      <div style={{
        fontFamily: FONT,
        fontWeight: 400,
        fontSize: 22,
        color: "#666666",
        letterSpacing: 4,
        textTransform: "uppercase",
        transform: `scale(${l2})`,
      }}>
        Think before you click.
      </div>
    </AbsoluteFill>
  );
};

// ── Speaker segments ──────────────────────────────────────────────────────────
const GindySegment: React.FC = () => (
  <AbsoluteFill>
    <CleanClip src={V.gindy} fadeIn />
    <Vignette />
    <Sequence from={10} durationInFrames={210}>
      <NameTag name="Gindy" role="Media Literacy Discussion" />
    </Sequence>
  </AbsoluteFill>
);

const AbdullahSegment: React.FC = () => (
  <AbsoluteFill>
    <CleanClip src={V.abdullah} fadeIn />
    <Vignette />
    <Sequence from={10} durationInFrames={210}>
      <NameTag name="Abdullah" role="Media Literacy Discussion" />
    </Sequence>
  </AbsoluteFill>
);

const MalkySegment: React.FC = () => (
  <AbsoluteFill>
    <CleanClip src={V.malky} fadeIn />
    <Vignette />
    <Sequence from={10} durationInFrames={210}>
      <NameTag name="Malky" role="Media Literacy Discussion" />
    </Sequence>
  </AbsoluteFill>
);

const YehiaSegment: React.FC = () => (
  <AbsoluteFill>
    <CleanClip src={V.yehia} fadeIn />
    <Vignette />
    <Sequence from={10} durationInFrames={210}>
      <NameTag name="Yehia" role="Media Literacy Discussion" />
    </Sequence>
  </AbsoluteFill>
);

// ── Root ──────────────────────────────────────────────────────────────────────
export const ClickbaitVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
    <Sequence from={0}         durationInFrames={INTRO_DUR}>    <IntroCard />       </Sequence>
    <Sequence from={G_START}   durationInFrames={GINDY_DUR}>    <GindySegment />    </Sequence>
    <Sequence from={A_START}   durationInFrames={ABDULLAH_DUR}> <AbdullahSegment /> </Sequence>
    <Sequence from={M_START}   durationInFrames={MALKY_DUR}>    <MalkySegment />    </Sequence>
    <Sequence from={Y_START}   durationInFrames={YEHIA_DUR}>    <YehiaSegment />    </Sequence>
    <Sequence from={OUT_START} durationInFrames={OUTRO_DUR}>    <OutroCard />       </Sequence>
  </AbsoluteFill>
);
