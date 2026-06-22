import { useState } from 'react'

const PROJECT_TYPES = [
  'Web App', 'Mobile App', 'AI/ML Project',
  'Data Analysis', 'Research', 'Backend API', 'Other',
]

export default function ProjectForm({ members, onSubmit }) {
  const [form, setForm] = useState({ description: '', type: 'Web App', deadline: '' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const canSubmit = form.description.trim().length > 20

  const handleAnalyze = async (isDemo = false) => {
    if (!canSubmit && !isDemo) return
    setLoading(true)
    await onSubmit(form, isDemo)
    setLoading(false)
  }

  return (
    <div className="animate-fade-up" style={{ paddingTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Project Details</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Describe your project so our AI can split tasks perfectly
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
            Project Description *
          </label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="e.g. Build a full-stack e-commerce website with payment integration, admin dashboard, user authentication, product catalog, shopping cart, and mobile-responsive design..."
            style={{ minHeight: 130, resize: 'vertical', fontSize: 14, lineHeight: 1.6 }}
          />
          <div style={{ fontSize: 11, color: form.description.length < 20 ? 'var(--red)' : 'var(--text-muted)', marginTop: 4 }}>
            {form.description.length} characters (minimum 20)
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              Project Type
            </label>
            <select value={form.type} onChange={e => set('type', e.target.value)} style={{ fontSize: 14 }}>
              {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              Deadline (optional)
            </label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => set('deadline', e.target.value)}
              style={{ fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card2)', borderRadius: 10,
          padding: '12px 16px', marginBottom: 4,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Team members to assign:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {members.map((m, i) => (
              <span key={i} className="badge badge-purple" style={{ fontSize: 12 }}>
                {m.name || `Member ${i + 1}`}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          className="btn-primary"
          onClick={() => handleAnalyze(false)}
          disabled={!canSubmit || loading}
          style={{ flex: 1, minWidth: 200, fontSize: 15 }}
        >
          {loading ? '⏳ Analyzing...' : 'Analyze & Split Tasks ✨'}
        </button>

        <button
          className="btn-outline"
          onClick={() => handleAnalyze(true)}
          disabled={loading}
          title="Use demo data (no API key needed)"
          style={{ whiteSpace: 'nowrap' }}
        >
          🎭 Demo Mode
        </button>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 12 }}>
        Demo Mode uses sample data — no API key required
      </p>
    </div>
  )
}
