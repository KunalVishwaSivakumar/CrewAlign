import io
from datetime import datetime
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


PURPLE = colors.HexColor("#7C3AED")
DARK_PURPLE = colors.HexColor("#4C1D95")
GREEN = colors.HexColor("#059669")
LIGHT_GRAY = colors.HexColor("#F3F4F6")
DARK_GRAY = colors.HexColor("#374151")
WHITE = colors.white
BLACK = colors.black

PERSON_COLORS = [
    colors.HexColor("#7C3AED"),
    colors.HexColor("#059669"),
    colors.HexColor("#DC2626"),
    colors.HexColor("#D97706"),
    colors.HexColor("#2563EB"),
    colors.HexColor("#DB2777"),
    colors.HexColor("#0891B2"),
    colors.HexColor("#65A30D"),
    colors.HexColor("#EA580C"),
    colors.HexColor("#7C3AED"),
]


def hex_to_color(hex_str: str):
    try:
        return colors.HexColor(hex_str)
    except Exception:
        return PURPLE


def generate_pdf_report(analysis: dict, project_description: str, project_type: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle("Title", fontSize=28, textColor=PURPLE, alignment=TA_CENTER, spaceAfter=6, fontName="Helvetica-Bold")
    subtitle_style = ParagraphStyle("Subtitle", fontSize=14, textColor=DARK_GRAY, alignment=TA_CENTER, spaceAfter=4)
    heading_style = ParagraphStyle("Heading", fontSize=16, textColor=DARK_PURPLE, spaceBefore=12, spaceAfter=6, fontName="Helvetica-Bold")
    sub_heading_style = ParagraphStyle("SubHeading", fontSize=13, textColor=DARK_GRAY, spaceBefore=8, spaceAfter=4, fontName="Helvetica-Bold")
    body_style = ParagraphStyle("Body", fontSize=10, textColor=DARK_GRAY, spaceAfter=4, leading=14)
    small_style = ParagraphStyle("Small", fontSize=9, textColor=DARK_GRAY, spaceAfter=2)

    # Cover page
    story.append(Spacer(1, 1.5 * inch))
    story.append(Paragraph("🚀 AlignCrew", title_style))
    story.append(Paragraph("Smart Work Distribution Report", subtitle_style))
    story.append(Spacer(1, 0.3 * inch))
    story.append(HRFlowable(width="100%", thickness=2, color=PURPLE))
    story.append(Spacer(1, 0.3 * inch))

    story.append(Paragraph(f"<b>Project Type:</b> {project_type}", body_style))
    story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%B %d, %Y at %H:%M')}", body_style))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(f"<b>Project Description:</b>", sub_heading_style))
    story.append(Paragraph(project_description[:500] + ("..." if len(project_description) > 500 else ""), body_style))

    summary = analysis.get("summary", {})
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph("<b>Summary</b>", sub_heading_style))

    cover_data = [
        ["Total Tasks", "Total Hours", "Estimated Weeks", "Team Size"],
        [
            str(summary.get("total_tasks", "N/A")),
            str(summary.get("total_hours", "N/A")),
            str(summary.get("estimated_weeks", "N/A")),
            str(len(analysis.get("team_overview", []))),
        ],
    ]
    cover_table = Table(cover_data, colWidths=[4 * cm] * 4)
    cover_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_PURPLE),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_GRAY, WHITE]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ("PADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(cover_table)

    team = analysis.get("team_overview", [])
    if team:
        story.append(Spacer(1, 0.3 * inch))
        story.append(Paragraph("<b>Team Members</b>", sub_heading_style))
        members_text = " • ".join([m.get("name", "") for m in team])
        story.append(Paragraph(members_text, body_style))

    story.append(PageBreak())

    # Team skills overview
    story.append(Paragraph("Team Skills Overview", heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE))
    story.append(Spacer(1, 0.2 * inch))

    for i, member in enumerate(team):
        color = hex_to_color(member.get("color", "#7C3AED"))
        member_name = member.get("name", "Unknown")
        level = member.get("experience_level", "Mid")
        skills = ", ".join(member.get("top_skills", []))
        strengths = member.get("strengths", "")

        member_data = [
            [Paragraph(f"<b>{member_name}</b>", ParagraphStyle("mn", fontSize=12, textColor=WHITE, fontName="Helvetica-Bold")),
             Paragraph(f"<b>{level}</b>", ParagraphStyle("lv", fontSize=11, textColor=WHITE, alignment=TA_RIGHT))],
        ]
        member_table = Table(member_data, colWidths=[12 * cm, 4 * cm])
        member_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), color),
            ("PADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(member_table)

        detail_data = [
            ["Skills:", skills],
            ["Strengths:", strengths],
        ]
        detail_table = Table(detail_data, colWidths=[3 * cm, 13 * cm])
        detail_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), LIGHT_GRAY),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
        ]))
        story.append(detail_table)
        story.append(Spacer(1, 0.15 * inch))

    story.append(PageBreak())

    # Task assignments
    story.append(Paragraph("Task Assignment Table", heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE))
    story.append(Spacer(1, 0.15 * inch))

    person_color_map = {m.get("name"): hex_to_color(m.get("color", "#7C3AED")) for m in team}

    task_header = [
        Paragraph("<b>#</b>", small_style),
        Paragraph("<b>Task</b>", small_style),
        Paragraph("<b>Assigned To</b>", small_style),
        Paragraph("<b>Priority</b>", small_style),
        Paragraph("<b>Hours</b>", small_style),
        Paragraph("<b>Week</b>", small_style),
    ]
    task_rows = [task_header]

    for task in analysis.get("tasks", []):
        person = task.get("assigned_to", "")
        task_rows.append([
            Paragraph(str(task.get("id", "")), small_style),
            Paragraph(task.get("task", ""), small_style),
            Paragraph(person, small_style),
            Paragraph(task.get("priority", ""), small_style),
            Paragraph(str(task.get("estimated_hours", "")), small_style),
            Paragraph(str(task.get("week", "")), small_style),
        ])

    task_table = Table(task_rows, colWidths=[1 * cm, 6.5 * cm, 4 * cm, 2 * cm, 1.5 * cm, 1.5 * cm])
    task_style = [
        ("BACKGROUND", (0, 0), (-1, 0), DARK_PURPLE),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
    ]
    for row_idx, task in enumerate(analysis.get("tasks", []), 1):
        person = task.get("assigned_to", "")
        c = person_color_map.get(person, PURPLE)
        light = colors.Color(c.red, c.green, c.blue, alpha=0.15)
        task_style.append(("BACKGROUND", (2, row_idx), (2, row_idx), light))

    task_table.setStyle(TableStyle(task_style))
    story.append(task_table)

    # Reason column table
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph("Assignment Reasoning", sub_heading_style))

    reason_header = [
        Paragraph("<b>Task</b>", small_style),
        Paragraph("<b>Reason for Assignment</b>", small_style),
    ]
    reason_rows = [reason_header]
    for task in analysis.get("tasks", []):
        reason_rows.append([
            Paragraph(task.get("task", ""), small_style),
            Paragraph(task.get("reason", ""), small_style),
        ])

    reason_table = Table(reason_rows, colWidths=[7 * cm, 9.5 * cm])
    reason_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_GRAY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_GRAY, WHITE]),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(reason_table)

    story.append(PageBreak())

    # Timeline
    story.append(Paragraph("Project Timeline", heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE))
    story.append(Spacer(1, 0.15 * inch))

    for week_data in analysis.get("timeline", []):
        week_num = week_data.get("week", "")
        focus = week_data.get("focus", "")
        story.append(Paragraph(f"<b>Week {week_num}: {focus}</b>", sub_heading_style))

        assignments = week_data.get("assignments", [])
        if assignments:
            week_rows = [[
                Paragraph("<b>Person</b>", small_style),
                Paragraph("<b>Task</b>", small_style),
                Paragraph("<b>Hours</b>", small_style),
            ]]
            for a in assignments:
                week_rows.append([
                    Paragraph(a.get("person", ""), small_style),
                    Paragraph(a.get("task", ""), small_style),
                    Paragraph(str(a.get("hours", "")), small_style),
                ])
            wt = Table(week_rows, colWidths=[5 * cm, 10 * cm, 1.5 * cm])
            wt.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PURPLE),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_GRAY, WHITE]),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
            ]))
            story.append(wt)
        story.append(Spacer(1, 0.15 * inch))

    story.append(PageBreak())

    # Collaboration notes
    story.append(Paragraph("Collaboration Notes", heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE))
    story.append(Spacer(1, 0.15 * inch))

    collab = analysis.get("collaboration_notes", {})

    story.append(Paragraph("<b>Recommended Working Pairs</b>", sub_heading_style))
    for pair in collab.get("pairs", []):
        members = " + ".join(pair.get("members", []))
        reason = pair.get("reason", "")
        story.append(Paragraph(f"• <b>{members}</b>: {reason}", body_style))

    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("<b>Potential Bottlenecks</b>", sub_heading_style))
    for b in collab.get("bottlenecks", []):
        story.append(Paragraph(f"⚠ {b}", body_style))

    # Workload distribution
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("<b>Workload Distribution</b>", sub_heading_style))

    wl_header = [
        Paragraph("<b>Person</b>", small_style),
        Paragraph("<b>Tasks</b>", small_style),
        Paragraph("<b>Hours</b>", small_style),
        Paragraph("<b>Share %</b>", small_style),
    ]
    wl_rows = [wl_header]
    for wl in summary.get("workload", []):
        wl_rows.append([
            Paragraph(wl.get("person", ""), small_style),
            Paragraph(str(wl.get("tasks", "")), small_style),
            Paragraph(str(wl.get("hours", "")), small_style),
            Paragraph(f"{wl.get('percentage', '')}%", small_style),
        ])

    wl_table = Table(wl_rows, colWidths=[7 * cm, 3 * cm, 3 * cm, 3.5 * cm])
    wl_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_PURPLE),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("PADDING", (0, 0), (-1, -1), 7),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_GRAY, WHITE]),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
    ]))
    story.append(wl_table)

    story.append(Spacer(1, 0.4 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(
        "Generated by AlignCrew — Powered by ASI:ONE AI",
        ParagraphStyle("Footer", fontSize=8, textColor=colors.HexColor("#9CA3AF"), alignment=TA_CENTER)
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
