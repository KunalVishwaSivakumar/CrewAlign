import { useState, useEffect } from 'react'

const STEPS = [
  { icon: '📄', label: 'Reading resumes...', delay: 0 },
  { icon: '🔍', label: 'Analyzing skills...', delay: 1200 },
  { icon: '🎯', label: 'Understanding project requirements...', delay: 2400 },
  { icon: '⚖️', label: 'Splitting tasks fairly...', delay: 3800 },
  { icon: '📊', label: 'Generating report...', delay: 5200 },
]

export default function LoadingScreen() {
  const [done, setDone] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    STEPS.forEach((step, i) => {
      setTimeout(() => {
        setCurrent(i)
        setTimeout(() => {
          setDone(prev => [...prev, i])
        }, 900)
      }, step.delay)
    })
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      textAlign: 'center', padding: '40px 20px',
    }}>
      <div style={{
        position: 'relative', marginBottom: 40,
        width: 100, height: 100,
      }}>
        <div style={{
          width: 100, height: 100,
          borderRadius: '50%',
          border: '4px solid var(--border)',
          borderTop: '4px solid var(--purple)',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
        }}>
          🤖
        </div>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        AI is working its magic...
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: 14 }}>
        Powered by ASI:ONE — analyzing your team and project
      </p>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '24px 28px', width: '100%', maxWidth: 420,
        textAlign: 'left',
      }}>
        {STEPS.map((step, i) => {
          const isDone = done.includes(i)
          const isActive = current === i && !isDone

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: i < STEPS.length - 1 ? 16 : 0,
              opacity: i > current ? 0.3 : 1,
              transition: 'opacity 0.4s',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
                background: isDone
                  ? 'linear-gradient(135deg, #059669, #10B981)'
                  : isActive
                  ? 'linear-gradient(135deg, #7C3AED, #9333EA)'
                  : 'var(--bg-card2)',
                border: `2px solid ${isDone ? '#059669' : isActive ? '#7C3AED' : 'var(--border)'}`,
                transition: 'all 0.4s',
                animation: isActive ? 'pulse-glow 1.5s infinite' : 'none',
              }}>
                {isDone ? '✅' : step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: isDone ? 600 : isActive ? 700 : 400,
                  color: isDone ? 'var(--green)' : isActive ? 'var(--text)' : 'var(--text-muted)',
                  fontSize: 14,
                  transition: 'color 0.4s',
                }}>
                  {step.label}
                </div>
                {isActive && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {[0, 1, 2].map(j => (
                      <div key={j} style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: 'var(--purple)',
                        animation: `typing 1.2s ${j * 0.2}s ease infinite`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 32, color: 'var(--text-muted)', fontSize: 13 }}>
        This usually takes 15-30 seconds...
      </div>
    </div>
  )
}
