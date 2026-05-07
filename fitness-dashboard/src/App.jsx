import { useState, useEffect } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#080810',
  surface: '#0e0e1a',
  surfaceHigh: '#141425',
  border: '#1e1e30',
  borderHigh: '#2a2a3f',
  accent: '#6366f1',        // indigo
  accentGlow: 'rgba(99,102,241,0.15)',
  orange: '#f97316',
  orangeGlow: 'rgba(249,115,22,0.15)',
  green: '#22c55e',
  greenGlow: 'rgba(34,197,94,0.12)',
  pink: '#ec4899',
  pinkGlow: 'rgba(236,72,153,0.12)',
  text: '#f1f5f9',
  muted: '#64748b',
  dim: '#334155',
}

const s = {
  label: { fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13,
    background: C.surface, border: `1px solid ${C.border}`, color: C.text,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
    background: C.surface, border: `1px solid ${C.border}`, color: C.text,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
    lineHeight: 1.65, resize: 'vertical',
  },
  btn: (color = C.accent) => ({
    padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', background: color, color: '#fff',
    display: 'flex', alignItems: 'center', gap: 8,
  }),
  btnGhost: {
    padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
    cursor: 'pointer', border: `1px solid ${C.border}`,
    background: C.surface, color: C.muted,
  },
  card: {
    padding: 20, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`,
  },
  section: { fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: '-0.3px' },
  sub: { fontSize: 13, color: C.muted, lineHeight: 1.6 },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const WEEK_SCHEDULE = [
  {
    day: 'Monday', date: null, time: '7:00 AM', type: 'REEL',
    color: C.orange, typeIcon: '🎬',
    topic: 'Workout Reel — Push day / Chest & Shoulders',
    hook: '"I trained chest every day for 30 days. Here\'s what happened."',
    format: '30 seconds · vertical · trending audio · text overlay hook',
    goal: 'REACH — this is your biggest reach day of the week',
    tips: ['Film 6-8 clips, pick the best 4', 'Add text overlay in first 2 seconds', 'Use a trending sound from Reels audio tab'],
  },
  {
    day: 'Tuesday', date: null, time: '12:00 PM', type: 'CAROUSEL',
    color: C.accent, typeIcon: '📊',
    topic: 'Nutrition Carousel — What I Eat in a Day',
    hook: '"I eat this every day to stay lean. Full breakdown:"',
    format: '7-10 slides · first slide = bold hook text · last slide = save this',
    goal: 'SAVES — carousels get saved and re-read, telling the algorithm people love your content',
    tips: ['Slide 1: Big bold hook statement', 'Slides 2-7: Each meal with photo + macros', 'Last slide: "Save this for your next grocery run"'],
  },
  {
    day: 'Wednesday', date: null, time: '7:00 AM', type: 'REEL',
    color: C.orange, typeIcon: '🎬',
    topic: 'Progress Reel — Transformation or Week Recap',
    hook: '"6 months ago I couldn\'t do this. Now watch:"',
    format: '15-30 seconds · before/after or progress clips · emotional music',
    goal: 'TRUST — people follow journeys, not perfection',
    tips: ['Even small progress counts', 'Your transformation IS the content', 'Add current stats as text: weight, lifts, months in'],
  },
  {
    day: 'Thursday', date: null, time: '12:00 PM', type: 'CAROUSEL',
    color: C.accent, typeIcon: '📊',
    topic: 'Education Carousel — Myths / Tips / Mistakes',
    hook: '"5 things you\'re doing in the gym that are wasting your time:"',
    format: '7-10 slides · numbered list format · clean design',
    goal: 'SHARES + SAVES — educational content gets shared to friends',
    tips: ['Pick a myth everyone believes', 'Use bold text, minimal words per slide', 'CTA: "Share this with your gym partner"'],
  },
  {
    day: 'Friday', date: null, time: '7:00 AM', type: 'REEL',
    color: C.orange, typeIcon: '🎬',
    topic: 'Motivation Reel — Weekend Hype or Gym Lifestyle',
    hook: '"Everyone else is sleeping. You\'re here. That\'s the difference."',
    format: '15-30 seconds · hype music · fast cuts · lifestyle shots',
    goal: 'FOLLOWERS — motivation content gets followed on Fridays',
    tips: ['Film gym arrival, warming up, working hard', 'Fast cuts every 1-2 seconds', 'End with your face looking at camera'],
  },
  {
    day: 'Saturday', date: null, time: 'All day', type: 'STORIES',
    color: C.pink, typeIcon: '📱',
    topic: 'Stories Only — BTS, Polls, Q&A, Recovery',
    hook: null,
    format: '3-5 stories · interactive stickers · real unfilished content',
    goal: 'RETENTION — stories keep your existing followers engaged daily',
    tips: ['Poll: "Leg day or rest day?" type questions', 'Q&A: Ask me anything about fitness', 'BTS: Show what you ate, how you feel'],
  },
  {
    day: 'Sunday', date: null, time: 'Film Day', type: 'PREP',
    color: C.green, typeIcon: '🎥',
    topic: 'Content Filming Day — NO POST',
    hook: null,
    format: 'Film ALL your clips for next week in one session',
    goal: 'PRODUCTION — batching saves 10+ hours per week',
    tips: ['Film 3-4 workout clips in one gym session', 'Film food prep content at home', 'Shoot progress photos with consistent lighting'],
  },
]

const HOOKS = {
  transformation: [
    '"I lost [X] kg doing THIS every morning (not what you think)"',
    '"6 months ago I couldn\'t do a single pull-up. Now watch:"',
    '"My body completely changed when I stopped doing [common mistake]"',
    '"Before vs After: I only changed ONE thing in my routine"',
    '"This is what [X] months of consistency looks like no filter"',
    '"Nobody talks about the mental side of getting in shape. I will."',
  ],
  workout: [
    '"The exercise that changed my chest more than bench press"',
    '"You\'re doing [exercise] wrong. Here\'s how to fix it:"',
    '"3 exercises I do every single leg day. No exceptions."',
    '"Gym for [X] years. These are the only 5 exercises that matter"',
    '"Stop doing [popular exercise] until you watch this"',
    '"The 10-minute workout that actually works (no equipment)"',
  ],
  nutrition: [
    '"What I eat in a day to stay lean year-round (with macros)"',
    '"I eat [X] calories and this is exactly what it looks like"',
    '"The meal I eat every day that keeps me full for 6 hours"',
    '"You don\'t need supplements. You need THIS instead."',
    '"How I meal prep for an entire week in 2 hours"',
    '"The cheapest high-protein meal I eat 3x a week"',
  ],
  mindset: [
    '"The real reason you\'re not seeing progress (it\'s not your workout)"',
    '"I stopped caring about the scale and THIS happened"',
    '"Everyone gives up at this exact point. Don\'t be them."',
    '"Discipline > Motivation. Here\'s what that actually means."',
    '"What nobody tells you about the first 90 days"',
    '"I trained through [hard life event]. Here\'s what kept me going."',
  ],
  lifestyle: [
    '"A day in my life as someone who actually goes to the gym"',
    '"How I fit training into a busy schedule (I work full time)"',
    '"My morning routine that makes the rest of the day easier"',
    '"What my gym bag actually contains (no BS)"',
    '"How much do I spend on fitness per month? Full breakdown"',
    '"Rating every gym stereotype I see every week"',
  ],
}

const HASHTAG_SETS = {
  workout: {
    label: 'Workout Reels',
    sets: [
      '#fitness #gym #workout #lifting #gains #fitnessmotivation #gymlife #weightlifting #bodybuilding #physique',
      '#chestday #pushday #benchpress #shoulderworkout #armday #legday #backday #pullday',
      '#gymmotivation #workouttips #fitfam #homeworkout #naturalathlete #strengthtraining',
    ],
  },
  nutrition: {
    label: 'Nutrition & Food',
    sets: [
      '#nutrition #mealprep #healthyfood #macros #protein #cleaneating #iifym #dietitian',
      '#whatieatinaday #highprotein #mealplan #foodprep #calories #bulking #cutting #recomp',
      '#fitnessfood #healthyrecipes #proteinmeal #gymfood #nutritioncoach',
    ],
  },
  transformation: {
    label: 'Progress & Transformation',
    sets: [
      '#transformation #bodybuilding #naturalbodybuilding #fitnessjourney #progresspic #beforeandafter',
      '#consistencyiskey #trusttheprocess #fitnessgoals #getfit #weightloss #musclegain #buildmuscle',
      '#motivated #discipline #hardwork #nevergiveup #fitnessinspiration #bodyrecomposition',
    ],
  },
  arabic: {
    label: 'Arabic / Egyptian Fitness',
    sets: [
      '#فيتنس #رياضة #تمرين #صالة_الجيم #لياقة_بدنية #رشاقة #صحة',
      '#تحويل_جسم #حمية #بناء_عضلات #كمال_الاجسام #رياضة_عربية',
      '#shivo #fitness_egypt #arabic_fitness #arab_fitness #fitarab',
    ],
  },
}

const MONETIZATION_MILESTONES = [
  {
    followers: 1000,
    title: 'Foundation',
    color: C.muted,
    unlocks: ['Start building your email list now', 'Test content types to find your top performer', 'Engage every comment — build superfans early'],
    revenue: 'No direct revenue yet, but you\'re planting seeds',
  },
  {
    followers: 5000,
    title: 'Affiliate Ready',
    color: '#a78bfa',
    unlocks: ['Apply to MyProtein affiliate program (easy approval)', 'Add Gymshark affiliate link to bio', 'Post supplement reviews with honest takes + links'],
    revenue: 'Affiliate commissions: £50-200/month realistically',
  },
  {
    followers: 10000,
    title: 'Coaching Unlocked',
    color: C.orange,
    unlocks: ['Offer 1-on-1 online coaching via DM (£100-250/client/month)', 'Link to simple Google Form: "Apply for coaching"', 'Create a coaching package: custom plan + weekly check-ins'],
    revenue: '5 clients = £500-1250/month. This is your first real income.',
  },
  {
    followers: 15000,
    title: 'Digital Products',
    color: C.accent,
    unlocks: ['Sell a PDF workout plan (£15-25)', 'Create a 4-week program on Gumroad', 'Nutrition guide: "How I eat to stay lean"'],
    revenue: '100 sales/month @ £20 = £2,000. Passive income starts here.',
  },
  {
    followers: 25000,
    title: 'Brand Deals Begin',
    color: C.green,
    unlocks: ['Reach out to supplement brands for paid collabs', 'Expect £300-800 per sponsored post/reel', 'Use an influencer platform like Creator.co or AspireIQ'],
    revenue: '2-4 brand deals/month = £600-3,200/month extra',
  },
  {
    followers: 50000,
    title: 'Full-Time Ready',
    color: C.pink,
    unlocks: ['Group coaching programs (larger cohorts)', 'Merchandise or branded gear', 'YouTube channel for longer content + AdSense'],
    revenue: '£3,000-8,000+/month combining all streams',
  },
]

const VIDEO_SCRIPTS = {
  workout_reel: {
    label: 'Workout Reel (30 sec)',
    structure: [
      { label: 'HOOK (0-3s)', desc: 'Say or show something that stops the scroll', example: 'Text overlay: "This exercise built my back in 60 days" + close-up of exercise' },
      { label: 'PROBLEM (3-8s)', desc: 'What mistake are people making / what\'s the struggle', example: '"Most people do rows wrong. They use momentum and get zero lat activation."' },
      { label: 'THE FIX (8-22s)', desc: '3-5 quick clips showing the correct technique or movement', example: 'Show 3 angles: grip, setup, full movement. Each clip 3-4 seconds. Fast cuts.' },
      { label: 'RESULT (22-27s)', desc: 'Quick transformation or proof shot', example: 'Progress photo or current physique clip with text: "This is what 8 months looks like"' },
      { label: 'CTA (27-30s)', desc: 'Tell them what to do next', example: '"Follow for more. Comment your biggest gym mistake below."' },
    ],
    capcut: [
      '1. Import all clips in order. Set timeline to 30 seconds.',
      '2. Cut HOOK clip to exactly 3 seconds — it should feel fast.',
      '3. Add text overlay at 0-3s: your hook statement. Font: bold, white, centered.',
      '4. For each technique clip: speed up to 1.2-1.5x to keep energy high.',
      '5. Between each clip: add a straight cut (no transition). Cuts on beat.',
      '6. Add trending audio. Lower volume to 20% if you\'re talking, 80% if no voiceover.',
      '7. Color grade: slightly boost contrast +10, saturation +5.',
      '8. Add captions for every spoken word (auto-caption feature).',
      '9. Last 3 seconds: freeze frame or slow down to 0.5x for impact.',
      '10. Export: 1080x1920, 30fps, highest quality.',
    ],
  },
  transformation: {
    label: 'Transformation/Progress Reel (20 sec)',
    structure: [
      { label: 'BEFORE (0-3s)', desc: 'Old photo or clip with date text overlay', example: '"January 2024" — show honestly, no hiding. Authenticity = trust.' },
      { label: 'JOURNEY (3-14s)', desc: '4-6 clips showing the process, not just the result', example: 'Early workouts, meal prep, hard days, small wins. Text overlays with months.' },
      { label: 'AFTER (14-18s)', desc: 'Current physique shot — confident, well-lit', example: 'Good lighting, same pose as before for comparison. Text: "Today."' },
      { label: 'KEY MESSAGE (18-20s)', desc: 'One sentence that captures your journey', example: '"Consistency beats perfection. Every single time."' },
    ],
    capcut: [
      '1. Find a slow, emotional audio track (CapCut trending: look for "transformation" sounds).',
      '2. Before photo: hold for 3 full seconds. Let people feel it.',
      '3. Journey clips: each 2 seconds. 4-6 clips total.',
      '4. Add date text overlays: Jan 2024, Mar 2024, etc.',
      '5. After clip: slow down to 0.7x for dramatic effect.',
      '6. Text fade in: "Consistency beats perfection. Every single time."',
      '7. Vignette filter on all clips for moody feel.',
      '8. Export at highest quality.',
    ],
  },
  educational: {
    label: 'Educational Carousel (10 slides)',
    structure: [
      { label: 'SLIDE 1 — HOOK', desc: 'Bold statement that creates curiosity or FOMO', example: '"5 exercises that are a waste of your time (and what to do instead)"' },
      { label: 'SLIDE 2 — PROMISE', desc: 'Tell them exactly what they\'ll learn', example: '"Swipe through and I\'ll show you the better alternatives that take half the time."' },
      { label: 'SLIDES 3-8 — CONTENT', desc: 'Each slide covers ONE point. Simple text + icon or photo.', example: 'Slide 3: "❌ Smith Machine Squat → ✅ Free Squat (more muscle, better balance)"' },
      { label: 'SLIDE 9 — BONUS', desc: 'Give them one extra tip they didn\'t expect', example: '"Bonus: The ONE supplement worth buying (it\'s not protein powder)"' },
      { label: 'SLIDE 10 — CTA', desc: 'Tell them to save AND follow', example: '"Save this post so you don\'t forget. Follow @shivo for more."' },
    ],
    capcut: [
      '1. Use Canva (not CapCut) for carousels. Open Canva, choose Instagram Post (square or portrait).',
      '2. Choose a dark background: #0a0a0a or #111111 — matches your aesthetic.',
      '3. Slide 1: Big white text, 60+ font size. NO image. Text IS the image.',
      '4. Slides 2-9: Same template. Bold heading. 2-3 lines max per slide.',
      '5. Color accent: one consistent color for highlighted words (orange or indigo).',
      '6. Your face photo on slide 9 or 10 for trust.',
      '7. Export all as PNG, upload to Instagram as carousel.',
    ],
  },
}

// ─── Utility components ───────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function CopyButton({ text, small = false }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} style={{
      padding: small ? '4px 10px' : '6px 14px',
      borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
      background: copied ? 'rgba(34,197,94,0.15)' : C.accentGlow,
      color: copied ? C.green : '#a5b4fc',
      border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.25)'}`,
      transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

function Badge({ label, color, bg }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      color: color || '#fff', background: bg || C.accentGlow,
      border: `1px solid ${color || C.accent}33`, letterSpacing: '0.05em',
    }}>
      {label}
    </span>
  )
}

// ─── SCHEDULE TAB ─────────────────────────────────────────────────────────────
function ScheduleTab() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={s.section}>Your Weekly Posting System</div>
        <div style={s.sub}>5 posts/week · proven formula for Instagram fitness growth · every time, same days, same times</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {WEEK_SCHEDULE.map((item) => {
          const isToday = item.day === today
          return (
            <div key={item.day} style={{
              ...s.card,
              border: `1px solid ${isToday ? item.color + '60' : C.border}`,
              background: isToday ? item.color + '08' : C.surface,
              position: 'relative', overflow: 'hidden',
            }}>
              {isToday && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  padding: '4px 14px', fontSize: 10, fontWeight: 700,
                  background: item.color, color: '#fff', borderBottomLeftRadius: 10,
                  letterSpacing: '0.08em',
                }}>TODAY</div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {/* Left: day/time/type */}
                <div style={{ flexShrink: 0, width: 110 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>{item.day}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{item.time}</div>
                  <div style={{ marginTop: 8 }}>
                    <Badge
                      label={`${item.typeIcon} ${item.type}`}
                      color={item.color}
                      bg={item.color + '18'}
                    />
                  </div>
                </div>

                {/* Right: content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{item.topic}</div>

                  {item.hook && (
                    <div style={{
                      padding: '8px 12px', borderRadius: 8, marginBottom: 10,
                      background: item.color + '10', border: `1px solid ${item.color}25`,
                      fontSize: 13, color: C.text, fontStyle: 'italic',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
                    }}>
                      <span>{item.hook}</span>
                      <CopyButton text={item.hook} small />
                    </div>
                  )}

                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
                    <span style={{ color: item.color, fontWeight: 600 }}>Format: </span>{item.format}
                  </div>

                  <div style={{ fontSize: 12, marginBottom: 10 }}>
                    <span style={{ color: C.dim, fontWeight: 600 }}>Goal: </span>
                    <span style={{ color: C.muted }}>{item.goal}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {item.tips.map((tip, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.muted, display: 'flex', gap: 8 }}>
                        <span style={{ color: item.color, flexShrink: 0 }}>▸</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ ...s.card, marginTop: 20, borderColor: C.green + '30', background: C.greenGlow }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 8 }}>Stories — Every Single Day</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {[
            '📊 Poll (1 per day)',
            '💬 Q&A box',
            '🏋 Workout clip',
            '🍽 Food photo',
            '📸 BTS content',
            '🔥 Motivational quote',
          ].map(t => (
            <div key={t} style={{ fontSize: 12, color: C.muted, padding: '6px 10px', borderRadius: 7, background: C.surface }}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: C.dim }}>Post 3-5 stories per day. They keep your existing followers warm and signal to Instagram that you\'re active.</div>
      </div>
    </div>
  )
}

// ─── CAPTION GENERATOR TAB ────────────────────────────────────────────────────
const CAPTION_TYPES = [
  { id: 'workout', label: 'Workout Reel' },
  { id: 'nutrition', label: 'Nutrition Post' },
  { id: 'transformation', label: 'Transformation' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'educational', label: 'Educational Tip' },
]

function CaptionTab({ apiKey }) {
  const [type, setType] = useState('workout')
  const [hook, setHook] = useState('')
  const [details, setDetails] = useState('')
  const [cta, setCta] = useState('follow + comment')
  const [tone, setTone] = useState('raw and real')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!apiKey) { setError('Add your Anthropic API key in Settings.'); return }
    if (!hook.trim()) { setError('Add a hook for the post.'); return }
    setError(''); setLoading(true); setOutput('')

    const prompt = `You are a professional Instagram fitness content writer for @shivo — a male fitness creator building his brand.

Write an Instagram caption for a ${type} post.

HOOK (first line — must grab attention immediately): ${hook}
Extra context / key points to include: ${details || 'none'}
Tone: ${tone}
CTA at the end: encourage people to ${cta}

RULES:
- First line = the hook. No extra words before it.
- Short paragraphs — 1-3 lines max. Instagram readers scan, they don't read.
- Real and personal voice — not corporate, not generic AI. Sound like a real guy who trains.
- No motivational fluff like "Embrace the journey" or "You got this". Be specific.
- End with a clear, simple CTA: comment, save, share, or follow.
- Add 5 relevant hashtags AT THE END only. Mix of popular and niche.
- Total caption length: 100-200 words maximum.
- Do NOT use emojis in every line — use 2-4 max, strategically.

Output ONLY the caption. No explanation, no title, no quotes around it.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-calls': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Error ${res.status}`) }
      const data = await res.json()
      setOutput(data.content?.[0]?.text || '')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={s.section}>AI Caption Generator</div>
        <div style={s.sub}>Powered by Claude. Generates captions that sound like a real fitness person, not a robot.</div>
      </div>

      {!apiKey && (
        <div style={{ ...s.card, marginBottom: 20, borderColor: '#f59e0b40', background: '#f59e0b0a' }}>
          <div style={{ fontSize: 13, color: '#fbbf24' }}>
            Add your Anthropic API key in the <strong>Settings</strong> tab to use AI generation.
            Get one free at console.anthropic.com — you get $5 credit to start.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Type selector */}
        <div>
          <div style={s.label}>Post Type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CAPTION_TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)} style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                border: 'none', fontWeight: type === t.id ? 700 : 400,
                background: type === t.id ? C.accent : C.surface,
                color: type === t.id ? '#fff' : C.muted,
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hook */}
        <div>
          <div style={s.label}>Hook — first line of your caption</div>
          <input
            value={hook}
            onChange={e => setHook(e.target.value)}
            style={s.input}
            placeholder="e.g. I trained legs every day for 30 days. Here's what nobody tells you."
          />
        </div>

        {/* Details */}
        <div>
          <div style={s.label}>Key details to include (optional)</div>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            style={{ ...s.textarea }}
            rows={3}
            placeholder="e.g. Did 5x5 squats, hit 120kg PR, struggled with sleep this week, using creatine..."
          />
        </div>

        {/* Tone & CTA row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={s.label}>Tone</div>
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              style={{ ...s.input, cursor: 'pointer' }}
            >
              {['raw and real', 'motivational and hype', 'educational and calm', 'funny and relatable', 'serious and focused'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={s.label}>Call to Action</div>
            <select
              value={cta}
              onChange={e => setCta(e.target.value)}
              style={{ ...s.input, cursor: 'pointer' }}
            >
              {['follow + comment', 'save this post', 'share with a friend', 'comment their answer', 'DM me for help'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={generate} disabled={loading} style={{
          ...s.btn(loading ? C.dim : C.accent),
          justifyContent: 'center', padding: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? <><Spinner /> Generating caption…</> : '✦ Generate Caption'}
        </button>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13 }}>
            {error}
          </div>
        )}

        {output && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={s.label}>Your caption</div>
              <CopyButton text={output} />
            </div>
            <div style={{
              padding: '18px 20px', borderRadius: 12, fontSize: 14,
              background: C.surface, border: `1px solid ${C.accent}30`,
              color: C.text, lineHeight: 1.8, whiteSpace: 'pre-wrap',
            }}>
              {output}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── VIDEO SCRIPTS TAB ────────────────────────────────────────────────────────
function ScriptsTab({ apiKey }) {
  const [scriptType, setScriptType] = useState('workout_reel')
  const [topic, setTopic] = useState('')
  const [genScript, setGenScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCapcut, setShowCapcut] = useState(null)

  const current = VIDEO_SCRIPTS[scriptType]

  async function generateScript() {
    if (!apiKey) { setError('Add your API key in Settings.'); return }
    if (!topic.trim()) { setError('Enter a topic.'); return }
    setError(''); setLoading(true); setGenScript('')

    const struct = current.structure.map(s => `${s.label}: ${s.desc}`).join('\n')
    const prompt = `Write a complete Instagram ${current.label} script for @shivo — a male fitness creator.

Topic: ${topic}

Follow this exact structure:
${struct}

Rules:
- This is a real video script. Write EXACTLY what he should say or what text should appear on screen.
- Keep each section SHORT. Total video is under 60 seconds.
- Sound like a real guy who trains, not a fitness influencer cliché.
- Include text overlay suggestions in [BRACKETS].
- End with a genuine, low-pressure CTA.

Format: Use the section headings (HOOK, PROBLEM, etc.) as bold headers.
Output the script only.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-calls': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Error ${res.status}`) }
      const data = await res.json()
      setGenScript(data.content?.[0]?.text || '')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={s.section}>Video Script Generator</div>
        <div style={s.sub}>Full scripts + CapCut edit sequences for every video type.</div>
      </div>

      {/* Type selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {Object.entries(VIDEO_SCRIPTS).map(([id, v]) => (
          <button key={id} onClick={() => setScriptType(id)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: 'none',
            background: scriptType === id ? C.accent : C.surface,
            color: scriptType === id ? '#fff' : C.muted, fontWeight: scriptType === id ? 700 : 400,
          }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Structure breakdown */}
      <div style={{ ...s.card, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>
          {current.label} — Structure
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.structure.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{
                flexShrink: 0, width: 120,
                fontSize: 11, fontWeight: 700, color: C.accent,
                paddingTop: 2, letterSpacing: '0.03em',
              }}>
                {step.label}
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{step.desc}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontStyle: 'italic' }}>{step.example}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CapCut guide */}
      <div style={{ ...s.card, marginBottom: 20, borderColor: C.orange + '30', background: C.orangeGlow }}>
        <button
          onClick={() => setShowCapcut(showCapcut === scriptType ? null : scriptType)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, display: 'flex', justifyContent: 'space-between' }}>
            CapCut Edit Sequence for this video type
            <span>{showCapcut === scriptType ? '▲' : '▼'}</span>
          </div>
        </button>
        {showCapcut === scriptType && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {current.capcut.map((step, i) => (
              <div key={i} style={{ fontSize: 12, color: C.muted, display: 'flex', gap: 10 }}>
                <span style={{ color: C.orange, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI script generator */}
      <div style={{ ...s.card }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>
          Generate a Full Script with AI
        </div>

        {!apiKey && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f59e0b0a', color: '#fbbf24', fontSize: 12, marginBottom: 14, border: '1px solid #f59e0b25' }}>
            Add Anthropic API key in Settings to generate AI scripts.
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <div style={s.label}>Your topic / what this video is about</div>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            style={s.input}
            placeholder='e.g. "Why I stopped doing cable flyes and what I do instead"'
          />
        </div>

        <button onClick={generateScript} disabled={loading} style={{
          ...s.btn(loading ? C.dim : C.orange),
          cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? <><Spinner /> Writing script…</> : '✦ Write Full Script'}
        </button>

        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 12 }}>
            {error}
          </div>
        )}

        {genScript && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={s.label}>Generated script</div>
              <CopyButton text={genScript} />
            </div>
            <div style={{
              padding: '16px 18px', borderRadius: 12, fontSize: 13,
              background: C.bg, border: `1px solid ${C.orange}25`,
              color: C.text, lineHeight: 1.8, whiteSpace: 'pre-wrap',
            }}>
              {genScript}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── HOOKS LIBRARY TAB ───────────────────────────────────────────────────────
function HooksTab() {
  const [activeCategory, setActiveCategory] = useState('all')
  const categories = ['all', ...Object.keys(HOOKS)]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={s.section}>Hook Library</div>
        <div style={s.sub}>30+ proven hooks. The hook is the most important 3 seconds of your video — it determines if people watch or scroll.</div>
      </div>

      <div style={{ ...s.card, marginBottom: 20, borderColor: C.accent + '30', background: C.accentGlow }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 4 }}>HOW TO USE A HOOK</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
          Replace the [X] placeholders with your real numbers. Specificity makes hooks work.
          "I lost 12 kg" outperforms "I lost a lot of weight" every time.
          Show the hook as <strong>text on screen</strong> in the first 2 seconds — even if you're also saying it.
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: '7px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: 'none',
            background: activeCategory === cat ? C.accent : C.surface,
            color: activeCategory === cat ? '#fff' : C.muted, fontWeight: 500,
            textTransform: 'capitalize',
          }}>
            {cat}
          </button>
        ))}
      </div>

      {Object.entries(HOOKS)
        .filter(([cat]) => activeCategory === 'all' || cat === activeCategory)
        .map(([cat, hooks]) => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 10,
            }}>
              {cat.replace('_', ' ')} hooks
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {hooks.map((hook, i) => (
                <div key={i} style={{
                  ...s.card, padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ fontSize: 13, color: C.text, flex: 1, lineHeight: 1.5 }}>{hook}</div>
                  <CopyButton text={hook} small />
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

// ─── HASHTAGS TAB ─────────────────────────────────────────────────────────────
function HashtagsTab() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={s.section}>Hashtag Sets</div>
        <div style={s.sub}>Pre-built hashtag sets by content type. Use 5-10 hashtags max — the algorithm prefers fewer, targeted tags now.</div>
      </div>

      <div style={{ ...s.card, marginBottom: 20, borderColor: C.pink + '30', background: C.pinkGlow }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.pink, marginBottom: 6 }}>2026 HASHTAG STRATEGY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            '5-10 hashtags per post — quality beats quantity. Instagram said so.',
            'Mix sizes: 2 big (1M+), 3 medium (50K-500K), 2 small (under 50K).',
            'Always include #shivo — build your own branded hashtag from day one.',
            'Arabic hashtags (#فيتنس) to reach the Arabic-speaking fitness community.',
            'Put hashtags AFTER the caption — not in the first comment anymore.',
          ].map((tip, i) => (
            <div key={i} style={{ fontSize: 12, color: C.muted, display: 'flex', gap: 8 }}>
              <span style={{ color: C.pink }}>▸</span><span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {Object.entries(HASHTAG_SETS).map(([id, data]) => (
        <div key={id} style={{ ...s.card, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{data.label}</div>
          </div>
          {data.sets.map((set, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: C.dim, marginBottom: 4, fontWeight: 600 }}>
                SET {i + 1} — {set.split(' ').length} tags
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                gap: 12, padding: '10px 12px', borderRadius: 8,
                background: C.bg, border: `1px solid ${C.border}`,
              }}>
                <div style={{ fontSize: 12, color: '#a5b4fc', lineHeight: 1.8, flex: 1 }}>{set}</div>
                <CopyButton text={set} small />
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Bio hashtag */}
      <div style={{ ...s.card, borderColor: C.accent + '30' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Your Branded Hashtag</div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 14px', borderRadius: 8, background: C.bg, border: `1px solid ${C.accent}25`,
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>#shivo</span>
          <CopyButton text="#shivo" small />
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
          Add #shivo to EVERY post. When you hit 10K followers, this becomes a searchable community page — people find YOU.
        </div>
      </div>
    </div>
  )
}

// ─── MONETIZATION TAB ────────────────────────────────────────────────────────
function MoneyTab() {
  const [followers, setFollowers] = useState(() => {
    return parseInt(localStorage.getItem('shivo-followers') || '0')
  })

  useEffect(() => {
    localStorage.setItem('shivo-followers', followers.toString())
  }, [followers])

  const currentMilestone = MONETIZATION_MILESTONES.reduce((prev, m) => {
    return followers >= m.followers ? m : prev
  }, MONETIZATION_MILESTONES[0])

  const nextMilestone = MONETIZATION_MILESTONES.find(m => m.followers > followers)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={s.section}>Monetization Roadmap</div>
        <div style={s.sub}>Every follower milestone unlocks new income streams. {"Here's"} exactly what to do at each level.</div>
      </div>

      {/* Follower input */}
      <div style={{ ...s.card, marginBottom: 24, borderColor: C.green + '30', background: C.greenGlow }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 12 }}>Your Current Progress</div>
        <div style={{ display: 'flex', align: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={s.label}>Current Followers</div>
            <input
              type="number"
              value={followers}
              onChange={e => setFollowers(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ ...s.input, fontSize: 20, fontWeight: 700, color: C.green }}
            />
          </div>
          {nextMilestone && (
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Next milestone</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: nextMilestone.color }}>
                {nextMilestone.followers.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {(nextMilestone.followers - followers).toLocaleString()} to go
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {nextMilestone && (
          <div>
            <div style={{ height: 6, borderRadius: 999, background: C.border, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: `linear-gradient(90deg, ${C.green}, ${nextMilestone.color})`,
                width: `${Math.min(100, (followers / nextMilestone.followers) * 100)}%`,
                transition: 'width 0.5s',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: C.dim }}>
              <span>{followers.toLocaleString()}</span>
              <span>{nextMilestone.followers.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MONETIZATION_MILESTONES.map((m) => {
          const isUnlocked = followers >= m.followers
          const isCurrent = m.followers === currentMilestone.followers
          const isNext = m === nextMilestone

          return (
            <div key={m.followers} style={{
              ...s.card,
              border: `1px solid ${isNext ? m.color + '50' : isUnlocked ? m.color + '30' : C.border}`,
              background: isNext ? m.color + '08' : isUnlocked ? m.color + '04' : C.surface,
              opacity: !isUnlocked && !isNext ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isNext || isCurrent ? 12 : 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: isUnlocked ? m.color + '20' : C.bg,
                  border: `2px solid ${isUnlocked ? m.color : C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: isUnlocked ? m.color : C.dim,
                }}>
                  {isUnlocked ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: isUnlocked ? m.color : C.text }}>
                    {m.followers.toLocaleString()} followers
                  </div>
                  <div style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>{m.title}</div>
                </div>
                {isNext && <Badge label="YOU'RE HERE" color={m.color} bg={m.color + '18'} />}
              </div>

              {(isNext || isCurrent || isUnlocked) && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                    {m.unlocks.map((u, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.muted, display: 'flex', gap: 8 }}>
                        <span style={{ color: m.color, flexShrink: 0 }}>▸</span>
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    padding: '8px 12px', borderRadius: 8,
                    background: m.color + '10', border: `1px solid ${m.color}20`,
                    fontSize: 12, color: C.text, fontWeight: 600,
                  }}>
                    💰 {m.revenue}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Action plan */}
      <div style={{ ...s.card, marginTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Your Next 3 Actions This Week</div>
        {followers < 1000 ? (
          <Actions items={[
            'Post your first Reel THIS WEEK. Imperfect > perfect. Just go.',
            'Follow 20 fitness accounts in your niche and leave genuine comments.',
            'Set up Instagram bio: who you are, what you help people with, where you\'re from.',
          ]} />
        ) : followers < 5000 ? (
          <Actions items={[
            'Apply to MyProtein affiliate — it\'s free and takes 10 minutes.',
            'Add Linktree to your bio with your affiliate links.',
            'DM 5 followers who engage with your content and ask what content they want.',
          ]} />
        ) : followers < 10000 ? (
          <Actions items={[
            'Create a "coaching interest" post — "DM me COACH if you want a custom plan".',
            'Set up a simple Google Form as your coaching application.',
            'Price your coaching: £150/month is a good starting point.',
          ]} />
        ) : (
          <Actions items={[
            'Create your first digital product: a 4-week PDF program on Gumroad.',
            'Reach out to 3 supplement brands for collab — pitch your engagement rate.',
            'Set up a Calendly for free discovery calls to convert coaching clients.',
          ]} />
        )}
      </div>
    </div>
  )
}

function Actions({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 8,
          background: C.bg, border: `1px solid ${C.border}`,
        }}>
          <div style={{
            flexShrink: 0, width: 22, height: 22, borderRadius: 6,
            background: C.accentGlow, border: `1px solid ${C.accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: C.accent,
          }}>
            {i + 1}
          </div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{item}</div>
        </div>
      ))}
    </div>
  )
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ apiKey, setApiKey }) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={s.section}>Settings</div>
        <div style={s.sub}>API key for AI features. Stored locally in your browser only.</div>
      </div>

      <div style={s.card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Anthropic API Key</div>
        <div style={{ marginBottom: 8 }}>
          <div style={s.label}>Paste your key from console.anthropic.com</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={show ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{ ...s.input, fontFamily: 'monospace' }}
            />
            <button onClick={() => setShow(v => !v)} style={s.btnGhost}>
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.7 }}>
          Get your free API key at console.anthropic.com — you get $5 free credit (~thousands of captions).<br />
          Your key never leaves your browser. It goes directly to Anthropic's API.
        </div>
        {apiKey && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: C.greenGlow, border: `1px solid ${C.green}30`, fontSize: 12, color: C.green }}>
            ✓ API key saved — Caption Generator and Script Generator are active
          </div>
        )}
      </div>

      <div style={{ ...s.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Claude Code Tools</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
          Tell Claude Code (this app) to do these things — copy the prompt and paste it directly into a Claude Code chat:
        </div>
        {[
          { label: 'Render a new Remotion reel', prompt: 'In my-video directory, render the SupplementsVideo composition to an MP4 file using: npx remotion render SupplementsVideo out/supplements_reel.mp4' },
          { label: 'Build a new reel from my footage', prompt: 'Run python3 my-video/build_reel.py to assemble my gym footage into a reel with cinematic color grading' },
          { label: 'Generate 5 caption ideas', prompt: 'Generate 5 Instagram caption hooks for a fitness creator (@shivo) for a leg day workout reel. Make them specific, punchy, and under 15 words each.' },
          { label: 'Create a new workout Reel template', prompt: 'In my-video/src/, create a new Remotion composition called WorkoutTipsVideo — a 30-second vertical 9:16 reel showing 5 workout tips with text overlays and bold animated typography' },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.label}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
              padding: '10px 12px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 12, color: C.text, fontFamily: 'monospace', lineHeight: 1.6, flex: 1 }}>{item.prompt}</div>
              <CopyButton text={item.prompt} small />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'schedule', label: '📅 Schedule' },
  { id: 'captions', label: '✦ Captions' },
  { id: 'scripts', label: '🎬 Scripts' },
  { id: 'hooks', label: '🪝 Hooks' },
  { id: 'hashtags', label: '# Hashtags' },
  { id: 'money', label: '💰 Money' },
  { id: 'settings', label: '⚙ Settings' },
]

export default function App() {
  const [tab, setTab] = useState('schedule')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('shivo-api-key') || '')

  useEffect(() => {
    localStorage.setItem('shivo-api-key', apiKey)
  }, [apiKey])

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        background: C.surface,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 56 }}>
            <div>
              <span style={{ fontSize: 18, fontWeight: 900, color: C.text, letterSpacing: '-0.5px' }}>@shivo</span>
              <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>Fitness Business Dashboard</span>
            </div>
            <div style={{ flex: 1 }} />
            {apiKey && (
              <div style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: C.greenGlow, color: C.green, border: `1px solid ${C.green}30`,
              }}>
                AI Active
              </div>
            )}
          </div>

          {/* Tab bar */}
          <div style={{
            display: 'flex', gap: 2, paddingBottom: 0,
            overflowX: 'auto', scrollbarWidth: 'none',
          }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '10px 14px', fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
                cursor: 'pointer', border: 'none', background: 'none', whiteSpace: 'nowrap',
                color: tab === t.id ? C.text : C.muted,
                borderBottom: `2px solid ${tab === t.id ? C.accent : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 60px' }}>
        {tab === 'schedule' && <ScheduleTab />}
        {tab === 'captions' && <CaptionTab apiKey={apiKey} />}
        {tab === 'scripts' && <ScriptsTab apiKey={apiKey} />}
        {tab === 'hooks' && <HooksTab />}
        {tab === 'hashtags' && <HashtagsTab />}
        {tab === 'money' && <MoneyTab />}
        {tab === 'settings' && <SettingsTab apiKey={apiKey} setApiKey={setApiKey} />}
      </div>
    </div>
  )
}
