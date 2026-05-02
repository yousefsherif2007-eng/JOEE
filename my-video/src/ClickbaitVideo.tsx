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

// ── Videos (full length, nothing cut) ────────────────────────────────────────
const V = {
  gindy:    "processed/gindy.mp4",
  abdullah: "processed/abdullah.mp4",
  malky:    "processed/malky.mp4",
  yehia:    "processed/yehia.mp4",
};

// ── Frame durations ───────────────────────────────────────────────────────────
const INTRO_DUR    = 90;    // 3s
const GINDY_DUR    = 2368;  // 78.9s — full clip
const ABDULLAH_DUR = 1029;  // 34.3s — full clip
const MALKY_DUR    = 381;   // 12.7s — full clip
const YEHIA_DUR    = 566;   // 18.9s — full clip
const OUTRO_DUR    = 90;    // 3s
// Total: 4524 frames ≈ 150.8s

const G_START   = INTRO_DUR;
const A_START   = G_START + GINDY_DUR;
const M_START   = A_START + ABDULLAH_DUR;
const Y_START   = M_START + MALKY_DUR;
const OUT_START = Y_START + YEHIA_DUR;

// ── Design tokens ─────────────────────────────────────────────────────────────
const BODY  = "Inter, Arial, sans-serif";
const HEAD  = "'Arial Black', Arial, sans-serif";

const ACCENT = {
  gindy:    "#4DAAFF", // blue
  abdullah: "#FF8C42", // orange
  malky:    "#A855F7", // purple
  yehia:    "#00E5A0", // green
};

// ═══════════════════════════════════════════════════════════════════════════
// SHARED PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => (
  <div style={{
    position: "absolute", inset: 0,
    background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${strength}) 100%)`,
    zIndex: 5, pointerEvents: "none",
  }} />
);

const CleanClip: React.FC<{ src: string; fadeIn?: boolean }> = ({ src, fadeIn = false }) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn
    ? interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <Video
        src={staticFile(src)}
        style={{
          width: "100%", height: "100%",
          objectFit: "cover",
          filter: "brightness(1.04) contrast(1.06) saturate(1.06)",
        }}
      />
    </AbsoluteFill>
  );
};

// Slide-in name tag — stays visible for 7 s then fades
const NameTag: React.FC<{ name: string; role: string; accent: string }> = ({ name, role, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame: frame - 8, fps, config: { damping: 140, stiffness: 160 } });
  const x = interpolate(slide, [0, 1], [-360, 0]);
  const fade = interpolate(frame, [185, 215], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", bottom: 140, left: 36,
      transform: `translateX(${x}px)`,
      opacity: fade, zIndex: 55,
    }}>
      <div style={{
        backgroundColor: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(10px)",
        borderRadius: 6,
        borderLeft: `4px solid ${accent}`,
        padding: "12px 22px",
      }}>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 30, color: "#fff", letterSpacing: 0.5 }}>{name}</div>
        <div style={{ fontFamily: BODY, fontWeight: 400, fontSize: 15, color: "#aaa", marginTop: 2, letterSpacing: 1.5, textTransform: "uppercase" }}>{role}</div>
      </div>
    </div>
  );
};

// Info card — slides from top or bottom, fades out near end of its sequence
const InfoCard: React.FC<{
  pos?: "top" | "bottom";
  accent?: string;
  label?: string;
  title: string;
  body?: string;
}> = ({ pos = "top", accent = "#fff", label, title, body }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const slide = spring({ frame: frame - 4, fps, config: { damping: 130, stiffness: 160 } });
  const dy = interpolate(slide, [0, 1], [pos === "top" ? -140 : 140, 0]);
  const fadeOut = interpolate(frame, [durationInFrames - 28, durationInFrames - 6], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const placement = pos === "top" ? { top: 90 } : { bottom: 170 };
  return (
    <div style={{
      position: "absolute", left: 30, right: 30, ...placement,
      transform: `translateY(${dy}px)`, opacity: fadeOut, zIndex: 60,
    }}>
      <div style={{
        backgroundColor: "rgba(8,8,8,0.82)",
        backdropFilter: "blur(14px)",
        borderRadius: 14,
        borderLeft: `5px solid ${accent}`,
        padding: "18px 22px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      }}>
        {label && (
          <div style={{
            fontFamily: BODY, fontSize: 11, fontWeight: 700, color: accent,
            letterSpacing: 3, textTransform: "uppercase", marginBottom: 8,
          }}>{label}</div>
        )}
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 24, color: "#fff", lineHeight: 1.3 }}>{title}</div>
        {body && (
          <div style={{ fontFamily: BODY, fontWeight: 400, fontSize: 17, color: "#bbb", marginTop: 10, lineHeight: 1.6 }}>{body}</div>
        )}
      </div>
    </div>
  );
};

// Big animated stat (number + caption)
const StatCard: React.FC<{ stat: string; caption: string; accent?: string }> = ({ stat, caption, accent = "#fff" }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scale = spring({ frame: frame - 4, fps, config: { damping: 90, stiffness: 260 } });
  const sub   = spring({ frame: frame - 18, fps, config: { damping: 120, stiffness: 180 } });
  const fadeOut = interpolate(frame, [durationInFrames - 28, durationInFrames - 6], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{
      position: "absolute", top: 90, left: 30, right: 30,
      opacity: fadeOut, zIndex: 60,
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{
        backgroundColor: "rgba(8,8,8,0.82)",
        backdropFilter: "blur(14px)",
        borderRadius: 14,
        padding: "22px 28px",
        textAlign: "center",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        border: `1px solid ${accent}22`,
        width: "100%",
      }}>
        <div style={{
          fontFamily: HEAD, fontWeight: 900, fontSize: 72, color: accent,
          lineHeight: 1, transform: `scale(${scale})`,
          textShadow: `0 0 60px ${accent}55`,
        }}>{stat}</div>
        <div style={{
          fontFamily: BODY, fontWeight: 400, fontSize: 18, color: "#bbb",
          marginTop: 12, lineHeight: 1.5, transform: `scale(${sub})`,
        }}>{caption}</div>
      </div>
    </div>
  );
};

// Animated staggered bullet list
const BulletList: React.FC<{ items: string[]; accent?: string; pos?: "top" | "bottom" }> = ({
  items, accent = "#fff", pos = "bottom",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const fadeOut = interpolate(frame, [durationInFrames - 28, durationInFrames - 6], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const placement = pos === "top" ? { top: 90 } : { bottom: 170 };
  return (
    <div style={{
      position: "absolute", left: 30, right: 30, ...placement,
      opacity: fadeOut, zIndex: 60,
    }}>
      <div style={{
        backgroundColor: "rgba(8,8,8,0.82)",
        backdropFilter: "blur(14px)",
        borderRadius: 14,
        padding: "18px 22px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      }}>
        {items.map((item, i) => {
          const lf = Math.max(0, frame - i * 22);
          const slide = spring({ frame: lf, fps, config: { damping: 120, stiffness: 180 } });
          const x = interpolate(slide, [0, 1], [-220, 0]);
          const op = interpolate(lf, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              transform: `translateX(${x}px)`, opacity: op,
              marginBottom: i < items.length - 1 ? 14 : 0,
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                backgroundColor: accent, flexShrink: 0, marginTop: 2,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: HEAD, fontWeight: 900, fontSize: 13, color: "#000",
              }}>{i + 1}</div>
              <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 18, color: "#fff", lineHeight: 1.45 }}>{item}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Thin progress bar at the very bottom showing clip progress
const ProgressBar: React.FC<{ accent?: string }> = ({ accent = "#fff" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const w = interpolate(frame, [0, durationInFrames], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: "rgba(255,255,255,0.1)", zIndex: 90 }}>
      <div style={{ width: `${w}%`, height: "100%", backgroundColor: accent, transition: "none" }} />
    </div>
  );
};

// Speaker section title (flashes at start of each speaker turn)
const SectionTitle: React.FC<{ number: number; name: string; topic: string; accent: string }> = ({
  number, name, topic, accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = interpolate(frame, [0, 18, 55, 72], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = spring({ frame: frame - 6, fps, config: { damping: 110, stiffness: 200 } });
  const sub   = spring({ frame: frame - 18, fps, config: { damping: 110, stiffness: 200 } });
  return (
    <AbsoluteFill style={{
      backgroundColor: `rgba(8,8,8,${bg * 0.92})`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 14, zIndex: 120,
    }}>
      <div style={{
        fontFamily: BODY, fontSize: 13, fontWeight: 700, color: accent,
        letterSpacing: 5, textTransform: "uppercase",
        transform: `scale(${scale})`,
      }}>Speaker {number}</div>
      <div style={{
        fontFamily: HEAD, fontWeight: 900, fontSize: 64, color: "#fff",
        textAlign: "center", lineHeight: 1.15,
        transform: `scale(${scale})`,
      }}>{name}</div>
      <div style={{
        fontFamily: BODY, fontWeight: 400, fontSize: 20, color: "#888",
        textAlign: "center", letterSpacing: 1,
        transform: `scale(${sub})`,
      }}>{topic}</div>
      <div style={{
        width: 60, height: 3, backgroundColor: accent, borderRadius: 2,
        transform: `scale(${sub})`,
      }} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// INTRO
// ═══════════════════════════════════════════════════════════════════════════
const IntroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l1 = spring({ frame: frame - 6,  fps, config: { damping: 130, stiffness: 150 } });
  const l2 = spring({ frame: frame - 20, fps, config: { damping: 130, stiffness: 150 } });
  const l3 = spring({ frame: frame - 36, fps, config: { damping: 130, stiffness: 150 } });
  return (
    <AbsoluteFill style={{
      backgroundColor: "#060606", opacity: bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 18,
    }}>
      <div style={{
        fontFamily: BODY, fontSize: 13, fontWeight: 700, color: "#555",
        letterSpacing: 5, textTransform: "uppercase",
        transform: `scale(${l1})`,
      }}>Media Literacy Project</div>
      <div style={{
        fontFamily: HEAD, fontWeight: 900, fontSize: 72, color: "#fff",
        textAlign: "center", lineHeight: 1.15, padding: "0 50px",
        transform: `scale(${l2})`,
      }}>Clickbait &amp; How It Works</div>
      <div style={{
        fontFamily: BODY, fontWeight: 400, fontSize: 22, color: "#666",
        textAlign: "center", letterSpacing: 1,
        transform: `scale(${l3})`,
      }}>A group discussion on media manipulation</div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// GINDY SEGMENT — "What is clickbait & how it spreads"
// ═══════════════════════════════════════════════════════════════════════════
const GindySegment: React.FC = () => (
  <AbsoluteFill>
    <CleanClip src={V.gindy} fadeIn />
    <Vignette />

    {/* Speaker card intro flash (first 2.5s) */}
    <Sequence from={0} durationInFrames={75}>
      <SectionTitle number={1} name="Gindy" topic="Introducing Clickbait" accent={ACCENT.gindy} />
    </Sequence>

    {/* Name tag slides in at frame 80 */}
    <Sequence from={80} durationInFrames={220}>
      <NameTag name="Gindy" role="Media Literacy Discussion" accent={ACCENT.gindy} />
    </Sequence>

    {/* Card 1 — Definition (frames 120–420, 10s) */}
    <Sequence from={120} durationInFrames={300}>
      <InfoCard
        pos="top"
        accent={ACCENT.gindy}
        label="Definition"
        title="What is Clickbait?"
        body="Content crafted to trigger curiosity or emotion — pulling you in with a headline that over-promises what the article actually delivers."
      />
    </Sequence>

    {/* Card 2 — Stat: sharing without reading (frames 500–830) */}
    <Sequence from={500} durationInFrames={330}>
      <StatCard
        stat="59%"
        caption="of links shared on social media are never actually read — only the headline is seen."
        accent={ACCENT.gindy}
      />
    </Sequence>

    {/* Card 3 — The curiosity gap (frames 920–1250) */}
    <Sequence from={920} durationInFrames={330}>
      <InfoCard
        pos="top"
        accent={ACCENT.gindy}
        label="Psychological trigger"
        title="The Curiosity Gap"
        body="Clickbait headlines reveal just enough to create a 'gap' in your knowledge — your brain can't resist filling it by clicking."
      />
    </Sequence>

    {/* Card 4 — Emotional words stat (frames 1350–1680) */}
    <Sequence from={1350} durationInFrames={330}>
      <StatCard
        stat="2×"
        caption="more engagement — headlines with emotional words outperform neutral ones by double on social platforms."
        accent={ACCENT.gindy}
      />
    </Sequence>

    {/* Card 5 — Real example callout (frames 1780–2100) */}
    <Sequence from={1780} durationInFrames={320}>
      <InfoCard
        pos="bottom"
        accent={ACCENT.gindy}
        label="Real Example"
        title='"Doctors HATE This One Weird Trick!"'
        body="Fake urgency + vague promise + authority challenge = classic clickbait formula. The 'article' rarely matches the headline."
      />
    </Sequence>

    {/* Card 6 — Why platforms allow it (frames 2170–2350) */}
    <Sequence from={2170} durationInFrames={190}>
      <InfoCard
        pos="top"
        accent={ACCENT.gindy}
        label="The business model"
        title="Your attention is the product"
        body="Every click generates ad revenue — platforms and publishers are financially incentivised to keep clickbait alive."
      />
    </Sequence>

    <ProgressBar accent={ACCENT.gindy} />
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════
// ABDULLAH SEGMENT — "Why we fall for it — the psychology"
// ═══════════════════════════════════════════════════════════════════════════
const AbdullahSegment: React.FC = () => (
  <AbsoluteFill>
    <CleanClip src={V.abdullah} fadeIn />
    <Vignette />

    {/* Speaker intro flash */}
    <Sequence from={0} durationInFrames={75}>
      <SectionTitle number={2} name="Abdullah" topic="The Psychology Behind Clickbait" accent={ACCENT.abdullah} />
    </Sequence>

    <Sequence from={80} durationInFrames={220}>
      <NameTag name="Abdullah" role="Media Literacy Discussion" accent={ACCENT.abdullah} />
    </Sequence>

    {/* Card 1 — Why we click (frames 120–440) */}
    <Sequence from={120} durationInFrames={320}>
      <InfoCard
        pos="top"
        accent={ACCENT.abdullah}
        label="Brain science"
        title="Why We Can't Ignore It"
        body="Clickbait exploits FOMO (Fear Of Missing Out). Our brains are wired to scan for threats and surprises — sensational headlines hijack that reflex."
      />
    </Sequence>

    {/* Card 2 — Dopamine stat (frames 520–840) */}
    <Sequence from={520} durationInFrames={320}>
      <StatCard
        stat="FOMO"
        caption="triggers a dopamine response — the same neurochemical reward loop that makes social media addictive."
        accent={ACCENT.abdullah}
      />
    </Sequence>

    {/* Card 3 — Common tactics checklist (frames 880–1020) */}
    <Sequence from={880} durationInFrames={140}>
      <BulletList
        accent={ACCENT.abdullah}
        pos="bottom"
        items={[
          "ALL CAPS and excessive punctuation!!!",
          '"You won\'t BELIEVE..." phrasing',
          "Vague promises that hide the answer",
          "Fake urgency: 'Before It\'s Deleted!'",
        ]}
      />
    </Sequence>

    <ProgressBar accent={ACCENT.abdullah} />
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════
// MALKY SEGMENT — "How to spot misleading content"
// ═══════════════════════════════════════════════════════════════════════════
const MalkySegment: React.FC = () => (
  <AbsoluteFill>
    <CleanClip src={V.malky} fadeIn />
    <Vignette />

    <Sequence from={0} durationInFrames={75}>
      <SectionTitle number={3} name="Malky" topic="Spotting Misleading Content" accent={ACCENT.malky} />
    </Sequence>

    <Sequence from={80} durationInFrames={200}>
      <NameTag name="Malky" role="Media Literacy Discussion" accent={ACCENT.malky} />
    </Sequence>

    {/* Card 1 — Red flags (frames 90–230) */}
    <Sequence from={90} durationInFrames={140}>
      <InfoCard
        pos="top"
        accent={ACCENT.malky}
        label="Watch out for"
        title="Red Flags in Headlines"
        body="Shock words · Blurry thumbnail images · Unnamed 'experts' · No author credited · URL doesn't match the headline topic."
      />
    </Sequence>

    {/* Card 2 — Tip list (frames 230–370) */}
    <Sequence from={230} durationInFrames={145}>
      <BulletList
        accent={ACCENT.malky}
        pos="bottom"
        items={[
          "Read beyond the headline before sharing",
          "Check: does the image match the story?",
          "Search the claim on a fact-check site",
        ]}
      />
    </Sequence>

    <ProgressBar accent={ACCENT.malky} />
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════
// YEHIA SEGMENT — "Media literacy & what we can do"
// ═══════════════════════════════════════════════════════════════════════════
const YehiaSegment: React.FC = () => (
  <AbsoluteFill>
    <CleanClip src={V.yehia} fadeIn />
    <Vignette strength={0.4} />

    <Sequence from={0} durationInFrames={75}>
      <SectionTitle number={4} name="Yehia" topic="Media Literacy & Solutions" accent={ACCENT.yehia} />
    </Sequence>

    <Sequence from={80} durationInFrames={220}>
      <NameTag name="Yehia" role="Media Literacy Discussion" accent={ACCENT.yehia} />
    </Sequence>

    {/* Card 1 — Media literacy definition (frames 100–310) */}
    <Sequence from={100} durationInFrames={210}>
      <InfoCard
        pos="top"
        accent={ACCENT.yehia}
        label="Media Literacy"
        title="Your Best Defense"
        body="The ability to access, analyze, evaluate, and create media — it lets you see through manipulation and consume content critically."
      />
    </Sequence>

    {/* Card 2 — Practical checklist (frames 320–545) */}
    <Sequence from={320} durationInFrames={240}>
      <BulletList
        accent={ACCENT.yehia}
        pos="bottom"
        items={[
          "Pause before you click — ask: what do I expect to find?",
          "Cross-check with a trusted source",
          "Think before sharing — you spread what you engage with",
        ]}
      />
    </Sequence>

    <ProgressBar accent={ACCENT.yehia} />
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════
// OUTRO
// ═══════════════════════════════════════════════════════════════════════════
const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l1 = spring({ frame: frame - 6,  fps, config: { damping: 130, stiffness: 150 } });
  const l2 = spring({ frame: frame - 22, fps, config: { damping: 130, stiffness: 150 } });
  const l3 = spring({ frame: frame - 40, fps, config: { damping: 130, stiffness: 150 } });
  return (
    <AbsoluteFill style={{
      backgroundColor: "#060606", opacity: bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 18,
    }}>
      <div style={{
        fontFamily: HEAD, fontWeight: 900, fontSize: 80, color: "#fff",
        textAlign: "center", lineHeight: 1.1,
        transform: `scale(${l1})`,
      }}>Think Before{"\n"}You Click.</div>
      <div style={{
        width: 50, height: 3, backgroundColor: "#444", borderRadius: 2,
        transform: `scale(${l2})`,
      }} />
      <div style={{
        fontFamily: BODY, fontWeight: 400, fontSize: 20, color: "#555",
        textAlign: "center", letterSpacing: 2, textTransform: "uppercase",
        transform: `scale(${l3})`,
      }}>Media Literacy Matters</div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOT COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════
export const ClickbaitVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#060606" }}>
    <Sequence from={0}         durationInFrames={INTRO_DUR}>    <IntroCard />       </Sequence>
    <Sequence from={G_START}   durationInFrames={GINDY_DUR}>    <GindySegment />    </Sequence>
    <Sequence from={A_START}   durationInFrames={ABDULLAH_DUR}> <AbdullahSegment /> </Sequence>
    <Sequence from={M_START}   durationInFrames={MALKY_DUR}>    <MalkySegment />    </Sequence>
    <Sequence from={Y_START}   durationInFrames={YEHIA_DUR}>    <YehiaSegment />    </Sequence>
    <Sequence from={OUT_START} durationInFrames={OUTRO_DUR}>    <OutroCard />       </Sequence>
  </AbsoluteFill>
);
