import { useState, useEffect } from 'react'

export default function WelcomeScreen({ onStart }) {
  const [visible, setVisible] = useState(false)
  const [bubbleVisible, setBubbleVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    setTimeout(() => setBubbleVisible(true), 800)
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: 'calc(100vh - 80px)',
      textAlign: 'center', padding: '40px 16px',
    }}>
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(30px)',
        transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{
          position: 'relative', display: 'inline-block', marginBottom: 32,
        }}>
          <img
            src="/icon.svg"
            alt="AlignCrew logo"
            style={{
              width: 112,
              height: 112,
              display: 'block',
              margin: '0 auto',
              borderRadius: 24,
              boxShadow: '0 18px 40px rgba(79, 70, 229, 0.25)',
              animation: 'pulse-glow 2s infinite',
            }}
          />
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #7C3AED, #EC4899, #059669)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 12,
          lineHeight: 1.1,
        }}>
          AlignCrew
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text-muted)', marginBottom: 40,
          maxWidth: 420,
        }}>
          Smart work distribution for teams — powered by AI
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          {['Resume Analysis', 'Fair Task Split', 'AI Powered', 'PDF Reports'].map(tag => (
            <span key={tag} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '6px 14px', fontSize: 13,
              color: 'var(--text-muted)',
            }}>{tag}</span>
          ))}
        </div>

        <button className="btn-primary" onClick={onStart} style={{ fontSize: 17, padding: '14px 40px', marginBottom: 48 }}>
          Let's Go! →
        </button>

        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: '📄', label: 'Upload Resumes' },
            { icon: '⚙️', label: 'AI Analysis' },
            { icon: '📊', label: 'Task Split' },
            { icon: '📥', label: 'PDF Report' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {bubbleVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '14px 18px',
          maxWidth: 260,
          boxShadow: '0 8px 32px rgba(124,58,237,0.25)',
          animation: 'fadeInUp 0.5s ease both',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0,
            background: 'var(--bg-card2)',
            borderRadius: 12, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 5,
          }}>
            <img src="/icon.svg" alt="AlignCrew logo" style={{ width: 24, height: 24, display: 'block' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--purple)', fontWeight: 600, marginBottom: 3 }}>ProjectBot</div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>
              Hey! 👋 Shall we start building your dream team plan?
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
