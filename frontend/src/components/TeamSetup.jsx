import { useState } from 'react'

export default function TeamSetup({ onConfirm }) {
  const [size, setSize] = useState(3)

  return (
    <div className="animate-fade-up" style={{ paddingTop: 60 }}>
      <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Team Size</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            How many people are in your team?
          </p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20,
          }}>
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                onClick={() => setSize(n)}
                style={{
                  padding: '14px 0',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 18,
                  border: `2px solid ${size === n ? 'var(--purple)' : 'var(--border)'}`,
                  background: size === n
                    ? 'linear-gradient(135deg, #7C3AED, #9333EA)'
                    : 'var(--bg-card2)',
                  color: size === n ? 'white' : 'var(--text)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  transform: size === n ? 'scale(1.06)' : 'scale(1)',
                  boxShadow: size === n ? '0 4px 15px rgba(124,58,237,0.4)' : 'none',
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <div style={{
            background: 'var(--bg-card2)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 24 }}>{'👤'.repeat(Math.min(size, 6))}{size > 6 ? `+${size - 6}` : ''}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{size} team members selected</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                We'll collect a resume for each person
              </div>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={() => onConfirm(size)} style={{ width: '100%', fontSize: 16 }}>
          Confirm Team Size →
        </button>
      </div>
    </div>
  )
}
