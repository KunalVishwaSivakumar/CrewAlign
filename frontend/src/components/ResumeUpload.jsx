import { useState, useRef } from 'react'

const PERSON_COLORS = [
  '#7C3AED', '#059669', '#DC2626', '#D97706',
  '#2563EB', '#DB2777', '#0891B2', '#65A30D', '#EA580C', '#8B5CF6',
]

export default function ResumeUpload({ teamSize, onComplete }) {
  const [members, setMembers] = useState(
    Array.from({ length: teamSize }, (_, i) => ({
      id: i,
      name: '',
      file: null,
      status: 'idle',
    }))
  )

  const updateMember = (idx, patch) => {
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, ...patch } : m))
  }

  const handleFile = (idx, file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      updateMember(idx, { status: 'error', errorMsg: 'Only PDF files are accepted.' })
      return
    }
    updateMember(idx, { file, status: 'success', errorMsg: null })
  }

  const allReady = members.every(m => m.name.trim() && m.file)

  const handleSubmit = () => {
    if (!allReady) return
    onComplete(members)
  }

  return (
    <div className="animate-fade-up" style={{ paddingTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Upload Resumes</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Enter each team member's name and upload their PDF resume
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
        {members.map((member, idx) => (
          <MemberCard
            key={member.id}
            member={member}
            idx={idx}
            color={PERSON_COLORS[idx % PERSON_COLORS.length]}
            onNameChange={name => updateMember(idx, { name })}
            onFile={file => handleFile(idx, file)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!allReady}
          style={{ flex: 1, fontSize: 15 }}
        >
          Continue with Resumes →
        </button>
      </div>
    </div>
  )
}

function MemberCard({ member, idx, color, onNameChange, onFile }) {
  const fileRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div className="card" style={{
      borderLeft: `4px solid ${color}`,
      padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: color, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 15, flexShrink: 0,
        }}>
          {idx + 1}
        </div>
        <input
          placeholder={`Team Member ${idx + 1} Name`}
          value={member.name}
          onChange={e => onNameChange(e.target.value)}
          style={{ flex: 1, fontSize: 14 }}
        />
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        style={{
          border: `2px dashed ${dragging ? color : member.status === 'success' ? '#059669' : member.status === 'error' ? '#DC2626' : 'var(--border)'}`,
          borderRadius: 10, padding: '16px',
          textAlign: 'center', cursor: 'pointer',
          background: dragging ? `${color}10` : member.status === 'success' ? '#05966910' : 'var(--bg-card2)',
          transition: 'all 0.2s',
        }}
      >
        {member.status === 'success' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#059669', fontWeight: 600, fontSize: 13 }}>{member.file?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                {(member.file?.size / 1024).toFixed(0)} KB — Click to replace
              </div>
            </div>
          </div>
        ) : member.status === 'error' ? (
          <div style={{ color: '#DC2626', fontSize: 13 }}>
            ❌ {member.errorMsg} Click to retry.
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📄</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Drop PDF here or <span style={{ color, fontWeight: 600 }}>browse</span>
            </div>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={e => onFile(e.target.files[0])}
        />
      </div>
    </div>
  )
}
