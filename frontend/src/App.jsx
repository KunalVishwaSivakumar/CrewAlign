import { useState, useEffect } from 'react'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import TeamSetup from './components/TeamSetup.jsx'
import ResumeUpload from './components/ResumeUpload.jsx'
import ProjectForm from './components/ProjectForm.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import ResultsPage from './components/ResultsPage.jsx'
import ChatBot from './components/ChatBot.jsx'

const STEPS = ['welcome', 'team-setup', 'resume-upload', 'project-form', 'loading', 'results']

export default function App() {
  const [step, setStep] = useState('welcome')
  const [theme, setTheme] = useState('dark')
  const [teamSize, setTeamSize] = useState(3)
  const [members, setMembers] = useState([])
  const [projectData, setProjectData] = useState({})
  const [sessionId, setSessionId] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [chatMessages, setChatMessages] = useState([])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const addMessage = (text, isBot = true) => {
    setChatMessages(prev => [...prev, { text, isBot, id: Date.now() }])
  }

  const goTo = (s) => setStep(s)

  const handleStart = () => {
    addMessage("How many people are in your team?")
    goTo('team-setup')
  }

  const handleTeamSize = (size) => {
    setTeamSize(size)
    addMessage(`Great! ${size} team members. Let's collect everyone's resumes.`)
    goTo('resume-upload')
  }

  const handleResumesUploaded = (memberData) => {
    setMembers(memberData)
    addMessage("Perfect! Now tell me about your project.")
    goTo('project-form')
  }

  const handleProjectSubmit = async (data, isDemo) => {
    setProjectData(data)
    goTo('loading')

    try {
      const formData = new FormData()
      formData.append('names', JSON.stringify(members.map(m => m.name)))
      formData.append('project_description', data.description)
      formData.append('project_type', data.type)
      formData.append('deadline', data.deadline || '')
      formData.append('demo_mode', isDemo ? 'true' : 'false')

      if (!isDemo) {
        members.forEach(m => formData.append('files', m.file))
      }

      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Analysis failed')
      }
      const json = await res.json()
      setSessionId(json.session_id)
      setAnalysisResult(json.result)
      addMessage("Your project plan is ready! Here's the complete breakdown.")
      goTo('results')
    } catch (e) {
      addMessage(`Oops! Something went wrong: ${e.message}. Please try again.`)
      goTo('project-form')
    }
  }

  const handleReset = () => {
    setStep('welcome')
    setTeamSize(3)
    setMembers([])
    setProjectData({})
    setSessionId(null)
    setAnalysisResult(null)
    setChatMessages([])
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header theme={theme} setTheme={setTheme} step={step} />

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '20px 16px 80px' }}>
        <div style={{ width: '100%', maxWidth: step === 'results' ? 1100 : 680 }}>
          {step === 'welcome' && <WelcomeScreen onStart={handleStart} />}
          {step === 'team-setup' && <TeamSetup onConfirm={handleTeamSize} />}
          {step === 'resume-upload' && (
            <ResumeUpload teamSize={teamSize} onComplete={handleResumesUploaded} />
          )}
          {step === 'project-form' && (
            <ProjectForm members={members} onSubmit={handleProjectSubmit} />
          )}
          {step === 'loading' && <LoadingScreen />}
          {step === 'results' && (
            <ResultsPage
              result={analysisResult}
              sessionId={sessionId}
              projectData={projectData}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {step !== 'welcome' && step !== 'loading' && step !== 'results' && (
        <ChatBot messages={chatMessages} />
      )}
    </div>
  )
}

function Header({ theme, setTheme, step }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 24px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/icon.svg" alt="logo" style={{ width: 36, height: 36 }} />
        <div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--purple)' }}>AlignCrew</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', lineHeight: 1.2 }}>
            Smart work distribution
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card2)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
          Powered by ASI:ONE
        </span>
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          style={{
            background: 'var(--bg-card2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '6px 12px', color: 'var(--text)',
            fontSize: 16, cursor: 'pointer',
          }}
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
