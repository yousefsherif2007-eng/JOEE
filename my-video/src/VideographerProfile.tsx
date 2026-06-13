import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const ACCENT    = "#0077FF";
const SECONDARY = "#00D4AA";
const BG        = "#070A0F";
const BODY      = "Inter, Arial, sans-serif";
const HEAD      = "'Arial Black', Arial, sans-serif";

// Timeline (30 fps) — 300 frames = 10 s
const INTRO_END  = 70;
const SKILLS_END = 160;
const STATS_END  = 250;
const CTA_END    = 300;

// ── Background ────────────────────────────────────────────────────────────────
const AnimatedBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "5%", right: "-25%",
        width: "80%", height: "65%",
        background: `radial-gradient(ellipse, ${ACCENT}18 0%, transparent 70%)`,
        transform: `rotate(-${frame * 0.04}deg)`,
      }} />
      <div style={{
        position: "absolute", bottom: "5%", left: "-20%",
        width: "65%", height: "50%",
        background: `radial-gradient(ellipse, ${SECONDARY}12 0%, transparent 70%)`,
        transform: `rotate(${frame * 0.03}deg)`,
      }} />
      {/* Lens aperture rings */}
      {[220, 340, 460].map((size, i) => (
        <div key={i} style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: size, height: size,
          borderRadius: "50%",
          border: `1px solid rgba(0,119,255,${0.06 - i * 0.015})`,
          transform: `translate(-50%, -50%) rotate(${frame * (0.02 + i * 0.01)}deg)`,
        }} />
      ))}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
      }} />
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const w = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: "rgba(255,255,255,0.08)", zIndex: 90 }}>
      <div style={{ width: `${w}%`, height: "100%", background: `linear-gradient(90deg, ${ACCENT}, ${SECONDARY})` }} />
    </div>
  );
};

// ── Intro ─────────────────────────────────────────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const avatar = spring({ frame: frame - 5,  fps, config: { damping: 110, stiffness: 190 } });
  const badge  = spring({ frame: frame - 18, fps, config: { damping: 140, stiffness: 170 } });
  const title  = spring({ frame: frame - 28, fps, config: { damping: 130, stiffness: 150 } });
  const sub    = spring({ frame: frame - 42, fps, config: { damping: 130, stiffness: 140 } });
  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 22, padding: "0 52px",
    }}>
      <div style={{
        width: 176, height: 176, borderRadius: "50%",
        background: `linear-gradient(135deg, ${ACCENT}, ${SECONDARY})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${avatar})`,
        boxShadow: `0 0 80px ${ACCENT}55`,
        border: `3px solid ${ACCENT}66`,
      }}>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 60, color: "#fff" }}>VG</div>
      </div>

      <div style={{
        fontFamily: BODY, fontSize: 11, fontWeight: 700, color: ACCENT,
        letterSpacing: 5, textTransform: "uppercase",
        backgroundColor: `${ACCENT}1A`,
        border: `1px solid ${ACCENT}55`,
        padding: "6px 20px", borderRadius: 100,
        transform: `scale(${badge})`,
      }}>Available for Hire</div>

      <div style={{ textAlign: "center", transform: `scale(${title})` }}>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 64, color: "#fff", lineHeight: 1.1 }}>
          Videographer
        </div>
      </div>

      <div style={{
        fontFamily: BODY, fontWeight: 400, fontSize: 20, color: "#888",
        textAlign: "center", lineHeight: 1.65,
        transform: `scale(${sub})`,
      }}>
        Every frame, a masterpiece.{"\n"}Every moment, preserved.
      </div>

      <div style={{
        width: 56, height: 3, borderRadius: 2,
        background: `linear-gradient(90deg, ${ACCENT}, ${SECONDARY})`,
        transform: `scale(${sub})`,
      }} />
    </AbsoluteFill>
  );
};

// ── Skills ────────────────────────────────────────────────────────────────────
const SKILLS = [
  { icon: "🎥", label: "Cinematic Framing & Composition" },
  { icon: "💡", label: "Professional Lighting Setup" },
  { icon: "🎙️", label: "On-location Sound Recording" },
  { icon: "🚁", label: "Drone / Aerial Cinematography" },
  { icon: "📷", label: "Sony · Canon · Blackmagic · DJI" },
];

const SkillsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const header = spring({ frame: frame - 4, fps, config: { damping: 140, stiffness: 160 } });
  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "0 40px", gap: 20,
    }}>
      <div style={{ transform: `scale(${header})`, marginBottom: 4 }}>
        <div style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>
          What I bring
        </div>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 44, color: "#fff" }}>Core Skills</div>
      </div>

      {SKILLS.map((s, i) => {
        const lf = Math.max(0, frame - i * 15 - 10);
        const slide = spring({ frame: lf, fps, config: { damping: 120, stiffness: 180 } });
        const x  = interpolate(slide, [0, 1], [-280, 0]);
        const op = interpolate(lf, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, transform: `translateX(${x}px)`, opacity: op }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: `${ACCENT}20`, border: `1px solid ${ACCENT}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>{s.icon}</div>
            <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 19, color: "#e8e8e8", lineHeight: 1.35 }}>{s.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "500+", label: "Shoots Completed",        color: ACCENT    },
  { value: "6K",   label: "Max Capture Resolution",  color: SECONDARY },
  { value: "24h",  label: "Rush Delivery Available", color: "#F59E0B" },
];

const StatsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const header = spring({ frame: frame - 4, fps, config: { damping: 140, stiffness: 160 } });
  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "0 40px", gap: 24,
    }}>
      <div style={{ transform: `scale(${header})`, marginBottom: 4 }}>
        <div style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>
          By the numbers
        </div>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 44, color: "#fff" }}>Track Record</div>
      </div>

      {STATS.map((s, i) => {
        const lf    = Math.max(0, frame - i * 22 - 8);
        const scale = spring({ frame: lf, fps, config: { damping: 90, stiffness: 240 } });
        const op    = interpolate(lf, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{
            backgroundColor: "rgba(255,255,255,0.035)",
            border: `1px solid rgba(255,255,255,0.08)`,
            borderLeft: `5px solid ${s.color}`,
            borderRadius: 16, padding: "22px 26px",
            transform: `scale(${scale})`, opacity: op,
          }}>
            <div style={{
              fontFamily: HEAD, fontWeight: 900, fontSize: 56, color: s.color,
              lineHeight: 1, textShadow: `0 0 50px ${s.color}44`,
            }}>{s.value}</div>
            <div style={{ fontFamily: BODY, fontWeight: 400, fontSize: 17, color: "#777", marginTop: 6 }}>{s.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── CTA ───────────────────────────────────────────────────────────────────────
const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l1 = spring({ frame: frame - 6,  fps, config: { damping: 130, stiffness: 160 } });
  const l2 = spring({ frame: frame - 20, fps, config: { damping: 130, stiffness: 150 } });
  const l3 = spring({ frame: frame - 36, fps, config: { damping: 120, stiffness: 140 } });
  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 26, padding: "0 52px",
    }}>
      <div style={{
        fontFamily: BODY, fontSize: 12, fontWeight: 700, color: ACCENT,
        letterSpacing: 5, textTransform: "uppercase",
        transform: `scale(${l1})`,
      }}>Let's create something epic</div>

      <div style={{
        fontFamily: HEAD, fontWeight: 900, fontSize: 54, color: "#fff",
        textAlign: "center", lineHeight: 1.18,
        transform: `scale(${l2})`,
      }}>Book Your Shoot Today</div>

      <div style={{
        background: `linear-gradient(135deg, ${ACCENT}, ${SECONDARY})`,
        borderRadius: 100, padding: "22px 52px",
        transform: `scale(${l3})`,
        boxShadow: `0 0 50px ${ACCENT}66`,
      }}>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 22, color: "#fff" }}>
          Get in Touch
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Root composition ──────────────────────────────────────────────────────────
export const VideographerProfile: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <AnimatedBg />
    <Sequence from={0}          durationInFrames={INTRO_END}>
      <IntroScene />
    </Sequence>
    <Sequence from={INTRO_END}  durationInFrames={SKILLS_END - INTRO_END}>
      <SkillsScene />
    </Sequence>
    <Sequence from={SKILLS_END} durationInFrames={STATS_END - SKILLS_END}>
      <StatsScene />
    </Sequence>
    <Sequence from={STATS_END}  durationInFrames={CTA_END - STATS_END}>
      <CtaScene />
    </Sequence>
    <ProgressBar />
  </AbsoluteFill>
);
