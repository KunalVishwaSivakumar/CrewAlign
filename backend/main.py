import os
import uuid
import json
import tempfile
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from dotenv import load_dotenv

from pdf_reader import extract_text_from_pdf
from ai_analyzer import analyze_project, DEMO_RESULT, enrich_analysis
from report_generator import generate_pdf_report

load_dotenv()

app = FastAPI(title="AlignCrew API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_STORE: dict[str, dict] = {}


@app.get("/api/health")
def health():
    return {"status": "ok", "powered_by": "ASI:ONE"}


@app.post("/api/analyze")
async def analyze(
    names: str = Form(...),
    project_description: str = Form(...),
    project_type: str = Form(...),
    deadline: str = Form(""),
    demo_mode: str = Form("false"),
    files: list[UploadFile] = File(default=[]),
):
    name_list = json.loads(names)

    if demo_mode.lower() == "true":
        session_id = str(uuid.uuid4())
        analysis = enrich_analysis(
            json.loads(json.dumps(DEMO_RESULT)),
            deadline,
            project_description or "Demo e-commerce project",
            project_type or "Web App",
        )
        SESSION_STORE[session_id] = {
            "analysis": analysis,
            "project_description": project_description or "Demo e-commerce project",
            "project_type": project_type or "Web App",
        }
        return {"session_id": session_id, "result": analysis}

    if len(files) != len(name_list):
        raise HTTPException(400, f"Expected {len(name_list)} files, got {len(files)}")

    for f in files:
        if not f.filename.lower().endswith(".pdf"):
            raise HTTPException(400, f"File {f.filename} is not a PDF")

    team_members = []
    for i, (name, upload) in enumerate(zip(name_list, files)):
        content = await upload.read()
        try:
            resume_text = extract_text_from_pdf(content)
        except Exception as e:
            raise HTTPException(400, f"Could not read PDF for {name}: {str(e)}")

        team_members.append({"name": name, "resume_text": resume_text})

    try:
        result = analyze_project(team_members, project_description, project_type, deadline)
    except RuntimeError as e:
        raise HTTPException(400, str(e))
    except json.JSONDecodeError as e:
        raise HTTPException(500, f"AI returned invalid JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"AI analysis failed: {str(e)}")

    session_id = str(uuid.uuid4())
    SESSION_STORE[session_id] = {
        "analysis": result,
        "project_description": project_description,
        "project_type": project_type,
    }

    return {"session_id": session_id, "result": result}


@app.get("/api/download-report/{session_id}")
def download_report(session_id: str):
    session = SESSION_STORE.get(session_id)
    if not session:
        raise HTTPException(404, "Session not found. Please analyze first.")

    pdf_bytes = generate_pdf_report(
        session["analysis"],
        session["project_description"],
        session["project_type"],
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=AlignCrew-Report-{session_id[:8]}.pdf",
            "Content-Length": str(len(pdf_bytes)),
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
