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

// ── Videos (cleaned, 576×1024 portrait = perfect 9:16) ──────────────────────
const V = {
  abdullah: "processed/abdullah.mp4",
  gindy:    "processed/gindy.mp4",
  malky:    "processed/malky.mp4",
  yehia:    "processed/yehia.mp4",
};

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  red:    "#FF3030",
  green:  "#00E5A0",
  yellow: "#FFD700",
  blue:   "#4DAAFF",
  white:  "#FFFFFF",
  dark:   "#080808",
};
const FONT = "'Arial Black', Impact, sans-serif";

// ── Segment durations (frames @ 30fps) ───────────────────────────────────────
const HOOK_DUR     = 90;   // 3s  – hook frame
const ABDULLAH_DUR = 750;  // 25s – uses first 25s of 34s clip
const GINDY_DUR    = 750;  // 25s – uses first 25s of 79s clip
const MALKY_DUR    = 381;  // 12.7s – full clip
const YEHIA_DUR    = 540;  // 18s – full clip
const ENDCARD_DUR  = 90;   // 3s  – CTA end screen
// Total: 2601 frames ≈ 86.7 seconds

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

// Cinematic letterbox (subtle — keeps faces visible)
const Bars: React.FC = () => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60, background: C.dark, zIndex: 100 }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: C.dark, zIndex: 100 }} />
  </>
);

// Vignette
const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.65 }) => (
  <div style={{
    position: "absolute", inset: 0,
    background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${strength}) 100%)`,
    zIndex: 8, pointerEvents: "none",
  }} />
);

// Full-screen video with Ken Burns zoom + color grade
const CinematicClip: React.FC<{
  src: string;
  startFrom?: number;
  zoomTo?: number;
  filter?: string;
  fadeIn?: boolean;
}> = ({ src, startFrom = 0, zoomTo = 1.06, filter = "brightness(0.85) contrast(1.15) saturate(1.0)", fadeIn = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, zoomTo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = fadeIn ? interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <Video
        src={staticFile(src)}
        startFrom={startFrom}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter }}
      />
    </AbsoluteFill>
  );
};

// RGB glitch flash
const GlitchFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const active = frame % 20 < 3;
  if (!active) return null;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,0,0,0.07)", transform: "translateX(8px)", mixBlendMode: "screen", zIndex: 15, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,255,255,0.07)", transform: "translateX(-8px)", mixBlendMode: "screen", zIndex: 15, pointerEvents: "none" }} />
    </>
  );
};

// White flash cut
const FlashCut: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 4, 18], [1, 0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", inset: 0, backgroundColor: "#fff", opacity: o, zIndex: 400, pointerEvents: "none" }} />;
};

// Social handle lower-third
const LowerThird: React.FC<{ handle: string; accent: string }> = ({ handle, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame, fps, config: { damping: 120, stiffness: 180 } });
  const x = interpolate(slide, [0, 1], [-400, 0]);
  return (
    <div style={{ position: "absolute", bottom: 130, left: 40, transform: `translateX(${x}px)`, zIndex: 60 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        backgroundColor: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        borderRadius: 50,
        padding: "10px 20px 10px 14px",
        border: `1.5px solid ${accent}`,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          backgroundColor: accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: FONT, fontWeight: 900, fontSize: 16, color: "#000",
        }}>{handle[1].toUpperCase()}</div>
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: 1 }}>{handle}</span>
      </div>
    </div>
  );
};

// Kinetic word slam
const KineticText: React.FC<{
  text: string; color?: string; size?: number;
  from?: "left" | "right" | "bottom" | "top"; delay?: number;
}> = ({ text, color = C.yellow, size = 100, from = "right", delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - delay);
  const p = spring({ frame: lf, fps, config: { damping: 70, stiffness: 340 } });
  const dist = interpolate(p, [0, 1], [500, 0]);
  const tr =
    from === "right"  ? `translateX(${dist}px)` :
    from === "left"   ? `translateX(${-dist}px)` :
    from === "bottom" ? `translateY(${dist}px)` :
                        `translateY(${-dist}px)`;
  const opacity = interpolate(lf, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      fontFamily: FONT, fontWeight: 900, fontSize: size,
      color, textTransform: "uppercase", letterSpacing: 4,
      textAlign: "center",
      transform: tr, opacity,
      textShadow: `0 0 50px ${color}55, 0 4px 20px rgba(0,0,0,0.9)`,
      WebkitTextStroke: `1.5px ${color}`,
      lineHeight: 1.05, padding: "0 50px",
    }}>{text}</div>
  );
};

// Fake social media post (phone style)
const FakePost: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame, fps, config: { damping: 110, stiffness: 200 } });
  const y = interpolate(slide, [0, 1], [300, 0]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", bottom: 160, left: 30, right: 30,
      transform: `translateY(${y}px)`, opacity, zIndex: 75,
    }}>
      <div style={{
        backgroundColor: "#161616",
        borderRadius: 20,
        border: `2px solid ${C.red}`,
        overflow: "hidden",
        boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 40px ${C.red}33`,
      }}>
        <div style={{
          backgroundColor: "#1c0505", padding: "12px 16px",
          display: "flex", alignItems: "center", gap: 10,
          borderBottom: `1px solid ${C.red}33`,
        }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "#6b0000" }} />
          <div>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>ViralHealth247</div>
            <div style={{ fontSize: 11, color: "#666" }}>Sponsored · 2h</div>
          </div>
        </div>
        <div style={{ padding: "16px" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#FF7070", lineHeight: 1.45, marginBottom: 12 }}>
            🍫🔥 Eating chocolate EVERY DAY makes you lose weight INSTANTLY! Doctors won't tell you this!
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#444", paddingTop: 10, borderTop: "1px solid #222" }}>
            <span>👍 48.2K</span><span>💬 6.1K</span><span>↗ Share</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Animated stamp
const Stamp: React.FC<{ text: string; color?: string; rotation?: number }> = ({
  text, color = C.red, rotation = -12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 50, stiffness: 500 } });
  return (
    <div style={{
      position: "absolute", top: "30%", left: "50%",
      transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
      border: `7px solid ${color}`, borderRadius: 6,
      padding: "10px 24px",
      fontFamily: FONT, fontWeight: 900, fontSize: 56,
      color, textTransform: "uppercase", letterSpacing: 6,
      opacity: 0.9, zIndex: 90,
      textShadow: `0 0 30px ${color}`,
      boxShadow: `inset 0 0 30px ${color}22`,
    }}>{text}</div>
  );
};

// Split screen overlay (Gindy)
const SplitScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity, zIndex: 35 }}>
      {/* Left – clickbait / red tint */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "49%",
        backgroundColor: "rgba(100,0,0,0.68)", backdropFilter: "blur(2px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 30, gap: 14,
        borderRight: `3px solid ${C.red}`,
      }}>
        <div style={{ fontSize: 14, color: C.red, fontWeight: 800, textTransform: "uppercase", letterSpacing: 5, textAlign: "center" }}>Title Says:</div>
        <div style={{ fontSize: 18, color: "#FF9999", fontWeight: 700, textAlign: "center", lineHeight: 1.4 }}>
          "Eating chocolate makes you lose weight INSTANTLY!"
        </div>
      </div>
      {/* VS */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%,-50%)",
        backgroundColor: "#fff", borderRadius: "50%",
        width: 54, height: 54,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT, fontWeight: 900, fontSize: 18, color: "#000",
        zIndex: 40, boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
      }}>VS</div>
      {/* Right – truth / blue */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "49%",
        backgroundColor: "rgba(0,30,90,0.68)", backdropFilter: "blur(2px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 30, gap: 14,
        borderLeft: `3px solid ${C.blue}`,
      }}>
        <div style={{ fontSize: 14, color: C.blue, fontWeight: 800, textTransform: "uppercase", letterSpacing: 5, textAlign: "center" }}>Article Says:</div>
        <div style={{ fontSize: 18, color: "#AADDFF", fontWeight: 700, textAlign: "center", lineHeight: 1.4 }}>
          "Chocolate can be part of a balanced diet."
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Fake headline card
const HeadlineCard: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 90, stiffness: 300 } });
  return (
    <div style={{
      fontFamily: FONT, fontWeight: 900, fontSize: 26,
      color: "#FF8080", textAlign: "center",
      padding: "18px 24px",
      backgroundColor: "#160000",
      border: `2px solid ${C.red}55`,
      borderRadius: 14,
      transform: `scale(${scale})`,
      boxShadow: `0 8px 40px rgba(0,0,0,0.9)`,
      margin: "0 24px",
    }}>{text}</div>
  );
};

// Media literacy checklist
const CheckItem: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - delay);
  const slide = spring({ frame: lf, fps, config: { damping: 120, stiffness: 180 } });
  const x = interpolate(slide, [0, 1], [-300, 0]);
  const opacity = interpolate(lf, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      transform: `translateX(${x}px)`, opacity,
      display: "flex", alignItems: "center", gap: 16,
      backgroundColor: `${C.green}12`,
      border: `1.5px solid ${C.green}55`,
      borderRadius: 14, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: "50%", backgroundColor: C.green,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontWeight: 900, fontSize: 20, color: "#000",
      }}>✓</div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 26, color: "#fff", lineHeight: 1.25 }}>{text}</div>
    </div>
  );
};

const Checklist: React.FC = () => (
  <div style={{ position: "absolute", bottom: 140, left: 30, right: 30, zIndex: 70 }}>
    <CheckItem text="Is this source reliable?" delay={0} />
    <CheckItem text="Does the content match the title?" delay={28} />
    <CheckItem text="Think before you click." delay={56} />
  </div>
);

// Verified badge
const VerifiedBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 100, stiffness: 220 } });
  return (
    <div style={{
      position: "absolute", top: 90, right: 30,
      transform: `scale(${scale})`, zIndex: 80,
      display: "flex", alignItems: "center", gap: 10,
      backgroundColor: `${C.green}18`, border: `2px solid ${C.green}`,
      borderRadius: 50, padding: "10px 22px",
    }}>
      <span style={{ fontSize: 22, color: C.green }}>✓</span>
      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: C.green, letterSpacing: 2 }}>VERIFIED</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK FRAME  (0–3s)
// ═══════════════════════════════════════════════════════════════════════════
const HookFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const bg = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: C.dark, opacity: bg }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <KineticText text="YOU'VE BEEN" color={C.white} size={88} from="left" delay={5} />
        <KineticText text="LIED TO" color={C.red} size={110} from="right" delay={15} />
        <KineticText text="BY THIS TITLE 👇" color={C.yellow} size={62} from="bottom" delay={28} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ABDULLAH  (3s–28s)
// ═══════════════════════════════════════════════════════════════════════════
const AbdullahSegment: React.FC = () => (
  <AbsoluteFill>
    {/* Warm tension grade */}
    <CinematicClip
      src={V.abdullah}
      zoomTo={1.08}
      filter="brightness(0.84) contrast(1.22) saturate(1.25) sepia(0.08)"
    />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(140,30,0,0.15) 0%, transparent 55%)", zIndex: 6, pointerEvents: "none" }} />
    <Vignette strength={0.6} />

    {/* CLICKBAIT slam at frame 90 */}
    <Sequence from={90} durationInFrames={80}>
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70 }}>
        <KineticText text="CLICKBAIT" color={C.yellow} size={108} from="right" />
      </AbsoluteFill>
    </Sequence>

    {/* Fake post slides up at frame 200 */}
    <Sequence from={200} durationInFrames={550}>
      <FakePost />
    </Sequence>

    {/* Lower third */}
    <Sequence from={15} durationInFrames={220}>
      <LowerThird handle="@Abdullah" accent={C.yellow} />
    </Sequence>

    <Bars />
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════
// GINDY  (28s–53s)
// ═══════════════════════════════════════════════════════════════════════════
const GindySegment: React.FC = () => (
  <AbsoluteFill>
    <CinematicClip
      src={V.gindy}
      zoomTo={1.07}
      filter="brightness(0.83) contrast(1.14) saturate(0.9)"
      fadeIn
    />
    <Vignette />

    {/* Split screen at frame 120 */}
    <Sequence from={120} durationInFrames={630}>
      <SplitScreen />
    </Sequence>

    {/* EXAGGERATED stamp at frame 255 */}
    <Sequence from={255} durationInFrames={495}>
      <Stamp text="EXAGGERATED" color={C.red} rotation={-10} />
    </Sequence>

    {/* Lower third */}
    <Sequence from={15} durationInFrames={220}>
      <LowerThird handle="@Gindy" accent={C.blue} />
    </Sequence>

    <Bars />
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════
// MALKY  (53s–65.7s)
// ═══════════════════════════════════════════════════════════════════════════
const FAKE_HEADLINES = [
  "SHARK FOUND LIVING IN CITY SUBWAY 🦈",
  "Man Discovers SECRET to Stop Aging Forever!",
  "Scientists CONFIRM: Moon Is Artificial 🌙",
];

const MalkySegment: React.FC = () => (
  <AbsoluteFill>
    <CinematicClip
      src={V.malky}
      zoomTo={1.10}
      filter="brightness(0.78) contrast(1.14) saturate(0.45)"
      fadeIn
    />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(0,30,40,0.4) 100%)", zIndex: 6, pointerEvents: "none" }} />
    <Vignette strength={0.7} />
    <GlitchFlash />

    {/* Fast-cut fake headlines */}
    {FAKE_HEADLINES.map((h, i) => (
      <Sequence key={i} from={60 + i * 85} durationInFrames={80}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 65 }}>
          <HeadlineCard text={h} />
        </AbsoluteFill>
      </Sequence>
    ))}

    {/* MISLEADING stamp */}
    {[0, 1, 2].map(i => (
      <Sequence key={i} from={68 + i * 85} durationInFrames={72}>
        <Stamp text="MISLEADING" color={C.red} rotation={-9} />
      </Sequence>
    ))}

    {/* Lower third */}
    <Sequence from={15} durationInFrames={200}>
      <LowerThird handle="@Malky" accent="#FF6B35" />
    </Sequence>

    <Bars />
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════
// YEHIA  (65.7s–83.7s)
// ═══════════════════════════════════════════════════════════════════════════
const YehiaSegment: React.FC = () => (
  <AbsoluteFill>
    <CinematicClip
      src={V.yehia}
      zoomTo={1.05}
      filter="brightness(1.06) contrast(1.02) saturate(1.12)"
      fadeIn
    />
    <Vignette strength={0.4} />

    {/* Checklist */}
    <Sequence from={200} durationInFrames={340}>
      <Checklist />
    </Sequence>

    {/* VERIFIED badge */}
    <Sequence from={380} durationInFrames={160}>
      <VerifiedBadge />
    </Sequence>

    {/* Lower third */}
    <Sequence from={15} durationInFrames={220}>
      <LowerThird handle="@Yehia" accent={C.green} />
    </Sequence>

    <Bars />
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════
// END CARD  (83.7s–86.7s)
// ═══════════════════════════════════════════════════════════════════════════
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l1 = spring({ frame: frame - 15, fps, config: { damping: 120, stiffness: 200 } });
  const l2 = spring({ frame: frame - 30, fps, config: { damping: 120, stiffness: 200 } });
  const l3 = spring({ frame: frame - 50, fps, config: { damping: 120, stiffness: 200 } });

  return (
    <AbsoluteFill style={{
      backgroundColor: C.dark, opacity: bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 22,
    }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: C.yellow, textTransform: "uppercase", letterSpacing: 4, transform: `scale(${l1})`, textShadow: `0 0 60px ${C.yellow}44`, textAlign: "center" }}>
        THINK BEFORE
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: C.yellow, textTransform: "uppercase", letterSpacing: 4, transform: `scale(${l2})`, textShadow: `0 0 60px ${C.yellow}44` }}>
        YOU CLICK.
      </div>
      <div style={{ marginTop: 20, fontFamily: "Arial, sans-serif", fontWeight: 400, fontSize: 26, color: "#444", textTransform: "uppercase", letterSpacing: 10, transform: `scale(${l3})`, textAlign: "center" }}>
        Save this so you don't get tricked 🔖
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOT COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════

const A = HOOK_DUR;
const G = A + ABDULLAH_DUR;
const M = G + GINDY_DUR;
const Y = M + MALKY_DUR;
const E = Y + YEHIA_DUR;

const CUTS = [A, G, M, Y];

export const ClickbaitVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.dark }}>
    <Sequence from={0} durationInFrames={HOOK_DUR}>     <HookFrame />       </Sequence>
    <Sequence from={A} durationInFrames={GINDY_DUR}>    <GindySegment />    </Sequence>
    <Sequence from={G} durationInFrames={ABDULLAH_DUR}> <AbdullahSegment /> </Sequence>
    <Sequence from={M} durationInFrames={MALKY_DUR}>    <MalkySegment />    </Sequence>
    <Sequence from={Y} durationInFrames={YEHIA_DUR}>    <YehiaSegment />    </Sequence>
    <Sequence from={E} durationInFrames={ENDCARD_DUR}>  <EndCard />         </Sequence>

    {/* Flash cuts between speakers */}
    {CUTS.map((cut, i) => (
      <Sequence key={i} from={cut - 3} durationInFrames={22}>
        <FlashCut />
      </Sequence>
    ))}
  </AbsoluteFill>
);
