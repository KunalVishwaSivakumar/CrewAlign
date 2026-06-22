import os
import json
import math
from datetime import date, datetime
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

MODEL = os.getenv("ASI_ONE_MODEL", "asi1-mini")


def get_client() -> OpenAI:
    api_key = os.getenv("ASI_ONE_API_KEY", "").strip()
    if not api_key or api_key == "your_asi_one_api_key_here":
        raise RuntimeError(
            "ASI_ONE_API_KEY is missing. Replace the placeholder value in the root .env file with a valid ASI:ONE API key, or use Demo Mode."
        )

    return OpenAI(
        api_key=api_key,
        base_url=os.getenv("ASI_ONE_BASE_URL", "https://api.asi1.ai/v1"),
    )


ROLE_KEYWORDS = {
    "Backend Engineer": ["backend", "api", "database", "server", "authentication", "auth", "login", "payment"],
    "Frontend Engineer": ["frontend", "react", "ui", "ux", "css", "html", "web app", "mobile app"],
    "UI/UX Designer": ["ui/ux", "design", "figma", "wireframe", "prototype", "user interface", "user experience"],
    "Data/AI Engineer": ["ai", "ml", "machine learning", "data", "model", "analytics", "llm"],
    "DevOps/Deployment Engineer": ["deploy", "deployment", "docker", "aws", "devops", "ci/cd", "infrastructure"],
}


ROLE_SUGGESTIONS = {
    "Backend Engineer": {
        "tech_stack": ["Python", "FastAPI", "PostgreSQL", "REST APIs"],
        "focus": "build APIs, business logic, and data flow",
    },
    "Frontend Engineer": {
        "tech_stack": ["React", "JavaScript/TypeScript", "HTML", "CSS"],
        "focus": "implement screens, interactions, and responsive UI",
    },
    "UI/UX Designer": {
        "tech_stack": ["Figma", "Wireframing", "Prototyping", "Design Systems"],
        "focus": "shape the user flow and visual design before development",
    },
    "Data/AI Engineer": {
        "tech_stack": ["Python", "Pandas", "ML/LLM APIs", "Data Processing"],
        "focus": "handle intelligence, analytics, or model integration",
    },
    "DevOps/Deployment Engineer": {
        "tech_stack": ["Docker", "CI/CD", "AWS", "Deployment Automation"],
        "focus": "package, deploy, and keep the app stable",
    },
}


def _parse_deadline(deadline: str):
    if not deadline:
        return None

    try:
        return datetime.strptime(deadline, "%Y-%m-%d").date()
    except ValueError:
        return None


def _team_text(team_overview: list[dict]) -> str:
    parts = []
    for member in team_overview:
        skills = member.get("top_skills", []) or []
        strengths = member.get("strengths", "") or ""
        parts.append(" ".join([" ".join(skills), strengths]).lower())
    return " ".join(parts)


def _detect_missing_roles(team_overview: list[dict], project_description: str, project_type: str) -> list[str]:
    context = f"{project_type} {project_description}".lower()
    team_blob = _team_text(team_overview)
    missing_roles = []

    for role, keywords in ROLE_KEYWORDS.items():
        if any(keyword in context for keyword in keywords):
            if not any(keyword in team_blob for keyword in keywords):
                missing_roles.append(role)

    return missing_roles


def _pick_capacity_boost_role(project_description: str, project_type: str) -> str:
    context = f"{project_type} {project_description}".lower()

    ordered_checks = [
        ("Backend Engineer", ["backend", "api", "database", "auth", "login", "payment", "reporting"]),
        ("Frontend Engineer", ["frontend", "ui", "ux", "dashboard", "responsive", "web app", "mobile app"]),
        ("UI/UX Designer", ["design", "figma", "wireframe", "prototype", "user experience", "user interface"]),
        ("Data/AI Engineer", ["ai", "ml", "data", "analytics", "model", "llm"]),
        ("DevOps/Deployment Engineer", ["deploy", "deployment", "docker", "aws", "ci/cd", "infrastructure"]),
    ]

    best_role = "Backend Engineer"
    best_score = -1
    for role, keywords in ordered_checks:
        score = sum(1 for keyword in keywords if keyword in context)
        if score > best_score:
            best_score = score
            best_role = role

    return best_role


def enrich_analysis(analysis: dict, deadline: str, project_description: str, project_type: str) -> dict:
    deadline_date = _parse_deadline(deadline)
    summary = analysis.get("summary", {}) or {}
    team_overview = analysis.get("team_overview", []) or []
    estimated_weeks = int(summary.get("estimated_weeks") or 0)
    missing_roles = _detect_missing_roles(team_overview, project_description, project_type)

    deadline_assessment = {
        "deadline": deadline or None,
        "feasible": None,
        "status": "not_provided",
        "message": "No deadline provided.",
        "estimated_weeks": estimated_weeks,
        "weeks_available": None,
        "missing_roles": missing_roles,
        "recommendations": [],
        "role_suggestions": [],
    }

    if deadline_date:
        days_available = (deadline_date - date.today()).days
        weeks_available = max(0, math.ceil(days_available / 7))
        feasible = estimated_weeks <= weeks_available
        deadline_assessment.update(
            {
                "feasible": feasible,
                "status": "feasible" if feasible else "not_feasible",
                "weeks_available": weeks_available,
            }
        )

        if feasible:
            deadline_assessment["message"] = (
                f"The deadline looks feasible. Estimated plan length is {estimated_weeks} weeks and you have about {weeks_available} weeks available."
            )
        else:
            deadline_assessment["message"] = (
                f"The deadline is not feasible with the current team. Estimated plan length is {estimated_weeks} weeks but only about {weeks_available} weeks are available."
            )

    recommendations = []
    role_suggestions = []
    if missing_roles:
        for role in missing_roles:
            suggestion = ROLE_SUGGESTIONS.get(role, {})
            tech_stack = suggestion.get("tech_stack", [])
            focus = suggestion.get("focus", "cover the missing work")

            role_suggestions.append({
                "role": role,
                "tech_stack": tech_stack,
                "focus": focus,
                "approval_note": "If your mentor/superior allows expanding the team, add this person to reduce risk and speed up delivery.",
            })

            stack_text = ", ".join(tech_stack) if tech_stack else role.lower()
            recommendations.append(f"Add a {role} with {stack_text} if mentor approval allows.")

        missing_roles_text = ", ".join(missing_roles)
        deadline_assessment["message"] += (
            f" If mentor/superior approval allows, add: {missing_roles_text}."
        )
    elif deadline_date and not feasible:
        boost_role = _pick_capacity_boost_role(project_description, project_type)
        suggestion = ROLE_SUGGESTIONS.get(boost_role, {})
        tech_stack = suggestion.get("tech_stack", [])
        focus = suggestion.get("focus", "help finish the project faster")

        role_suggestions.append({
            "role": boost_role,
            "tech_stack": tech_stack,
            "focus": focus,
            "is_capacity_boost": True,
            "approval_note": "If mentor/superior approval allows, add this person to split the workload and finish closer to the deadline.",
        })

        stack_text = ", ".join(tech_stack) if tech_stack else boost_role.lower()
        recommendations.append(f"Add a {boost_role} with {stack_text} if mentor approval allows.")
        deadline_assessment["message"] += (
            f" If mentor/superior approval allows, add a {boost_role} to split the workload and speed delivery up."
        )

    deadline_assessment["recommendations"] = recommendations
    deadline_assessment["role_suggestions"] = role_suggestions
    analysis["deadline_assessment"] = deadline_assessment
    return analysis

SYSTEM_PROMPT = """You are an expert project manager and technical lead with 15+ years of experience.
You will receive resumes of team members and a project description.
Your job is to:
1. Extract each person's skills, experience level (Junior/Mid/Senior), and strengths from their resume
2. Understand the project requirements deeply
3. Split the project into 8-15 specific, actionable tasks
4. Assign each task to the most suitable person based on their skills
5. Ensure workload is distributed fairly (similar estimated hours per person)
6. Provide clear reasoning for each assignment
7. Generate a week-by-week timeline
8. Identify collaboration opportunities and potential bottlenecks

You MUST return ONLY valid JSON (no markdown, no explanation outside JSON) matching this exact structure:
{
  "team_overview": [
    {
      "name": "string",
      "experience_level": "Junior|Mid|Senior",
      "top_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "strengths": "string describing key strengths",
      "color": "#hexcolor"
    }
  ],
  "tasks": [
    {
      "id": 1,
      "task": "string task name",
      "description": "string detailed description",
      "assigned_to": "person name",
      "reason": "string explaining why this person",
      "estimated_hours": number,
      "priority": "High|Medium|Low",
      "week": number
    }
  ],
  "timeline": [
    {
      "week": 1,
      "focus": "string describing week focus",
      "assignments": [
        {"person": "name", "task": "task name", "hours": number}
      ]
    }
  ],
  "collaboration_notes": {
    "pairs": [
      {"members": ["name1", "name2"], "reason": "string"}
    ],
    "bottlenecks": ["string bottleneck description"]
  },
  "summary": {
    "total_tasks": number,
    "total_hours": number,
    "estimated_weeks": number,
    "workload": [
      {"person": "name", "hours": number, "tasks": number, "percentage": number}
    ]
  }
}"""


def analyze_project(team_members: list[dict], project_description: str, project_type: str, deadline: str = "") -> dict:
    client = get_client()

    team_text = ""
    for i, member in enumerate(team_members):
        team_text += f"\n\n--- TEAM MEMBER {i+1}: {member['name']} ---\n"
        team_text += member.get("resume_text", "No resume provided.")

    deadline_text = f"\nProject Deadline: {deadline}" if deadline else ""

    user_message = f"""Please analyze this team and project, then assign tasks:

PROJECT DETAILS:
Type: {project_type}
Description: {project_description}{deadline_text}

TEAM RESUMES:{team_text}

Remember: Return ONLY valid JSON matching the exact structure specified."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.7,
        max_tokens=4000,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown code blocks if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    analysis = json.loads(raw)
    return enrich_analysis(analysis, deadline, project_description, project_type)


DEMO_RESULT = {
    "team_overview": [
        {
            "name": "Alice Johnson",
            "experience_level": "Senior",
            "top_skills": ["React", "TypeScript", "Node.js", "System Design", "API Design"],
            "strengths": "Full-stack architect with strong frontend leadership skills",
            "color": "#7C3AED",
        },
        {
            "name": "Bob Smith",
            "experience_level": "Mid",
            "top_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
            "strengths": "Solid backend developer with cloud deployment experience",
            "color": "#059669",
        },
        {
            "name": "Carol Davis",
            "experience_level": "Junior",
            "top_skills": ["UI/UX Design", "Figma", "CSS", "HTML", "User Testing"],
            "strengths": "Creative designer with strong user empathy",
            "color": "#DC2626",
        },
    ],
    "tasks": [
        {
            "id": 1,
            "task": "System Architecture Design",
            "description": "Design overall system architecture, API contracts, and database schema",
            "assigned_to": "Alice Johnson",
            "reason": "Senior full-stack experience with system design expertise",
            "estimated_hours": 12,
            "priority": "High",
            "week": 1,
        },
        {
            "id": 2,
            "task": "UI/UX Wireframes",
            "description": "Create wireframes and design system for all app screens",
            "assigned_to": "Carol Davis",
            "reason": "Design background with Figma proficiency",
            "estimated_hours": 16,
            "priority": "High",
            "week": 1,
        },
        {
            "id": 3,
            "task": "Backend API Development",
            "description": "Build FastAPI backend with all REST endpoints and business logic",
            "assigned_to": "Bob Smith",
            "reason": "Strong Python and FastAPI skills",
            "estimated_hours": 24,
            "priority": "High",
            "week": 2,
        },
        {
            "id": 4,
            "task": "Frontend React Development",
            "description": "Implement all UI components using React and TypeScript",
            "assigned_to": "Alice Johnson",
            "reason": "Expert React and TypeScript developer",
            "estimated_hours": 20,
            "priority": "High",
            "week": 2,
        },
        {
            "id": 5,
            "task": "Database Setup & Migrations",
            "description": "Set up PostgreSQL, write migrations and seed data",
            "assigned_to": "Bob Smith",
            "reason": "PostgreSQL expertise and database design skills",
            "estimated_hours": 8,
            "priority": "Medium",
            "week": 2,
        },
        {
            "id": 6,
            "task": "Responsive CSS Implementation",
            "description": "Implement responsive styles based on approved wireframes",
            "assigned_to": "Carol Davis",
            "reason": "CSS specialist who created the original designs",
            "estimated_hours": 16,
            "priority": "Medium",
            "week": 3,
        },
        {
            "id": 7,
            "task": "Docker & Deployment Setup",
            "description": "Containerize app and deploy to AWS",
            "assigned_to": "Bob Smith",
            "reason": "Docker and AWS expertise",
            "estimated_hours": 10,
            "priority": "Medium",
            "week": 4,
        },
        {
            "id": 8,
            "task": "Integration Testing",
            "description": "Write and run integration tests across frontend and backend",
            "assigned_to": "Alice Johnson",
            "reason": "Full-stack knowledge to test end-to-end flows",
            "estimated_hours": 10,
            "priority": "High",
            "week": 4,
        },
    ],
    "timeline": [
        {
            "week": 1,
            "focus": "Planning & Design",
            "assignments": [
                {"person": "Alice Johnson", "task": "System Architecture Design", "hours": 12},
                {"person": "Carol Davis", "task": "UI/UX Wireframes", "hours": 16},
            ],
        },
        {
            "week": 2,
            "focus": "Core Development",
            "assignments": [
                {"person": "Bob Smith", "task": "Backend API Development", "hours": 24},
                {"person": "Alice Johnson", "task": "Frontend React Development", "hours": 20},
                {"person": "Bob Smith", "task": "Database Setup", "hours": 8},
            ],
        },
        {
            "week": 3,
            "focus": "UI Polish & Integration",
            "assignments": [
                {"person": "Carol Davis", "task": "Responsive CSS Implementation", "hours": 16},
            ],
        },
        {
            "week": 4,
            "focus": "Deployment & Testing",
            "assignments": [
                {"person": "Bob Smith", "task": "Docker & Deployment Setup", "hours": 10},
                {"person": "Alice Johnson", "task": "Integration Testing", "hours": 10},
            ],
        },
    ],
    "collaboration_notes": {
        "pairs": [
            {"members": ["Alice Johnson", "Bob Smith"], "reason": "Need to align on API contracts daily"},
            {"members": ["Alice Johnson", "Carol Davis"], "reason": "Frontend dev must implement Carol's designs"},
        ],
        "bottlenecks": [
            "API contracts must be finalized in Week 1 before frontend work begins",
            "Carol's wireframes need approval before CSS implementation starts",
        ],
    },
    "summary": {
        "total_tasks": 8,
        "total_hours": 116,
        "estimated_weeks": 4,
        "workload": [
            {"person": "Alice Johnson", "hours": 42, "tasks": 3, "percentage": 36},
            {"person": "Bob Smith", "hours": 42, "tasks": 3, "percentage": 36},
            {"person": "Carol Davis", "hours": 32, "tasks": 2, "percentage": 28},
        ],
    },
}
