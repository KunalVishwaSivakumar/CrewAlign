import { useState } from 'react'

const PERSON_COLORS = [
  '#7C3AED', '#059669', '#DC2626', '#D97706',
  '#2563EB', '#DB2777', '#0891B2', '#65A30D', '#EA580C', '#8B5CF6',
]

const PRIORITY_COLOR = { High: '#DC2626', Medium: '#D97706', Low: '#059669' }

export default function ResultsPage({ result, sessionId, projectData, onReset }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [downloading, setDownloading] = useState(false)

  if (!result) return null

  const { team_overview = [], tasks = [], timeline = [], collaboration_notes = {}, summary = {}, deadline_assessment = {} } = result

  const colorMap = {}
  team_overview.forEach((m, i) => {
    colorMap[m.name] = m.color || PERSON_COLORS[i % PERSON_COLORS.length]
  })

  const handleDownload = async () => {
    if (!sessionId) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/download-report/${sessionId}`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AlignCrew-Report.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Download failed: ' + e.message)
    } finally {
      setDownloading(false)
    }
  }

  const TABS = [
    { id: 'overview', label: '👥 Team', },
    { id: 'tasks', label: '📋 Tasks' },
    { id: 'timeline', label: '📅 Timeline' },
    { id: 'collab', label: '🤝 Collab' },
    { id: 'stats', label: '📊 Stats' },
  ]

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            🎉 Your Project Plan is Ready!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {summary.total_tasks} tasks · {summary.total_hours} hours · {summary.estimated_weeks} weeks
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary"
            onClick={handleDownload}
            disabled={downloading || !sessionId}
            style={{ fontSize: 14, padding: '10px 20px' }}
          >
            {downloading ? '⏳ Generating...' : '📥 Download PDF'}
          </button>
          <button className="btn-outline" onClick={onReset} style={{ fontSize: 14 }}>
            🔄 Start Over
          </button>
        </div>
      </div>

      {projectData?.deadline && deadline_assessment?.message && (
        <div className="card" style={{
          marginBottom: 20,
          borderLeft: `4px solid ${deadline_assessment.status === 'feasible' ? '#059669' : '#DC2626'}`,
          background: deadline_assessment.status === 'feasible' ? 'linear-gradient(135deg, rgba(5,150,105,0.10), rgba(5,150,105,0.04))' : 'linear-gradient(135deg, rgba(220,38,38,0.12), rgba(220,38,38,0.05))',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 24 }}>
              {deadline_assessment.status === 'feasible' ? '✅' : '⚠️'}
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontWeight: 800, marginBottom: 4, fontSize: 16 }}>
                {deadline_assessment.status === 'feasible' ? 'Deadline looks feasible' : 'Deadline is not feasible'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5 }}>
                {deadline_assessment.message}
              </div>
              {(deadline_assessment.role_suggestions?.length > 0 || deadline_assessment.recommendations?.length > 0) && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {deadline_assessment.role_suggestions?.map((item, index) => (
                    <div key={index} style={{
                      background: 'var(--bg-card2)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                          Add {item.role}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {item.is_capacity_boost ? 'Capacity boost' : 'Missing role'}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
                        Suggested stack: {item.tech_stack?.length ? item.tech_stack.join(', ') : 'N/A'}
                      </div>
                      {item.focus && (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                          Why: {item.focus}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                        {item.approval_note}
                      </div>
                    </div>
                  ))}

                  {deadline_assessment.recommendations?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {deadline_assessment.recommendations.map((item, index) => (
                        <span
                          key={index}
                          className="badge"
                          style={{
                            background: deadline_assessment.status === 'feasible' ? 'rgba(5,150,105,0.12)' : 'rgba(220,38,38,0.14)',
                            color: deadline_assessment.status === 'feasible' ? '#059669' : '#DC2626',
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 6, overflowX: 'auto',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #7C3AED, #9333EA)'
                : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <TeamOverview team={team_overview} />}
      {activeTab === 'tasks' && <TaskTable tasks={tasks} colorMap={colorMap} />}
      {activeTab === 'timeline' && <TimelineView timeline={timeline} colorMap={colorMap} />}
      {activeTab === 'collab' && <CollabNotes notes={collaboration_notes} />}
      {activeTab === 'stats' && <StatsView summary={summary} colorMap={colorMap} />}
    </div>
  )
}

function TeamOverview({ team }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
      {team.map((member, i) => {
        const color = member.color || PERSON_COLORS[i % PERSON_COLORS.length]
        return (
          <div key={i} className="card" style={{
            borderTop: `4px solid ${color}`, padding: 0, overflow: 'hidden',
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${color}20, ${color}08)`,
              padding: '20px 20px 16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 20,
                }}>
                  {member.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{member.name}</div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 20, color: 'white',
                    background: member.experience_level === 'Senior' ? '#7C3AED'
                      : member.experience_level === 'Mid' ? '#2563EB' : '#059669',
                  }}>
                    {member.experience_level}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {member.top_skills?.map(skill => (
                    <span key={skill} style={{
                      fontSize: 11, padding: '3px 9px', borderRadius: 20,
                      background: `${color}20`, color: color, fontWeight: 600,
                      border: `1px solid ${color}40`,
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {member.strengths && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strengths</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{member.strengths}</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TaskTable({ tasks, colorMap }) {
  const [filter, setFilter] = useState('All')
  const people = ['All', ...Object.keys(colorMap)]

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.assigned_to === filter)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {people.map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: 'none',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: filter === p
                ? (colorMap[p] || 'var(--purple)')
                : 'var(--bg-card2)',
              color: filter === p ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
          <thead>
            <tr>
              {['#', 'Task', 'Assigned To', 'Why', 'Hours', 'Priority', 'Week'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '8px 12px',
                  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((task, i) => {
              const color = colorMap[task.assigned_to] || '#7C3AED'
              return (
                <tr key={task.id || i} style={{ animation: 'fadeInUp 0.3s ease both', animationDelay: `${i * 0.04}s` }}>
                  <td style={{ padding: '10px 12px', background: 'var(--bg-card)', borderRadius: '10px 0 0 10px', color: 'var(--text-muted)', fontSize: 13 }}>
                    {task.id}
                  </td>
                  <td style={{ padding: '10px 12px', background: 'var(--bg-card)', fontWeight: 600, fontSize: 13, maxWidth: 200 }}>
                    {task.task}
                  </td>
                  <td style={{ padding: '10px 12px', background: 'var(--bg-card)' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 12, fontWeight: 600,
                      background: `${color}20`, color, padding: '4px 10px',
                      borderRadius: 20, border: `1px solid ${color}40`,
                      whiteSpace: 'nowrap',
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                      {task.assigned_to}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: 12, maxWidth: 220, lineHeight: 1.4 }}>
                    {task.reason}
                  </td>
                  <td style={{ padding: '10px 12px', background: 'var(--bg-card)', fontWeight: 700, color: 'var(--purple)', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {task.estimated_hours}h
                  </td>
                  <td style={{ padding: '10px 12px', background: 'var(--bg-card)' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 9px',
                      borderRadius: 20, color: 'white',
                      background: PRIORITY_COLOR[task.priority] || '#6B7280',
                    }}>
                      {task.priority}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', background: 'var(--bg-card)', borderRadius: '0 10px 10px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    W{task.week}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TimelineView({ timeline, colorMap }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {timeline.map((week, i) => (
        <div key={i} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
              color: 'white', fontWeight: 800, fontSize: 14,
              padding: '6px 14px', borderRadius: 10,
            }}>
              Week {week.week}
            </div>
            <div style={{ fontWeight: 600 }}>{week.focus}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {week.assignments?.map((a, j) => {
              const color = colorMap[a.person] || '#7C3AED'
              return (
                <div key={j} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--bg-card2)', borderRadius: 10, padding: '10px 14px',
                  borderLeft: `3px solid ${color}`,
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color,
                    minWidth: 100,
                  }}>{a.person}</span>
                  <span style={{ fontSize: 13, flex: 1 }}>{a.task}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)', whiteSpace: 'nowrap' }}>
                    {a.hours}h
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function CollabNotes({ notes }) {
  const pairs = notes.pairs || []
  const bottlenecks = notes.bottlenecks || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🤝</span> Working Pairs
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pairs.map((pair, i) => (
            <div key={i} style={{
              background: 'var(--bg-card2)', borderRadius: 12, padding: '14px 16px',
              borderLeft: '3px solid #7C3AED',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--purple)' }}>
                {pair.members?.join(' + ')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{pair.reason}</div>
            </div>
          ))}
          {!pairs.length && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No specific pairs identified.</p>}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚠️</span> Potential Bottlenecks
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bottlenecks.map((b, i) => (
            <div key={i} style={{
              background: '#DC262610', borderRadius: 12, padding: '14px 16px',
              borderLeft: '3px solid #DC2626', display: 'flex', gap: 10,
            }}>
              <span>⚠️</span>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{b}</span>
            </div>
          ))}
          {!bottlenecks.length && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No bottlenecks identified.</p>}
        </div>
      </div>
    </div>
  )
}

function StatsView({ summary, colorMap }) {
  const { total_tasks, total_hours, estimated_weeks, workload = [] } = summary
  const maxHours = Math.max(...workload.map(w => w.hours), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Tasks', value: total_tasks, icon: '📋', color: '#7C3AED' },
          { label: 'Total Hours', value: `${total_hours}h`, icon: '⏱️', color: '#2563EB' },
          { label: 'Estimated Weeks', value: `${estimated_weeks}w`, icon: '📅', color: '#059669' },
          { label: 'Team Members', value: workload.length, icon: '👥', color: '#D97706' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Workload Distribution</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {workload.map((w, i) => {
            const color = colorMap[w.person] || PERSON_COLORS[i % PERSON_COLORS.length]
            const pct = Math.round((w.hours / maxHours) * 100)
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{w.person}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{w.tasks} tasks</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{w.hours}h</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{w.percentage}%</span>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card2)', borderRadius: 8, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 8,
                    background: `linear-gradient(90deg, ${color}, ${color}99)`,
                    width: `${pct}%`,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
