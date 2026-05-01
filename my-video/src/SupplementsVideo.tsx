import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:     "#080808",
  white:  "#FFFFFF",
  yellow: "#FFD700",
  red:    "#FF3B3B",
  green:  "#00E5A0",
  blue:   "#4DAAFF",
  gray:   "#888888",
};
const FONT = "'Arial Black', Impact, sans-serif";

// ── Durations (frames @ 30 fps) ───────────────────────────────────────────────
const HOOK_DUR  = 150;  //  5s
const MYTH_DUR  = 210;  //  7s
const EXCEP_DUR = 390;  // 13s
const CREAT_DUR = 900;  // 30s
const CTA_DUR   = 300;  // 10s
// Total: 1950 frames = 65 seconds

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

const Bg: React.FC<{ accent?: string }> = ({ accent = "transparent" }) => (
  <AbsoluteFill style={{
    background: `radial-gradient(ellipse at 50% 35%, ${accent}1a 0%, ${C.bg} 68%)`,
  }} />
);

const Vignette: React.FC = () => (
  <div style={{
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)",
    zIndex: 5, pointerEvents: "none",
  }} />
);

const BeatTag: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 12, 50, 65], [0, 0.6, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", top: 72, left: 0, right: 0, textAlign: "center",
      opacity: o, zIndex: 6,
      fontFamily: "Arial, sans-serif", fontSize: 22, color: "#444",
      textTransform: "uppercase", letterSpacing: 8,
    }}>{text}</div>
  );
};

// Animated big text
const BigText: React.FC<{
  text: string; size?: number; color?: string;
  delay?: number; anim?: "scale" | "left" | "right" | "up";
}> = ({ text, size = 90, color = C.white, delay = 0, anim = "scale" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - delay);
  const p = spring({ frame: lf, fps, config: { damping: 80, stiffness: 320 } });
  const o = interpolate(lf, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const offset = interpolate(p, [0, 1], [380, 0]);
  const tr =
    anim === "scale" ? `scale(${p})` :
    anim === "left"  ? `translateX(${-offset}px)` :
    anim === "right" ? `translateX(${offset}px)` :
                       `translateY(${interpolate(p, [0,1], [200,0])}px)`;
  return (
    <div style={{
      fontFamily: FONT, fontWeight: 900, fontSize: size,
      color, textTransform: "uppercase", letterSpacing: 3,
      textAlign: "center", lineHeight: 1.05, padding: "0 64px",
      transform: tr, opacity: o,
      textShadow: `0 4px 32px ${color}33`,
    }}>{text}</div>
  );
};

// TikTok-style captions
type Cap = { from: number; dur: number; text: string };

const Caption: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8, dur - 8, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", bottom: 96, left: 0, right: 0,
      display: "flex", justifyContent: "center",
      opacity: o, zIndex: 88, padding: "0 64px",
    }}>
      <div style={{
        backgroundColor: "rgba(0,0,0,0.84)", borderRadius: 10,
        padding: "16px 32px",
        fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 38,
        color: "#fff", textAlign: "center", lineHeight: 1.4, maxWidth: 880,
      }}>{text}</div>
    </div>
  );
};

const Caps: React.FC<{ caps: Cap[] }> = ({ caps }) => (
  <>
    {caps.map(({ from, dur, text }, i) => (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <Caption text={text} dur={dur} />
      </Sequence>
    ))}
  </>
);

// Bold tag / overlay label
const Tag: React.FC<{ text: string; color?: string; size?: number; delay?: number }> = ({
  text, color = C.yellow, size = 50, delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - delay);
  const scale = spring({ frame: lf, fps, config: { damping: 80, stiffness: 360 } });
  const o = interpolate(lf, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      fontFamily: FONT, fontWeight: 900, fontSize: size,
      color, textTransform: "uppercase", letterSpacing: 5,
      textAlign: "center",
      transform: `scale(${scale})`, opacity: o,
      textShadow: `0 0 28px ${color}55`,
    }}>{text}</div>
  );
};

// ── Supplement bottle card with red ✗ ────────────────────────────────────────
const SupCard: React.FC<{ name: string; label: string }> = ({ name, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame, fps, config: { damping: 90, stiffness: 260 } });
  const y = interpolate(slide, [0, 1], [280, 0]);
  const o = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const xScale = spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 55, stiffness: 480 } });

  return (
    <div style={{ transform: `translateY(${y}px)`, opacity: o, position: "relative", width: 420 }}>
      <div style={{
        backgroundColor: "#141414", borderRadius: 26,
        border: "2px solid #2a2a2a", padding: "36px 32px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ fontSize: 64, marginBottom: 18 }}>💊</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#fff", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>{name}</div>
        <div style={{ fontFamily: "Arial", fontSize: 24, color: "#777", fontStyle: "italic" }}>{label}</div>
        {/* Red X overlay */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 24,
          backgroundColor: "rgba(255,59,59,0.16)",
          border: `4px solid ${C.red}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${xScale})`,
        }}>
          <span style={{ fontFamily: FONT, fontSize: 120, color: C.red, textShadow: `0 0 50px ${C.red}`, opacity: 0.88 }}>✗</span>
        </div>
      </div>
    </div>
  );
};

// ── Good supplement card (green/blue glow) ───────────────────────────────────
const GoodCard: React.FC<{ emoji: string; name: string; stat: string; accent: string }> = ({ emoji, name, stat, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame, fps, config: { damping: 100, stiffness: 220 } });
  const y = interpolate(slide, [0, 1], [220, 0]);
  const o = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = interpolate(frame, [20, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ transform: `translateY(${y}px)`, opacity: o, position: "relative", width: 520 }}>
      <div style={{
        backgroundColor: "#0c1610",
        borderRadius: 26,
        border: `3px solid ${accent}`,
        padding: "44px 40px",
        textAlign: "center",
        boxShadow: `0 0 ${70 * glow}px ${accent}44`,
      }}>
        <div style={{ fontSize: 80, marginBottom: 18 }}>{emoji}</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 58, color: accent, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>{name}</div>
        <div style={{ fontFamily: "Arial", fontSize: 28, color: "#aaa" }}>{stat}</div>
      </div>
      {/* Checkmark */}
      <Sequence from={24} durationInFrames={999}>
        <CheckBadge accent={accent} />
      </Sequence>
    </div>
  );
};

const CheckBadge: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 70, stiffness: 440 } });
  return (
    <div style={{
      position: "absolute", top: -22, right: -22,
      width: 76, height: 76, borderRadius: "50%",
      backgroundColor: accent,
      display: "flex", alignItems: "center", justifyContent: "center",
      transform: `scale(${scale})`,
      boxShadow: `0 0 30px ${accent}88`,
      zIndex: 10,
    }}>
      <span style={{ fontSize: 38, color: "#000", fontWeight: 900 }}>✓</span>
    </div>
  );
};

// ── Brain pulse animation ─────────────────────────────────────────────────────
const BrainPulse: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: 320, height: 320 }}>
      {[150, 118, 86, 54, 22].map((r, i) => (
        <div key={i} style={{
          position: "absolute", left: "50%", top: "50%",
          width: r * 2, height: r * 2, borderRadius: "50%",
          border: `2px solid ${C.blue}`,
          opacity: 0.12 + i * 0.1,
          transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame * 0.1 + i * 0.6) * 0.07})`,
          boxShadow: `0 0 ${12 + i * 6}px ${C.blue}44`,
        }} />
      ))}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame * 0.15) * 0.06})`,
        fontSize: 88,
      }}>🧠</div>
    </div>
  );
};

// ── Myth debunk card with animated strikethrough ──────────────────────────────
const DebunkCard: React.FC<{ myth: string; verdict: string }> = ({ myth, verdict }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame, fps, config: { damping: 95, stiffness: 250 } });
  const y = interpolate(slide, [0, 1], [220, 0]);
  const o = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const strikeW = interpolate(frame, [22, 55], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ transform: `translateY(${y}px)`, opacity: o, width: 660 }}>
      <div style={{
        backgroundColor: "#120000",
        borderRadius: 22,
        border: `2px solid ${C.red}44`,
        padding: "36px 40px",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: "Arial", fontSize: 19, color: "#555", textTransform: "uppercase", letterSpacing: 6, marginBottom: 14 }}>MYTH</div>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 18 }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 56, color: "#FF7070", textTransform: "uppercase", letterSpacing: 2 }}>{myth}</div>
          <div style={{
            position: "absolute", top: "50%", left: 0,
            height: 6, width: `${strikeW}%`,
            backgroundColor: C.red,
            transform: "translateY(-50%)",
            boxShadow: `0 0 14px ${C.red}`,
          }} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 36, color: C.green, letterSpacing: 3 }}>{verdict} ✓ DEBUNKED</div>
      </div>
    </div>
  );
};

// ── Product mockup card ───────────────────────────────────────────────────────
const Product: React.FC<{ emoji: string; name: string; dose: string; color: string; delay?: number }> = ({
  emoji, name, dose, color, delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - delay);
  const scale = spring({ frame: lf, fps, config: { damping: 100, stiffness: 200 } });
  return (
    <div style={{ transform: `scale(${scale})` }}>
      <div style={{
        width: 240,
        backgroundColor: "#111",
        borderRadius: 22,
        border: `3px solid ${color}`,
        padding: "32px 24px",
        textAlign: "center",
        boxShadow: `0 0 44px ${color}33`,
      }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>{emoji}</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 28, color, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>{name}</div>
        <div style={{ fontFamily: "Arial", fontSize: 18, color: "#555" }}>{dose}</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// BEATS
// ═══════════════════════════════════════════════════════════════════════════

// Beat 1 · Hook  (0–150 / 5s)
const HookBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const pushIn = interpolate(frame, [0, 150], [1.0, 1.07], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const caps: Cap[] = [
    { from: 0,  dur: 78,  text: "Bro, I'm gonna save you" },
    { from: 74, dur: 76,  text: "hundreds of dollars right now." },
  ];

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn})` }}>
      <Bg accent={C.yellow} />
      <Vignette />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
        <div style={{ fontSize: 96 }}>💰</div>
        <BigText text="BRO," size={88} color={C.yellow} delay={8} anim="scale" />
        <BigText text="I'M GONNA SAVE YOU" size={72} color={C.white} delay={20} anim="up" />
        <BigText text="HUNDREDS" size={104} color={C.yellow} delay={38} anim="scale" />
        <Sequence from={50} durationInFrames={100}>
          <Tag text="💸 SAVE HUNDREDS" color={C.yellow} size={36} />
        </Sequence>
      </AbsoluteFill>
      <Caps caps={caps} />
    </AbsoluteFill>
  );
};

// Beat 2 · Myth Drop  (150–360 / 7s)
const MythBeat: React.FC = () => {
  const MYTHS = [
    { name: "Pre-Workout", label: "= mostly caffeine" },
    { name: "BCAAs",       label: "= useless w/ enough protein" },
    { name: "Fat Burners", label: "= straight-up scam" },
  ];

  const caps: Cap[] = [
    { from: 0,   dur: 68,  text: "99% of what you're buying is just marketing." },
    { from: 72,  dur: 82,  text: "Pre-workout = caffeine. BCAAs = useless. Fat burners = scam." },
    { from: 158, dur: 52,  text: '"Straight-up scam."' },
  ];

  return (
    <AbsoluteFill>
      <Bg accent={C.red} />
      <Vignette />
      <BeatTag text="Myth Drop" />
      <div style={{ position: "absolute", top: 130, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20 }}>
        <Tag text="99% MARKETING" color={C.red} size={56} />
      </div>
      {/* Cards as fast cuts */}
      {MYTHS.map(({ name, label }, i) => (
        <Sequence key={i} from={i * 68} durationInFrames={72}>
          <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SupCard name={name} label={label} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Caps caps={caps} />
    </AbsoluteFill>
  );
};

// Beat 3 · Two Exceptions  (360–750 / 13s)
const ExceptionsBeat: React.FC = () => {
  const caps: Cap[] = [
    { from: 0,   dur: 88,  text: "Exactly two things have real science behind them." },
    { from: 92,  dur: 105, text: "Number one: Vitamin D — half the world is deficient." },
    { from: 202, dur: 84,  text: "It wrecks your mood and immunity. Just take it." },
    { from: 292, dur: 98,  text: "Number two — and this one's slept on — Creatine." },
  ];

  return (
    <AbsoluteFill>
      <Bg accent={C.green} />
      <Vignette />
      <BeatTag text="The Exceptions" />
      <div style={{ position: "absolute", top: 130, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20 }}>
        <Tag text="ONLY 2 WORTH IT ✓" color={C.green} size={46} />
      </div>

      {/* Vitamin D */}
      <Sequence from={45} durationInFrames={210}>
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <Tag text="#1" color={C.yellow} size={78} />
          <GoodCard emoji="☀️" name="Vitamin D" stat="50% of the world is deficient" accent={C.yellow} />
        </AbsoluteFill>
      </Sequence>

      {/* Creatine */}
      <Sequence from={258} durationInFrames={132}>
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <Tag text="#2" color={C.blue} size={78} />
          <GoodCard emoji="⚡" name="Creatine" stat="science-backed. underrated." accent={C.blue} />
        </AbsoluteFill>
      </Sequence>

      <Caps caps={caps} />
    </AbsoluteFill>
  );
};

// Beat 4 · Creatine Deep Dive  (750–1650 / 30s)
const CreatineBeat: React.FC = () => {
  const caps: Cap[] = [
    { from: 0,   dur: 88,  text: "Creatine isn't just a muscle thing." },
    { from: 92,  dur: 82,  text: "Your brain runs on it too." },
    { from: 180, dur: 102, text: "Studies show it boosts memory and cognition" },
    { from: 288, dur: 118, text: "— especially when sleep-deprived or stressed." },
    { from: 412, dur: 96,  text: "All that fear about kidney damage?" },
    { from: 514, dur: 78,  text: "Completely debunked." },
    { from: 598, dur: 92,  text: "Hair loss? Also a myth." },
    { from: 696, dur: 98,  text: "One tiny study. Never replicated." },
    { from: 800, dur: 100, text: "The one supplement actually worth your money." },
  ];

  return (
    <AbsoluteFill>
      <Bg accent={C.blue} />
      <Vignette />
      <BeatTag text="Creatine Deep Dive" />

      {/* Brain section */}
      <Sequence from={0} durationInFrames={390}>
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
          <Tag text="🧠 BRAIN FUEL" color={C.blue} size={52} />
          <BrainPulse />
          <Sequence from={65} durationInFrames={325}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <Tag text="MEMORY +"    color={C.green} size={50} delay={0}  />
              <Tag text="COGNITION +" color={C.green} size={50} delay={18} />
              <Tag text="FOCUS +"     color={C.green} size={50} delay={36} />
            </div>
          </Sequence>
        </AbsoluteFill>
      </Sequence>

      {/* Myth: kidney */}
      <Sequence from={395} durationInFrames={210}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DebunkCard myth="KIDNEY DAMAGE" verdict="SCIENCE SAYS" />
        </AbsoluteFill>
      </Sequence>

      {/* Myth: hair loss */}
      <Sequence from={580} durationInFrames={220}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DebunkCard myth="HAIR LOSS" verdict="ONE TINY STUDY" />
        </AbsoluteFill>
      </Sequence>

      {/* Final line */}
      <Sequence from={805} durationInFrames={95}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Tag text="ACTUALLY WORTH IT ✓" color={C.blue} size={58} />
        </AbsoluteFill>
      </Sequence>

      <Caps caps={caps} />
    </AbsoluteFill>
  );
};

// Beat 5 · CTA  (1650–1950 / 10s)
const CTABeat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const followScale = spring({ frame: Math.max(0, frame - 155), fps, config: { damping: 100, stiffness: 200 } });

  const caps: Cap[] = [
    { from: 0,   dur: 88,  text: "Your stack: Creatine + Vitamin D. That's it." },
    { from: 92,  dur: 78,  text: "Save the rest for actual food." },
    { from: 176, dur: 124, text: "Follow for more no-BS fitness content. 💪" },
  ];

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Bg accent="#2a2a2a" />
      <Vignette />
      <BeatTag text="Your Stack" />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
        <BigText text="YOUR STACK:" size={64} color={C.white} delay={5} anim="up" />

        <Sequence from={22} durationInFrames={278}>
          <div style={{ display: "flex", flexDirection: "row", gap: 32 }}>
            <Product emoji="⚡" name="Creatine"  dose="5g / day"     color={C.blue}   delay={0}  />
            <Product emoji="☀️" name="Vitamin D" dose="2000 IU / day" color={C.yellow} delay={18} />
          </div>
        </Sequence>

        <Sequence from={85} durationInFrames={215}>
          <Tag text="THAT'S IT." color={C.green} size={78} />
        </Sequence>

        <Sequence from={155} durationInFrames={145}>
          <div style={{
            transform: `scale(${followScale})`,
            backgroundColor: "#111",
            border: `2px solid ${C.green}`,
            borderRadius: 50,
            padding: "14px 36px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ fontSize: 26 }}>💪</span>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.green, letterSpacing: 2 }}>FOLLOW FOR MORE</span>
          </div>
        </Sequence>
      </AbsoluteFill>
      <Caps caps={caps} />
    </AbsoluteFill>
  );
};

// ── Flash cut ─────────────────────────────────────────────────────────────────
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 5, 16], [0.8, 0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", inset: 0, backgroundColor: "#fff", opacity: o, zIndex: 300, pointerEvents: "none" }} />;
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════

const BEATS = [
  { from: 0,                                               dur: HOOK_DUR,  comp: HookBeat },
  { from: HOOK_DUR,                                        dur: MYTH_DUR,  comp: MythBeat },
  { from: HOOK_DUR + MYTH_DUR,                             dur: EXCEP_DUR, comp: ExceptionsBeat },
  { from: HOOK_DUR + MYTH_DUR + EXCEP_DUR,                 dur: CREAT_DUR, comp: CreatineBeat },
  { from: HOOK_DUR + MYTH_DUR + EXCEP_DUR + CREAT_DUR,     dur: CTA_DUR,   comp: CTABeat },
];

const CUTS = [HOOK_DUR, HOOK_DUR + MYTH_DUR, HOOK_DUR + MYTH_DUR + EXCEP_DUR, HOOK_DUR + MYTH_DUR + EXCEP_DUR + CREAT_DUR];

export const SupplementsVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {/* Voiceover */}
    <Audio src={staticFile("voiceover.wav")} volume={1} />

    {BEATS.map(({ from, dur, comp: Comp }, i) => (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <Comp />
      </Sequence>
    ))}
    {CUTS.map((cut, i) => (
      <Sequence key={i} from={cut - 3} durationInFrames={20}>
        <Flash />
      </Sequence>
    ))}
  </AbsoluteFill>
);
