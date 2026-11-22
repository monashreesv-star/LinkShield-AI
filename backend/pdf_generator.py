import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from datetime import datetime
from typing import Dict, Any

def generate_case_pdf(case_data: Dict[str, Any], output_path: str = None) -> str:
    """Generates an investigation-ready Section 65B evidence dossier PDF."""
    reports_dir = "/tmp/reports" if os.environ.get("VERCEL") else "reports"
    if not output_path:
        os.makedirs(reports_dir, exist_ok=True)
        output_path = f"{reports_dir}/Case_{case_data['case_id']}.pdf"

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=colors.HexColor('#0A192F'),
        alignment=1, # Center
        spaceAfter=4
    )
    
    sub_header_style = ParagraphStyle(
        'SubHeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor('#0070BA'),
        alignment=1,
        spaceAfter=15
    )

    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#0A192F'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )

    story = []

    # Title & Header
    story.append(Paragraph("RAJASTHAN POLICE CYBER CRIME INVESTIGATION CELL", header_style))
    story.append(Paragraph("LINKEDSHIELD AI — CYBER THREAT FORENSIC DOSSIER (SEC 65B EVIDENCE)", sub_header_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0A192F'), spaceAfter=12))

    # Case Overview Table
    risk_color = colors.HexColor('#DC2626') if case_data['risk_level'] == 'HIGH' else (
        colors.HexColor('#D97706') if case_data['risk_level'] == 'MEDIUM' else colors.HexColor('#16A34A')
    )

    overview_data = [
        [
            Paragraph("<b>Case Reference ID:</b>", body_style),
            Paragraph(f"<b>{case_data['case_id']}</b>", body_style),
            Paragraph("<b>Investigation Date:</b>", body_style),
            Paragraph(case_data['created_at'], body_style)
        ],
        [
            Paragraph("<b>Threat Vector:</b>", body_style),
            Paragraph(case_data['source_type'], body_style),
            Paragraph("<b>Risk Assessment:</b>", body_style),
            Paragraph(f"<font color='{risk_color.hexval()}'><b>{case_data['risk_level']} ({case_data['risk_score']}/100)</b></font>", body_style)
        ],
        [
            Paragraph("<b>Evidence SHA-256:</b>", body_style),
            Paragraph(f"<font size='7'>{case_data['evidence_hash']}</font>", body_style),
            Paragraph("<b>Classification:</b>", body_style),
            Paragraph("Actionable Cyber Threat", body_style)
        ]
    ]

    t_overview = Table(overview_data, colWidths=[1.4*inch, 2.2*inch, 1.4*inch, 2.2*inch])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_overview)
    story.append(Spacer(1, 12))

    # Raw Evidentiary Input
    story.append(Paragraph("1. EVIDENTIARY SUBMISSION / RAW THREAT CONTENT", section_title))
    raw_box = [[Paragraph(f"<font face='Courier' size='8'>{case_data['full_input']}</font>", body_style)]]
    t_raw = Table(raw_box, colWidths=[7.2*inch])
    t_raw.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_raw)
    story.append(Spacer(1, 10))

    # Extracted Actionable Forensic Identifiers
    story.append(Paragraph("2. EXTRACTED FORENSIC IDENTIFIERS (NPCI / TELECOM ACTION)", section_title))
    identifiers = case_data.get("identifiers", [])
    
    if identifiers:
        id_table_data = [["Entity Type", "Extracted Identifier", "Actionable Directive"]]
        for item in identifiers:
            etype = item.get("entity_type", "").upper()
            eval_str = item.get("entity_value", "")
            directive = "Freeze VPA / Reverse Lien" if "UPI" in etype else (
                "Issue CDR & Location Subpoena" if "PHONE" in etype else "Request Emergency DNS Takedown"
            )
            id_table_data.append([etype, eval_str, directive])

        t_id = Table(id_table_data, colWidths=[1.8*inch, 3.2*inch, 2.2*inch])
        t_id.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0A192F')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 9),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_id)
    else:
        story.append(Paragraph("No direct structured payment or telecom identifiers were extracted.", body_style))
    story.append(Spacer(1, 10))

    # Explainable Risk Breakdown
    story.append(Paragraph("3. EXPLAINABLE RISK INDICATORS & EVIDENCE LOG", section_title))
    indicators = case_data.get("indicators", [])
    ind_data = [["Triggered Rule / Indicator", "Weight", "Forensic Technical Reasoning"]]
    for ind in indicators:
        ind_data.append([
            Paragraph(f"<b>{ind.get('name', 'Indicator')}</b>", body_style),
            f"+{ind.get('score', 0)}",
            Paragraph(ind.get('reason', ''), body_style)
        ])

    t_ind = Table(ind_data, colWidths=[2.2*inch, 0.8*inch, 4.2*inch])
    t_ind.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_ind)
    story.append(Spacer(1, 10))

    # Connected Cases / Syndicate Links
    connected = case_data.get("connected_cases", [])
    if connected:
        story.append(Paragraph("4. CROSS-CASE SYNDICATE CORRELATION LINKS", section_title))
        conn_rows = [["Linked Case ID", "Shared Indicator", "Risk Level", "Date"]]
        for c in connected[:4]:
            conn_rows.append([c.get("case_id", ""), f"{c.get('entity_type','').upper()}: {c.get('entity_value','')}", c.get("risk_level",""), c.get("created_at","")])
        t_conn = Table(conn_rows, colWidths=[2.0*inch, 2.6*inch, 1.2*inch, 1.4*inch])
        t_conn.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0A192F')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 8),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(t_conn)
        story.append(Spacer(1, 10))

    # Investigator Notes
    notes = case_data.get("notes", [])
    if notes:
        story.append(Paragraph("5. INVESTIGATOR LOG & EVIDENCE ANNOTATIONS", section_title))
        for n in notes:
            story.append(Paragraph(f"• <b>[{n.get('created_at','')}] {n.get('author','Investigator')}:</b> {n.get('note_text','')}", body_style))
        story.append(Spacer(1, 10))

    # Directive & Recommendation
    story.append(Paragraph("6. INVESTIGATOR DIRECTIVE & CITIZEN ADVISORY", section_title))
    story.append(Paragraph(f"<b>Recommendation:</b> {case_data['recommendation']}", body_style))
    story.append(Spacer(1, 15))

    # Section 65B Legal Certificate
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94A3B8'), spaceAfter=8))
    cert_text = """
    <b>ELECTRONIC RECORD CERTIFICATE (UNDER SECTION 65B OF INDIAN EVIDENCE ACT, 1872)</b><br/>
    This electronic document is produced by LinkedShield AI automated digital forensic engine operating under normal 
    parameters. The raw submission was cryptographically hashed with SHA-256 algorithm upon ingestion to ensure strict 
    chain of custody. The data represents an unmanipulated digital record suitable for production in court proceedings.
    """
    story.append(Paragraph(cert_text, ParagraphStyle('Cert', parent=body_style, fontSize=7, leading=10, textColor=colors.HexColor('#64748B'))))

    doc.build(story)
    return output_path
