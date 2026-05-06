import { useState, useEffect } from 'react'

const STORAGE_KEY = 'style-humanizer-profile'
const MODEL = 'claude-sonnet-4-20250514'

function App() {
  const [tab, setTab] = useState('setup')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('sh-api-key') || '')
  const [showApiKey, setShowApiKey] = useState(false)

  const [samples, setSamples] = useState(['', '', ''])
  const [analyzing, setAnalyzing] = useState(false)
  const [styleProfile, setStyleProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [analyzeError, setAnalyzeError] = useState('')

  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [rewriting, setRewriting] = useState(false)
  const [rewriteError, setRewriteError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    localStorage.setItem('sh-api-key', apiKey)
  }, [apiKey])

  function addSample() {
    if (samples.length < 5) setSamples(s => [...s, ''])
  }

  function removeSample(i) {
    if (samples.length > 3) setSamples(s => s.filter((_, idx) => idx !== i))
  }

  function updateSample(i, val) {
    setSamples(s => s.map((v, idx) => idx === i ? val : v))
  }

  const filledSamples = samples.filter(s => s.trim().length > 50)

  async function analyzeStyle() {
    if (!apiKey.trim()) { setAnalyzeError('Enter your Anthropic API key above.'); return }
    if (filledSamples.length < 3) { setAnalyzeError('Provide at least 3 samples (each 50+ characters).'); return }

    setAnalyzeError('')
    setAnalyzing(true)

    const prompt = `You are a writing style analyst. Analyze the writing samples below and extract a detailed style profile.

WRITING SAMPLES:
${filledSamples.map((s, i) => `--- Sample ${i + 1} ---\n${s}`).join('\n\n')}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "summary": "2-3 sentence human-readable summary of this person's writing style",
  "sentenceLength": "short|medium|long|mixed — describe the pattern",
  "sentenceLengthDetail": "specific observation about sentence rhythm",
  "vocabularyLevel": "casual|conversational|professional|academic",
  "vocabularyDetail": "specific word choices, preferred terms, avoided words",
  "tone": "e.g. direct, warm, sarcastic, analytical, enthusiastic",
  "toneDetail": "how the tone manifests in practice",
  "punctuation": "describe punctuation habits (em-dashes, ellipses, comma usage, exclamation points, etc.)",
  "paragraphStructure": "short blocks|long paragraphs|varied|list-heavy — describe",
  "fillerPhrases": ["list", "of", "characteristic", "phrases", "or", "words", "they", "use"],
  "avoidPhrases": ["generic AI phrases to never use like", "delve into", "it is worth noting", "in conclusion"],
  "capitalStyle": "standard|minimal|emphatic — describe any unusual capitalization habits",
  "contractionUsage": "heavy|moderate|rare — do they use contractions?",
  "rhetoricalMoves": ["e.g. asks rhetorical questions", "uses self-deprecating humor", "starts sentences with And or But"],
  "keyPatterns": ["3-5 most distinctive patterns to replicate"]
}`

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
          model: MODEL,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')

      const profile = JSON.parse(jsonMatch[0])
      setStyleProfile(profile)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      setTab('humanize')
    } catch (e) {
      setAnalyzeError(e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function rewriteText() {
    if (!apiKey.trim()) { setRewriteError('Enter your Anthropic API key above.'); return }
    if (!styleProfile) { setRewriteError('Set up your style profile first.'); return }
    if (!inputText.trim()) { setRewriteError('Paste some AI text to rewrite.'); return }

    setRewriteError('')
    setRewriting(true)
    setOutputText('')

    const p = styleProfile
    const prompt = `You are a writing style mimic. Rewrite the text below so it sounds exactly like this specific person — NOT like generic human writing, but like THIS person.

STYLE PROFILE:
Summary: ${p.summary}
Sentence length: ${p.sentenceLength} — ${p.sentenceLengthDetail}
Vocabulary: ${p.vocabularyLevel} — ${p.vocabularyDetail}
Tone: ${p.tone} — ${p.toneDetail}
Punctuation habits: ${p.punctuation}
Paragraph structure: ${p.paragraphStructure}
Characteristic phrases/words to include naturally: ${(p.fillerPhrases || []).join(', ')}
Phrases to NEVER use: ${(p.avoidPhrases || []).join(', ')}
Contraction usage: ${p.contractionUsage}
Rhetorical moves: ${(p.rhetoricalMoves || []).join('; ')}
Key patterns to replicate: ${(p.keyPatterns || []).join('; ')}

RULES:
- Preserve all factual content and meaning
- Match the sentence rhythm — vary lengths exactly as described
- Use their vocabulary level, not formal or casual by default
- Mirror punctuation habits (dashes, ellipses, etc.)
- Add natural imperfections: occasional incomplete thoughts, parenthetical asides, or restarted sentences if that fits their style
- Do NOT start with a transition phrase or summary statement
- Do NOT explain what you're doing — just output the rewritten text

TEXT TO REWRITE:
${inputText}

OUTPUT ONLY the rewritten text. No preamble, no explanation, no quotes around it.`

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
          model: MODEL,
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      setOutputText(data.content?.[0]?.text || '')
    } catch (e) {
      setRewriteError(e.message)
    } finally {
      setRewriting(false)
    }
  }

  function clearProfile() {
    setStyleProfile(null)
    localStorage.removeItem(STORAGE_KEY)
    setSamples(['', '', ''])
    setOutputText('')
    setTab('setup')
  }

  function copyOutput() {
    navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0c0c10', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a24', padding: '16px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
              StyleMatch
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
              Rewrite AI text in your voice
            </div>
          </div>
          {styleProfile && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
              background: 'rgba(124,58,237,0.15)', color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.25)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
              Style profile active
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

        {/* API Key */}
        <div style={{ marginBottom: 28, padding: 16, borderRadius: 12, background: '#111118', border: '1px solid #1a1a24' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Anthropic API Key
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13,
                background: '#0c0c10', border: '1px solid #1a1a24',
                color: '#e2e8f0', fontFamily: 'monospace', outline: 'none',
              }}
            />
            <button
              onClick={() => setShowApiKey(v => !v)}
              style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: '#1a1a24', color: '#64748b', border: 'none' }}
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#334155', marginTop: 8 }}>
            Stored in your browser only. Sent directly to Anthropic, never to any other server.
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, borderRadius: 10, background: '#111118', border: '1px solid #1a1a24', width: 'fit-content' }}>
          {[['setup', '1. Style Setup'], ['humanize', '2. Humanize Text'], ['presentation', '3. Presentation']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '8px 20px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: tab === key ? '#7c3aed' : 'transparent',
                color: tab === key ? '#fff' : '#64748b',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── SETUP TAB ── */}
        {tab === 'setup' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-0.3px' }}>
                Teach it your writing style
              </div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                Paste 3–5 samples of your own writing — emails, messages, posts, essays, anything you wrote naturally.
                Each sample should be at least 50 characters.
              </div>
            </div>

            {styleProfile && (
              <div style={{ marginBottom: 24, padding: 16, borderRadius: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Saved style profile</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{styleProfile.summary}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {[styleProfile.tone, styleProfile.vocabularyLevel, styleProfile.sentenceLength + ' sentences', styleProfile.contractionUsage + ' contractions']
                        .filter(Boolean).map(tag => (
                          <span key={tag} style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: 'rgba(124,58,237,0.15)', color: '#c4b5fd' }}>
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                  <button
                    onClick={clearProfile}
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', flexShrink: 0 }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Sample textareas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {samples.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Sample {i + 1}
                    </div>
                    {samples.length > 3 && (
                      <button onClick={() => removeSample(i)} style={{ fontSize: 12, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    value={s}
                    onChange={e => updateSample(i, e.target.value)}
                    rows={4}
                    placeholder="Paste a sample of your writing here…"
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
                      background: '#111118', color: '#e2e8f0', lineHeight: 1.65, resize: 'vertical',
                      outline: 'none', fontFamily: 'inherit',
                      border: `1px solid ${s.trim().length > 50 ? 'rgba(124,58,237,0.4)' : '#1a1a24'}`,
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ textAlign: 'right', fontSize: 11, marginTop: 4, color: s.trim().length >= 50 ? '#22c55e' : '#475569' }}>
                    {s.trim().length} chars {s.trim().length >= 50 ? '✓' : '(need 50+)'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
              {samples.length < 5 && (
                <button
                  onClick={addSample}
                  style={{ padding: '9px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#111118', color: '#64748b', border: '1px solid #1a1a24' }}
                >
                  + Add sample ({samples.length}/5)
                </button>
              )}
              <button
                onClick={analyzeStyle}
                disabled={analyzing || filledSamples.length < 3}
                style={{
                  padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: filledSamples.length >= 3 && !analyzing ? 'pointer' : 'not-allowed',
                  background: filledSamples.length >= 3 && !analyzing ? '#7c3aed' : '#1a1a24',
                  color: filledSamples.length >= 3 && !analyzing ? '#fff' : '#475569',
                  border: 'none', display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                {analyzing ? <><Spinner /> Analyzing style…</> : `Analyze Style (${filledSamples.length}/3 samples ready)`}
              </button>
            </div>

            {analyzeError && <ErrorBox msg={analyzeError} />}

            {styleProfile && <StyleProfileCard profile={styleProfile} />}
          </div>
        )}

        {/* ── PRESENTATION TAB ── */}
        {tab === 'presentation' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-0.3px' }}>
                Presentation
              </div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                Watch the overview presentation below.
              </div>
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1a1a24', background: '#111118', display: 'flex', justifyContent: 'center', padding: 24 }}>
              <iframe
                src="https://prezi.com/p/embed/isCXu07TuqutP41wLTup/"
                id="iframe_container"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen"
                height="315"
                width="560"
                style={{ maxWidth: '100%', display: 'block' }}
              />
            </div>
          </div>
        )}

        {/* ── HUMANIZE TAB ── */}
        {tab === 'humanize' && (
          <div>
            {!styleProfile && (
              <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(251,191,36,0.08)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', fontSize: 13 }}>
                No style profile yet.{' '}
                <button onClick={() => setTab('setup')} style={{ background: 'none', border: 'none', color: '#fbbf24', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 13 }}>
                  Set one up first →
                </button>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-0.3px' }}>
                Rewrite AI text in your voice
              </div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                Paste any AI-generated text and it'll be rewritten to sound like you.
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI text to rewrite
              </div>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                rows={9}
                placeholder="Paste ChatGPT / Claude / Gemini output here…"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 14,
                  background: '#111118', border: '1px solid #1a1a24', color: '#e2e8f0',
                  lineHeight: 1.7, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={rewriteText}
              disabled={rewriting || !styleProfile || !inputText.trim()}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: styleProfile && inputText.trim() && !rewriting ? 'pointer' : 'not-allowed',
                background: styleProfile && inputText.trim() && !rewriting ? '#7c3aed' : '#1a1a24',
                color: styleProfile && inputText.trim() && !rewriting ? '#fff' : '#475569',
                border: 'none', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {rewriting ? <><Spinner /> Rewriting in your style…</> : 'Rewrite in My Style'}
            </button>

            {rewriteError && <ErrorBox msg={rewriteError} />}

            {outputText && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Rewritten in your voice
                  </div>
                  <button
                    onClick={copyOutput}
                    style={{
                      padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(124,58,237,0.15)',
                      color: copied ? '#4ade80' : '#a78bfa',
                      border: `1px solid ${copied ? 'rgba(34,197,94,0.25)' : 'rgba(124,58,237,0.25)'}`,
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div style={{
                  padding: '18px 20px', borderRadius: 12, fontSize: 14,
                  background: '#111118', border: '1px solid rgba(124,58,237,0.3)',
                  color: '#e2e8f0', lineHeight: 1.8, whiteSpace: 'pre-wrap',
                }}>
                  {outputText}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StyleProfileCard({ profile: p }) {
  const rows = [
    ['Summary', p.summary],
    ['Sentence length', `${p.sentenceLength} — ${p.sentenceLengthDetail}`],
    ['Vocabulary', `${p.vocabularyLevel} — ${p.vocabularyDetail}`],
    ['Tone', `${p.tone} — ${p.toneDetail}`],
    ['Punctuation', p.punctuation],
    ['Paragraphs', p.paragraphStructure],
    ['Contractions', p.contractionUsage],
    p.fillerPhrases?.length && ['Filler phrases', p.fillerPhrases.join(', ')],
    p.rhetoricalMoves?.length && ['Rhetorical moves', p.rhetoricalMoves.join('; ')],
    p.keyPatterns?.length && ['Key patterns', p.keyPatterns.join('; ')],
  ].filter(Boolean)

  return (
    <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: '#111118', border: '1px solid #1a1a24' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Extracted Style Profile</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', width: 120, flexShrink: 0, paddingTop: 1 }}>{label}</span>
            <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, flex: 1 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorBox({ msg }) {
  return (
    <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, fontSize: 13, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
      {msg}
    </div>
  )
}

function Spinner() {
  return (
    <svg style={{ width: 14, height: 14, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default App
