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

// ── File mapping (by file-size → script length match) ───────────────────────
const VIDEOS = {
  abdullah: "WhatsApp Video 2026-05-01 at 9.04.03 AM.mp4",
  gindy:    "WhatsApp Video 2026-05-01 at 9.04.08 AM.mp4",
  malky:    "WhatsApp Video 2026-05-01 at 9.04.08 AM (1).mp4",
  yehia:    "WhatsApp Video 2026-05-01 at 9.04.09 AM.mp4",
};

const C = {
  red:    "#FF3B3B",
  green:  "#00E5A0",
  yellow: "#FFD700",
  blue:   "#4DAAFF",
};

// ── Segment durations ────────────────────────────────────────────────────────
const A_DUR = 750;   // Abdullah  0:00–0:25
const G_DUR = 750;   // Gindy     0:25–0:50
const M_DUR = 600;   // Malky     0:50–1:10
const Y_DUR = 600;   // Yehia     1:10–1:30
const CTA_DUR = 240; // outro     1:30–1:38

// ═══════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const LowerThird: React.FC<{ name: string; accent: string }> = ({ name, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame, fps, config: { damping: 120, stiffness: 180 } });
  const x = interpolate(slide, [0, 1], [-320, 0]);

  return (
    <div style={{ position: "absolute", bottom: 120, left: 80, transform: `translateX(${x}px)`, zIndex: 55 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 5, height: "100%", backgroundColor: accent, borderRadius: 3 }} />
      <div style={{
        paddingLeft: 20,
        fontFamily: "'Arial Black', sans-serif",
        fontWeight: 900,
        fontSize: 38,
        color: "#fff",
        textTransform: "uppercase",
        letterSpacing: 4,
        textShadow: "0 2px 16px rgba(0,0,0,0.9)",
      }}>{name}</div>
      <div style={{
        paddingLeft: 20,
        fontFamily: "Arial, sans-serif",
        fontSize: 18,
        color: accent,
        letterSpacing: 3,
        textTransform: "uppercase",
      }}>Presenter</div>
    </div>
  );
};

const Caption: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, dur - 10, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{
      position: "absolute",
      bottom: 52,
      left: 0, right: 0,
      display: "flex",
      justifyContent: "center",
      opacity,
      zIndex: 65,
      padding: "0 80px",
    }}>
      <div style={{
        backgroundColor: "rgba(0,0,0,0.82)",
        borderRadius: 8,
        padding: "14px 32px",
        fontFamily: "Arial, sans-serif",
        fontWeight: 700,
        fontSize: 34,
        color: "#fff",
        textAlign: "center",
        maxWidth: 1300,
        lineHeight: 1.35,
      }}>{text}</div>
    </div>
  );
};

type CaptionEntry = { from: number; dur: number; text: string };

const CaptionTrack: React.FC<{ captions: CaptionEntry[] }> = ({ captions }) => (
  <>
    {captions.map(({ from, dur, text }, i) => (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <Caption text={text} dur={dur} />
      </Sequence>
    ))}
  </>
);

const KineticText: React.FC<{
  text: string;
  color?: string;
  size?: number;
  from?: "left" | "right" | "bottom";
}> = ({ text, color = C.yellow, size = 110, from = "right" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 75, stiffness: 350 } });
  const offset = interpolate(p, [0, 1], [500, 0]);
  const transform =
    from === "right" ? `translateX(${offset}px)`
    : from === "left" ? `translateX(${-offset}px)`
    : `translateY(${offset}px)`;

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 75, pointerEvents: "none" }}>
      <div style={{
        fontFamily: "'Arial Black', Impact, sans-serif",
        fontWeight: 900,
        fontSize: size,
        color,
        textTransform: "uppercase",
        letterSpacing: 8,
        transform,
        textShadow: `0 0 50px ${color}66, 0 4px 24px rgba(0,0,0,0.95)`,
        WebkitTextStroke: `2px ${color}`,
      }}>{text}</div>
    </AbsoluteFill>
  );
};

const SocialPost: React.FC<{ headline: string; sub?: string }> = ({ headline, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame, fps, config: { damping: 120, stiffness: 200 } });
  const y = interpolate(slide, [0, 1], [220, 0]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      bottom: 170,
      right: 70,
      width: 490,
      transform: `translateY(${y}px)`,
      opacity,
      zIndex: 80,
    }}>
      <div style={{
        backgroundColor: "#141414",
        borderRadius: 18,
        border: `2.5px solid ${C.red}`,
        overflow: "hidden",
        boxShadow: `0 24px 70px rgba(0,0,0,0.85), 0 0 40px ${C.red}33`,
      }}>
        <div style={{
          backgroundColor: "#1e0808",
          padding: "13px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: `1px solid ${C.red}33`,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#6b0000", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>ViralNews247</div>
            <div style={{ fontSize: 12, color: "#777" }}>Sponsored · 2h ago</div>
          </div>
        </div>
        <div style={{ padding: "18px 18px 14px" }}>
          <div style={{ fontWeight: 800, fontSize: 19, color: "#FF7070", lineHeight: 1.4, marginBottom: 12 }}>{headline}</div>
          {sub && <div style={{ fontSize: 14, color: "#555", fontStyle: "italic" }}>{sub}</div>}
          <div style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid #222",
            display: "flex",
            gap: 18,
            fontSize: 13,
            color: "#444",
          }}>
            <span>👍 24.3K</span>
            <span>💬 3.1K</span>
            <span>↗ Share</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stamp: React.FC<{ text: string; color?: string; lx?: string; ly?: string; rot?: number }> = ({
  text, color = C.red, lx = "50%", ly = "30%", rot = -12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 55, stiffness: 500 } });

  return (
    <div style={{
      position: "absolute",
      left: lx, top: ly,
      transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
      border: `6px solid ${color}`,
      borderRadius: 6,
      padding: "8px 22px",
      fontFamily: "'Arial Black', sans-serif",
      fontWeight: 900,
      fontSize: 48,
      color,
      textTransform: "uppercase",
      letterSpacing: 5,
      opacity: 0.9,
      zIndex: 90,
      textShadow: `0 0 24px ${color}`,
      boxShadow: `inset 0 0 20px ${color}22`,
      pointerEvents: "none",
    }}>{text}</div>
  );
};

const GlitchOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const active = frame % 18 < 3;
  if (!active) return null;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,0,0,0.07)", transform: "translateX(9px)", mixBlendMode: "screen", zIndex: 18, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,255,255,0.07)", transform: "translateX(-9px)", mixBlendMode: "screen", zIndex: 18, pointerEvents: "none" }} />
    </>
  );
};

const FakeHeadlineCard: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 100, stiffness: 280 } });
  return (
    <div style={{
      fontFamily: "'Arial Black', sans-serif",
      fontWeight: 900,
      fontSize: 28,
      color: "#FF8080",
      textAlign: "center",
      padding: "18px 28px",
      backgroundColor: "#160000",
      border: `2px solid ${C.red}55`,
      borderRadius: 12,
      transform: `scale(${scale})`,
      boxShadow: `0 8px 40px rgba(0,0,0,0.8), 0 0 20px ${C.red}22`,
    }}>{text}</div>
  );
};

const TimeWastedCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const seconds = Math.floor(interpolate(frame, [0, 90], [0, 47], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 170, right: 70, opacity, zIndex: 75, textAlign: "center" }}>
      <div style={{ fontFamily: "Arial, sans-serif", fontSize: 15, color: "#666", letterSpacing: 5, textTransform: "uppercase", marginBottom: 8 }}>Time Wasted</div>
      <div style={{
        fontFamily: "'Arial Black', sans-serif",
        fontWeight: 900,
        fontSize: 70,
        color: C.red,
        textShadow: `0 0 40px ${C.red}99`,
        fontVariantNumeric: "tabular-nums",
      }}>00:{seconds.toString().padStart(2, "0")}</div>
    </div>
  );
};

const ChecklistItem: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);
  const slide = spring({ frame: localFrame, fps, config: { damping: 120, stiffness: 180 } });
  const x = interpolate(slide, [0, 1], [-250, 0]);
  const opacity = interpolate(localFrame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      transform: `translateX(${x}px)`,
      opacity,
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "16px 26px",
      backgroundColor: `${C.green}11`,
      border: `1.5px solid ${C.green}44`,
      borderRadius: 14,
      marginBottom: 18,
    }}>
      <div style={{
        width: 38, height: 38,
        borderRadius: "50%",
        backgroundColor: C.green,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        fontWeight: 900, fontSize: 20, color: "#000",
      }}>✓</div>
      <div style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 27, color: "#fff", lineHeight: 1.3 }}>{text}</div>
    </div>
  );
};

const Checklist: React.FC = () => (
  <div style={{ position: "absolute", right: 70, top: "50%", transform: "translateY(-50%)", width: 600, zIndex: 70 }}>
    {[
      "Is this source reliable?",
      "Does the content match the title?",
      "Think before you click.",
    ].map((item, i) => (
      <ChecklistItem key={i} text={item} delay={i * 28} />
    ))}
  </div>
);

const VerifiedBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 100, stiffness: 220 } });
  return (
    <div style={{
      position: "absolute", top: 80, right: 80,
      transform: `scale(${scale})`,
      zIndex: 88,
      display: "flex", alignItems: "center", gap: 12,
      backgroundColor: `${C.green}18`,
      border: `2px solid ${C.green}`,
      borderRadius: 50,
      padding: "10px 26px",
    }}>
      <span style={{ fontSize: 26, color: C.green }}>✓</span>
      <span style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 22, color: C.green, letterSpacing: 3 }}>VERIFIED</span>
    </div>
  );
};

const Vignette: React.FC = () => (
  <div style={{
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
    zIndex: 8, pointerEvents: "none",
  }} />
);

// ═══════════════════════════════════════════════════════════════════════════
// SPEAKER SEGMENTS
// ═══════════════════════════════════════════════════════════════════════════

const AbdullahSegment: React.FC = () => {
  const captions: CaptionEntry[] = [
    { from: 30,  dur: 70,  text: '"Have you ever seen a title like…"' },
    { from: 100, dur: 75,  text: '"You won\'t believe what happened next!"' },
    { from: 175, dur: 65,  text: "That's called clickbait." },
    { from: 245, dur: 120, text: "Designed to grab your attention and make you click," },
    { from: 370, dur: 105, text: "even if the content isn't true or is exaggerated." },
    { from: 480, dur: 58,  text: "For example, I see a post that says:" },
    { from: 545, dur: 115, text: '"Eating chocolate every day makes you lose weight instantly!"' },
    { from: 665, dur: 85,  text: "It sounds amazing, so I click it." },
  ];

  return (
    <AbsoluteFill>
      <Video
        src={staticFile(VIDEOS.abdullah)}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          filter: "brightness(0.86) contrast(1.22) saturate(1.28)",
        }}
      />
      {/* warm red tension tint */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(160,30,0,0.14) 0%, transparent 55%)", zIndex: 6, pointerEvents: "none" }} />
      <Vignette />

      {/* CLICKBAIT slams in */}
      <Sequence from={92} durationInFrames={78}>
        <KineticText text="CLICKBAIT" color={C.yellow} size={115} from="right" />
      </Sequence>

      {/* Social media post */}
      <Sequence from={205} durationInFrames={545}>
        <SocialPost
          headline='Eating chocolate every day makes you lose weight INSTANTLY! 🍫🔥'
          sub="Doctors DON'T want you to know this secret…"
        />
      </Sequence>

      {/* Lower third */}
      <Sequence from={18} durationInFrames={210}>
        <LowerThird name="Abdullah" accent={C.yellow} />
      </Sequence>

      <CaptionTrack captions={captions} />
    </AbsoluteFill>
  );
};

const SplitScreenOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity, zIndex: 30 }}>
      {/* left – clickbait / red */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "49%",
        backgroundColor: "rgba(90,0,0,0.72)",
        backdropFilter: "blur(3px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 44, gap: 18,
        borderRight: `3px solid ${C.red}`,
      }}>
        <div style={{ fontSize: 17, color: C.red, fontWeight: 800, textTransform: "uppercase", letterSpacing: 5 }}>Title Says:</div>
        <div style={{ fontSize: 22, color: "#FF9999", fontWeight: 700, textAlign: "center", lineHeight: 1.45 }}>
          "Eating chocolate every day makes you lose weight INSTANTLY!"
        </div>
      </div>

      {/* VS badge */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#fff", borderRadius: "50%",
        width: 62, height: 62,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 20, color: "#000",
        zIndex: 38,
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
      }}>VS</div>

      {/* right – truth / blue */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "49%",
        backgroundColor: "rgba(0,30,90,0.72)",
        backdropFilter: "blur(3px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 44, gap: 18,
        borderLeft: `3px solid ${C.blue}`,
      }}>
        <div style={{ fontSize: 17, color: C.blue, fontWeight: 800, textTransform: "uppercase", letterSpacing: 5 }}>Article Says:</div>
        <div style={{ fontSize: 22, color: "#AADDFF", fontWeight: 700, textAlign: "center", lineHeight: 1.45 }}>
          "Chocolate can be part of a balanced diet."
        </div>
      </div>
    </AbsoluteFill>
  );
};

const GindySegment: React.FC = () => {
  const captions: CaptionEntry[] = [
    { from: 20,  dur: 80,  text: "But when I open the article, it's not what I expected." },
    { from: 110, dur: 90,  text: '"Chocolate can be part of a balanced diet,"' },
    { from: 210, dur: 110, text: "which is very different from losing weight instantly." },
    { from: 330, dur: 130, text: "Clickbait often exaggerates or twists information" },
    { from: 470, dur: 100, text: "just to get more views." },
  ];

  return (
    <AbsoluteFill>
      <Video
        src={staticFile(VIDEOS.gindy)}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          filter: "brightness(0.85) contrast(1.12) saturate(0.88)",
        }}
      />
      <Vignette />

      {/* Split screen appears at frame 115 */}
      <Sequence from={115} durationInFrames={635}>
        <SplitScreenOverlay />
      </Sequence>

      {/* EXAGGERATED stamp at frame 245 */}
      <Sequence from={245} durationInFrames={505}>
        <Stamp text="EXAGGERATED" color={C.red} lx="25%" ly="78%" rot={-10} />
      </Sequence>

      {/* Lower third */}
      <Sequence from={18} durationInFrames={210}>
        <LowerThird name="Gindy" accent={C.red} />
      </Sequence>

      <CaptionTrack captions={captions} />
    </AbsoluteFill>
  );
};

const FAKE_HEADLINES = [
  "SHARK FOUND LIVING IN CITY SUBWAY! 🦈",
  "Man Discovers Secret to STOP AGING Forever!",
  "Scientists CONFIRM: Moon Is Artificial! 🌙",
];

const MalkySegment: React.FC = () => {
  const captions: CaptionEntry[] = [
    { from: 20,  dur: 75,  text: "Sometimes it's even worse." },
    { from: 100, dur: 85,  text: "The title can be completely misleading," },
    { from: 195, dur: 75,  text: "just to make you curious." },
    { from: 278, dur: 110, text: "You click, but the content doesn't match at all." },
    { from: 400, dur: 110, text: "It wastes your time and spreads confusion." },
  ];

  return (
    <AbsoluteFill>
      <Video
        src={staticFile(VIDEOS.malky)}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          filter: "brightness(0.80) contrast(1.12) saturate(0.48)",
        }}
      />
      {/* teal shadow cast */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,40,50,0.35) 100%)", zIndex: 6, pointerEvents: "none" }} />
      <Vignette />
      <GlitchOverlay />

      {/* Fake headlines – one at a time */}
      {FAKE_HEADLINES.map((h, i) => (
        <Sequence key={i} from={100 + i * 58} durationInFrames={52}>
          <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 80px", zIndex: 60 }}>
            <div style={{ width: 680 }}>
              <FakeHeadlineCard text={h} />
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* MISLEADING stamps matching each headline */}
      {[0, 1, 2].map((i) => (
        <Sequence key={i} from={108 + i * 58} durationInFrames={44}>
          <Stamp text="MISLEADING" color={C.red} lx="72%" ly="38%" rot={-9} />
        </Sequence>
      ))}

      {/* Time wasted counter */}
      <Sequence from={408} durationInFrames={192}>
        <TimeWastedCounter />
      </Sequence>

      {/* Lower third */}
      <Sequence from={18} durationInFrames={210}>
        <LowerThird name="Malky" accent="#FF6B35" />
      </Sequence>

      <CaptionTrack captions={captions} />
    </AbsoluteFill>
  );
};

const YehiaSegment: React.FC = () => {
  const captions: CaptionEntry[] = [
    { from: 20,  dur: 100, text: "That's why media literacy is important." },
    { from: 130, dur: 95,  text: "Before clicking or sharing, ask yourself:" },
    { from: 235, dur: 90,  text: "Is this source reliable?" },
    { from: 335, dur: 90,  text: "Does the content match the title?" },
    { from: 435, dur: 80,  text: "Don't let clickbait trick you." },
    { from: 520, dur: 80,  text: "Think before you click." },
  ];

  return (
    <AbsoluteFill>
      <Video
        src={staticFile(VIDEOS.yehia)}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          filter: "brightness(1.06) contrast(1.02) saturate(1.12)",
        }}
      />
      <Vignette />

      {/* Checklist */}
      <Sequence from={225} durationInFrames={375}>
        <Checklist />
      </Sequence>

      {/* Verified badge */}
      <Sequence from={410} durationInFrames={190}>
        <VerifiedBadge />
      </Sequence>

      {/* Lower third */}
      <Sequence from={18} durationInFrames={210}>
        <LowerThird name="Yehia" accent={C.green} />
      </Sequence>

      <CaptionTrack captions={captions} />
    </AbsoluteFill>
  );
};

// ── Final CTA ────────────────────────────────────────────────────────────────
const FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l1 = spring({ frame: frame - 18, fps, config: { damping: 120, stiffness: 200 } });
  const l2 = spring({ frame: frame - 34, fps, config: { damping: 120, stiffness: 200 } });
  const l3 = spring({ frame: frame - 60, fps, config: { damping: 120, stiffness: 200 } });

  return (
    <AbsoluteFill style={{
      backgroundColor: "#000",
      opacity: bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
    }}>
      <div style={{
        fontFamily: "'Arial Black', sans-serif",
        fontWeight: 900,
        fontSize: 108,
        color: C.yellow,
        textTransform: "uppercase",
        letterSpacing: 6,
        transform: `scale(${l1})`,
        textShadow: `0 0 70px ${C.yellow}44`,
        textAlign: "center",
      }}>THINK BEFORE</div>
      <div style={{
        fontFamily: "'Arial Black', sans-serif",
        fontWeight: 900,
        fontSize: 108,
        color: C.yellow,
        textTransform: "uppercase",
        letterSpacing: 6,
        transform: `scale(${l2})`,
        textShadow: `0 0 70px ${C.yellow}44`,
      }}>YOU CLICK.</div>
      <div style={{
        fontFamily: "Arial, sans-serif",
        fontWeight: 400,
        fontSize: 28,
        color: "#444",
        textTransform: "uppercase",
        letterSpacing: 10,
        transform: `scale(${l3})`,
        marginTop: 16,
      }}>Don't believe everything you see.</div>
    </AbsoluteFill>
  );
};

// ── Flash cut transition ──────────────────────────────────────────────────────
const FlashCut: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 6, 16], [0.85, 0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", inset: 0, backgroundColor: "#fff", opacity, zIndex: 300, pointerEvents: "none" }} />;
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOT COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════

export const ClickbaitVideo: React.FC = () => {
  const CUTS = [A_DUR, A_DUR + G_DUR, A_DUR + G_DUR + M_DUR];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence from={0}                              durationInFrames={A_DUR}>         <AbdullahSegment /> </Sequence>
      <Sequence from={A_DUR}                          durationInFrames={G_DUR}>         <GindySegment />    </Sequence>
      <Sequence from={A_DUR + G_DUR}                  durationInFrames={M_DUR}>         <MalkySegment />    </Sequence>
      <Sequence from={A_DUR + G_DUR + M_DUR}          durationInFrames={Y_DUR}>         <YehiaSegment />    </Sequence>
      <Sequence from={A_DUR + G_DUR + M_DUR + Y_DUR}  durationInFrames={CTA_DUR}>       <FinalCTA />        </Sequence>

      {/* Flash cuts between speakers */}
      {CUTS.map((cut, i) => (
        <Sequence key={i} from={cut - 4} durationInFrames={20}>
          <FlashCut />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
