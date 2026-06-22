import { useEffect, useRef } from 'react'

export default function ChatBot({ messages }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!messages.length) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      width: 300, maxHeight: 360,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(124,58,237,0.25)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', zIndex: 200,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ fontSize: 20 }}>🤖</div>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>ProjectBot</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Powered by ASI:ONE</div>
        </div>
        <div style={{
          marginLeft: 'auto', width: 8, height: 8,
          background: '#10B981', borderRadius: '50%',
        }} />
      </div>

      <div style={{ overflowY: 'auto', padding: '12px 12px 8px', flex: 1 }}>
        {messages.map((msg, i) => (
          <div key={msg.id || i} style={{
            marginBottom: 8,
            display: 'flex',
            justifyContent: msg.isBot ? 'flex-start' : 'flex-end',
            animation: 'fadeInUp 0.3s ease both',
          }}>
            {msg.isBot && (
              <div style={{
                width: 26, height: 26, flexShrink: 0,
                background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 13, marginRight: 6, alignSelf: 'flex-end',
              }}>🤖</div>
            )}
            <div style={{
              background: msg.isBot ? 'var(--bg-card2)' : 'linear-gradient(135deg, #7C3AED, #9333EA)',
              color: msg.isBot ? 'var(--text)' : 'white',
              padding: '8px 12px',
              borderRadius: msg.isBot ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
              fontSize: 12.5,
              maxWidth: '82%',
              lineHeight: 1.5,
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <TypingDots />
        <div ref={endRef} />
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <div style={{
        width: 26, height: 26,
        background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
        borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 13,
      }}>🤖</div>
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card2)', padding: '8px 12px', borderRadius: '14px 14px 14px 4px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--purple)',
            animation: `typing 1.2s ${i * 0.2}s ease infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}
