# 🚀 AlignCrew

**Smart work distribution for teams — powered by ASI:ONE AI**

AlignCrew analyzes team resumes and intelligently assigns project tasks based on each member's skills, experience, and strengths.

---

## ✨ Features

- **Resume Analysis** — Upload PDF resumes, AI extracts skills & experience
- **Smart Task Assignment** — Tasks assigned by skill match & fair workload balance
- **Week-by-Week Timeline** — Clear project roadmap with assignments
- **Collaboration Insights** — Recommended pairs + bottleneck warnings
- **PDF Report Download** — Professional report with full breakdown
- **Demo Mode** — Try without uploading files or an API key
- **Dark/Light Mode** — Clean, modern UI

---

## 🏗️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite                   |
| Backend   | Python FastAPI                    |
| AI        | ASI:ONE API (OpenAI-compatible)   |
| PDF Read  | PyMuPDF (fitz)                    |
| PDF Gen   | ReportLab                         |

---

## 🚀 Quick Start

### 1. Clone & Setup

```bash
cd projectsplitter
```

### 2. Configure Environment

Edit `.env` in the root:

```env
ASI_ONE_API_KEY=your_asi_one_api_key_here
ASI_ONE_BASE_URL=https://api.asi1.ai/v1
ASI_ONE_MODEL=asi1-mini
```

Get your ASI:ONE API key at: https://asi1.ai

### 3. Start Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8000`

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 📁 Project Structure

```
projectsplitter/
├── frontend/                   React Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── TeamSetup.jsx
│   │   │   ├── ResumeUpload.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   └── ChatBot.jsx
│   │   ├── styles/globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── main.py                 FastAPI app + endpoints
│   ├── pdf_reader.py           PyMuPDF PDF text extraction
│   ├── ai_analyzer.py          ASI:ONE API integration
│   ├── report_generator.py     ReportLab PDF generation
│   └── requirements.txt
├── .env
└── README.md
```

---

## 🔌 API Endpoints

### `POST /api/analyze`

Analyzes team + project and returns task assignments.

**Form data:**
- `names` — JSON array of team member names
- `project_description` — Project description text
- `project_type` — One of: Web App, Mobile App, AI/ML Project, etc.
- `deadline` — Optional date string
- `demo_mode` — `"true"` to use sample data
- `files` — PDF files (one per member, omit in demo mode)

**Response:**
```json
{
  "session_id": "uuid",
  "result": { ... }
}
```

### `GET /api/download-report/{session_id}`

Returns a generated PDF report for the given session.

---

## 🎭 Demo Mode

Click **"Demo Mode"** on the project form screen to see the full app flow with pre-built sample data — no API key or resumes required.

---

## 🌐 ASI:ONE Integration

This project uses the [ASI:ONE](https://asi1.ai) API, which is OpenAI-compatible. The integration is in `backend/ai_analyzer.py`:

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("ASI_ONE_API_KEY"),
    base_url="https://api.asi1.ai/v1",
)
```

The model (`asi1-mini` by default) is configurable via `.env`.

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `API key error` | Check `ASI_ONE_API_KEY` in `.env` |
| `CORS error` | Ensure backend is running on port 8000 |
| `PDF parse error` | Ensure file is a valid, text-based PDF |
| `JSON decode error` | ASI:ONE returned malformed JSON — retry |

---

## 📜 License

MIT — built for the hackathon.
