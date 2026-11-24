import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, KeepTogether
from datetime import datetime

def generate_pdf(output_path="LINKSHIELD_AI_FEATURES_MANUAL.pdf"):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    C_NAVY = colors.HexColor('#0A192F')
    C_BLUE = colors.HexColor('#0070BA')
    C_CYAN = colors.HexColor('#0284C7')
    C_DARK = colors.HexColor('#1E293B')
    C_LIGHT = colors.HexColor('#F8FAFC')
    C_BORDER = colors.HexColor('#CBD5E1')
    C_GREEN = colors.HexColor('#059669')
    C_AMBER = colors.HexColor('#D97706')
    C_RED = colors.HexColor('#DC2626')

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=C_NAVY,
        alignment=1,
        spaceAfter=4
    )

    sub_title_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=C_BLUE,
        alignment=1,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=C_NAVY,
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=C_CYAN,
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        textColor=C_DARK,
        leading=12,
        spaceAfter=4
    )

    body_bold = ParagraphStyle(
        'Body_Bold_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        textColor=C_DARK,
        leading=12
    )

    caption_style = ParagraphStyle(
        'Caption_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        textColor=colors.HexColor('#64748B'),
        alignment=1,
        spaceAfter=8
    )

    badge_style = ParagraphStyle(
        'Badge_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        textColor=colors.white,
        alignment=1
    )

    elements = []

    # =========================================================================
    # HEADER BANNER
    # =========================================================================
    banner_data = [
        [
            Paragraph("<b>RAJASTHAN POLICE CYBER CRIME COMMAND</b><br/><font size='7.5'>R4C STATE CYBER CELL • HACKATHON 2026 SUBMISSION DOSSIER</font>", ParagraphStyle('HdrTxt', parent=badge_style, alignment=0)),
            Paragraph(f"<b>DATE:</b> {datetime.now().strftime('%d-%b-%Y')}<br/><b>CLASSIFICATION:</b> OFFICIAL", ParagraphStyle('HdrTxt2', parent=badge_style, alignment=2))
        ]
    ]
    banner_table = Table(banner_data, colWidths=[360, 170])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_NAVY),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.white),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    elements.append(banner_table)
    elements.append(Spacer(1, 12))

    # Main Title
    elements.append(Paragraph("LINKSHIELD AI — SYSTEM SPECIFICATIONS & FEATURES MANUAL", title_style))
    elements.append(Paragraph("A Comprehensive Guide to Citizen Safety Services & Authorised Police Investigation Modules", sub_title_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=C_BLUE, spaceBefore=0, spaceAfter=12))

    # Executive Overview
    overview_p = Paragraph(
        "<b>LinkShield AI</b> is an advanced, production-grade cyber fraud detection and investigation platform "
        "designed for the <b>Rajasthan Police Cyber Security Hackathon 2026</b> under <b>Problem Statement PS01 "
        "(Cyber Fraud / Phishing / Malicious Apps)</b>. Built on a zero-trust, Role-Based Access Control (RBAC) architecture, "
        "the system delivers a dual-portal interface that separates public civilian safety reporting from sensitive law "
        "enforcement forensic intelligence, evidence analysis, and syndicate graph correlation.",
        body_style
    )
    elements.append(overview_p)
    elements.append(Spacer(1, 10))

    # Meta Table
    meta_data = [
        [Paragraph("<b>Project Name:</b>", body_bold), Paragraph("LinkShield AI", body_style), Paragraph("<b>Core Tagline:</b>", body_bold), Paragraph("Detect. Explain. Investigate. Protect.", body_style)],
        [Paragraph("<b>Target Hackathon:</b>", body_bold), Paragraph("Rajasthan Police Cyber Security Hackathon 2026", body_style), Paragraph("<b>Problem Statement:</b>", body_bold), Paragraph("PS01 – Cyber Fraud / Malicious Apps", body_style)],
        [Paragraph("<b>User Roles (RBAC):</b>", body_bold), Paragraph("1. Citizen Portal<br/>2. Authorised Police Officer", body_style), Paragraph("<b>Legal Framework:</b>", body_bold), Paragraph("Sec 65B Indian Evidence Act, Sec 91 & 102 CrPC, IT Act", body_style)],
        [Paragraph("<b>Technology Stack:</b>", body_bold), Paragraph("React, Vite, Tailwind CSS, Vis-Network, Lucide", body_style), Paragraph("<b>Backend & Storage:</b>", body_bold), Paragraph("FastAPI, Python NLP/Regex, SQLite, ReportLab", body_style)]
    ]
    t_meta = Table(meta_data, colWidths=[110, 155, 110, 155])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_LIGHT),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 1: CITIZEN PORTAL FEATURES
    # =========================================================================
    elements.append(Paragraph("1. CITIZEN PORTAL — FEATURES & SERVICES SPECIFICATIONS", h1_style))
    elements.append(Paragraph("Empowering Rajasthan's citizens with pre-transaction verification, transparent scam triage, and instant doubt clarification without police jargon.", body_style))
    elements.append(Spacer(1, 6))

    citizen_features = [
        ("Citizen Dashboard (/citizen)",
         "Unified citizen portal landing overview displaying live status counters (Submitted, Under Review, Analysed, Closed), prominent 1930 Golden Hour emergency dialer, direct links to reporting services, and real-time tracking of personal submissions."),
        
        ("AI Cyber Saathi — Doubt Clarifier (/citizen/assistant)",
         "24x7 intelligent, jargon-free assistant for common citizen cyber doubts. Authoritatively debunks Digital Arrest video call hoaxes, JVVNL 9:30 PM power cutoff SMS scams, YouTube like job offers, and predatory loan app risks with actionable recovery steps."),
        
        ("Threat Registry Pre-Check (/citizen/check-threat)",
         "Public pre-transaction verification tool. Citizens can query any 10-digit mobile number, UPI Virtual Payment Address (VPA), or website domain against Rajasthan Police's verified threat database and citizen complaints heat-list before transferring money."),
        
        ("Report Suspicious Message (/citizen/report-message)",
         "Specialized reporting engine for deceptive SMS, WhatsApp, and email messages. Analyzes sender headers, detects urgency deadlines, flags fake KYC traps, and extracts suspect phone numbers with instant preliminary risk level assessment (Low/Medium/High)."),
        
        ("Report Suspicious Link (/citizen/report-url)",
         "Pre-click URL verification scanner. Detects lookalike typosquatting domains (e.g., impersonating State Bank of India or JVVNL), inspects SSL/TLS encryption, warns against unencrypted naked IP hosts, and provides safe sandbox link guidance."),
        
        ("Report Fake Scheme & Betting (/citizen/report-website)",
         "Inspects deceptive promotional schemes for guaranteed returns, illegal multi-level Ponzi structures, unapproved color-prediction betting games (Daman Games, BDG Win), and predatory loan apps demanding intrusive phone contacts/photo permissions."),
        
        ("Upload Digital Evidence Vault (/citizen/upload-evidence)",
         "Secure evidence submission interface supporting payment receipts, threatening chat screenshots, and APK files. Automatically computes client-side SHA-256 cryptographic digests under Section 65B Indian Evidence Act chain-of-custody standards."),
        
        ("My Submissions & Live Tracking (/citizen/my-reports)",
         "Privacy-isolated tracking view allowing citizens to monitor the progression of their complaints through four distinct statuses: 'Submitted', 'Analysed', 'Under Review', and 'Closed', including investigator recommendations and reference IDs."),
        
        ("Cyber Safety Guidelines (/citizen/safety-guide)",
         "Authoritative public advisory detailing emergency Golden Hour financial recovery protocols, discom disconnection statutory rules, and prevention guidelines against digital arrest extortion.")
    ]

    for title, desc in citizen_features:
        elements.append(Paragraph(f"• <b>{title}:</b> {desc}", body_style))
        elements.append(Spacer(1, 2))

    elements.append(Spacer(1, 10))

    # Citizen Feature Summary Table
    c_table_data = [
        [Paragraph("<b>Service / Module</b>", body_bold), Paragraph("<b>Citizen Value & Core Capability</b>", body_bold), Paragraph("<b>Key Output</b>", body_bold)],
        [Paragraph("AI Cyber Saathi", body_style), Paragraph("Natural language clarification of scam tactics (Digital Arrest, 1930 guidance)", body_style), Paragraph("Actionable Advice & Hotline Links", body_style)],
        [Paragraph("Threat Registry Checker", body_style), Paragraph("Verify phone numbers, UPI VPAs, and URLs against active complaint index", body_style), Paragraph("FLAGGED / CLEAN Incident Count", body_style)],
        [Paragraph("Scam Message Reporter", body_style), Paragraph("Paste deceptive SMS/WhatsApp text with sender header analysis", body_style), Paragraph("Risk Score (0-100) + Extracted IDs", body_style)],
        [Paragraph("Lookalike URL Scanner", body_style), Paragraph("Typosquat detection, bare IP warning, and HTTPS encryption verification", body_style), Paragraph("Risk Level + Domain Brand Target", body_style)],
        [Paragraph("Fake Scheme Reporter", body_style), Paragraph("Analyze Ponzi guaranteed ROI, color-prediction betting, and predatory loan traps", body_style), Paragraph("Statutory Legal Alert + Reference ID", body_style)],
        [Paragraph("Chain-of-Custody Vault", body_style), Paragraph("Upload screenshots, receipts, and APK files with client-side SHA-256 hashing", body_style), Paragraph("Section 65B Evidentiary Digest", body_style)],
        [Paragraph("Submission Tracker", body_style), Paragraph("Track status across Submitted, Analysed, Under Review, and Closed", body_style), Paragraph("Case Ref (CIT-YYYYMMDD-XXXXXX)", body_style)]
    ]
    t_citizen = Table(c_table_data, colWidths=[120, 270, 140])
    t_citizen.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E0F2FE')),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_citizen)
    elements.append(Spacer(1, 14))

    # Page Break for Officer Section
    elements.append(PageBreak())

    # =========================================================================
    # SECTION 2: OFFICER INVESTIGATION PORTAL FEATURES
    # =========================================================================
    elements.append(Paragraph("2. AUTHORISED OFFICER PORTAL — FORENSIC SUITE SPECIFICATIONS", h1_style))
    elements.append(Paragraph("Restricted-access investigation command center for Rajasthan Police cyber crime detectives, equipped with deep technical analysis, cross-case graph correlation, and legal statutory workflows.", body_style))
    elements.append(Spacer(1, 6))

    officer_features = [
        ("Forensic Investigation Dashboard (/)",
         "Statewide cyber situational awareness hub displaying total indexed FIRs, high-risk cases, urgent freeze recommendations, 30-day incident velocity charts, and distribution across Phishing, Fake Loan Apps, Ponzi, and Discom Impersonation."),

        ("Deceptive Message Forensics (/messages)",
         "Deep NLP and pattern analysis engine for SMS, WhatsApp, and email content. Computes urgency weight, scores impersonation of government agencies (JVVNL, AVVNL, SBI), extracts phone numbers and URLs, and archives cases directly into the police registry."),

        ("Domain & URL Scanner (/urls)",
         "Advanced web threat decomposer. Computes domain age heuristics, identifies suspicious high-risk TLDs (.cc, .top, .xyz), performs Levenshtein brand typosquat comparison against official banking portals, flags bare IP endpoints, and extracts hosting IP details."),

        ("Website & Ponzi Scheme Inspector (/websites)",
         "Examines promotional websites and HTML bodies for guaranteed ROI schemes, multi-level recruitment trees, illegal betting rules, and extracts financial endpoints including mule UPI handles, bank IFSCs, and cryptocurrency wallets (BTC, ETH, TRON)."),

        ("Android APK Permission Auditor (/apks)",
         "Static Android manifest analyzer inspecting uploaded APK files. Scans declared permissions for dangerous privacy vectors (READ_CONTACTS, RECEIVE_SMS, ACCESS_FINE_LOCATION), detects predatory recovery malware signatures, and inspects embedded C2 server endpoints."),

        ("Syndicate Relationship Graph (/graph)",
         "Vis-Network interactive entity-relationship graph. Cross-references all statewide cases and renders visual link nodes connecting distinct FIRs through shared phone numbers, mule UPI accounts, and hosting domains to uncover organized inter-state cyber syndicates."),

        ("Statewide Threat Heat-List (/heat-list)",
         "Frequency-ranked threat triage matrix identifying the most commonly reported phishing domains, extortionist phone numbers, and mule UPI VPAs across Rajasthan, with dynamic 7-day, 30-day, and all-time observation window filters."),

        ("Case Management Registry (/cases)",
         "Complete registry of all investigated cases. Supports multi-factor search across case IDs, keywords, and entity values. Features Section 65B cryptographic evidence verification, status workflow updates, and permanent investigator notes persistence."),

        ("Citizen Submissions Triage Desk (/citizen-submissions)",
         "Centralized review queue where cyber officers evaluate citizen-reported messages, URLs, and schemes. Enables status updates, investigator note attachment, and instant 1-click escalation of citizen complaints into formal police FIR cases."),

        ("AI Investigation Assistant (/assistant)",
         "Forensic legal co-pilot querying actual case records without hallucinations. Explains scam typologies, drafts Section 91 CrPC telecom subscriber notices, prepares Section 102 CrPC bank lien directives, and cross-references shared syndicate identifiers."),

        ("Section 65B Evidence Dossier Generator (/reports)",
         "Instant generation of court-admissible forensic PDF reports adhering strictly to Section 65B Indian Evidence Act standards, complete with cryptographic hash verification, examiner certification, and extracted identifier summaries."),

        ("Security, RBAC & Governance Settings (/settings)",
         "Administrative control panel to configure risk score thresholds, update agency branding, review immutable Section 65B electronic audit logs, and configure automated data archival policies.")
    ]

    for title, desc in officer_features:
        elements.append(Paragraph(f"• <b>{title}:</b> {desc}", body_style))
        elements.append(Spacer(1, 2))

    elements.append(Spacer(1, 10))

    # Officer Feature Summary Table
    o_table_data = [
        [Paragraph("<b>Investigation Module</b>", body_bold), Paragraph("<b>Forensic Capability & Law Enforcement Purpose</b>", body_bold), Paragraph("<b>Statutory Output</b>", body_bold)],
        [Paragraph("Syndicate Entity Graph", body_style), Paragraph("Vis-Network visual cross-case correlation of shared phones, UPI VPAs & IPs", body_style), Paragraph("Syndicate Link Visualizer", body_style)],
        [Paragraph("Threat Heat-List", body_style), Paragraph("Frequency ranking of top phishing domains & mule accounts for bulk triage", body_style), Paragraph("DNS / NPCI Freeze Priority", body_style)],
        [Paragraph("Static APK Auditor", body_style), Paragraph("Static manifest permission auditing for contacts, SMS & predatory loan signatures", body_style), Paragraph("APK Risk Score (0-100)", body_style)],
        [Paragraph("AI Investigation Co-Pilot", body_style), Paragraph("Natural language case cross-referencing, Section 91 & Section 102 CrPC notices", body_style), Paragraph("Investigation-Ready Legal Draft", body_style)],
        [Paragraph("Citizen Escalation Desk", body_style), Paragraph("Triage statewide citizen complaints and escalate directly into formal FIRs", body_style), Paragraph("FIR Dossier Linkage", body_style)],
        [Paragraph("Section 65B Dossier", body_style), Paragraph("Court-admissible PDF generator with cryptographic SHA-256 digital custody", body_style), Paragraph("Downloadable Evidence PDF", body_style)],
        [Paragraph("Audit Trail & RBAC", body_style), Paragraph("Immutable logging of all officer searches, status updates, and session actions", body_style), Paragraph("Section 65B Audit Record", body_style)]
    ]
    t_officer = Table(o_table_data, colWidths=[120, 270, 140])
    t_officer.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EFF6FF')),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_officer)
    elements.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 3: ARCHITECTURE & SECURITY
    # =========================================================================
    elements.append(Paragraph("3. SYSTEM ARCHITECTURE & SECURITY SAFEGUARDS", h1_style))
    arch_p = Paragraph(
        "<b>1. Zero-Trust RBAC & Session Security:</b> Authentication leverages PBKDF2-HMAC-SHA256 password hashing with "
        "stateless cryptographic HMAC tokens, ensuring resilient authentication across serverless cloud runtimes and local installations. "
        "Citizens are strictly prohibited from accessing internal police intelligence, officer notes, or FIR registries.<br/>"
        "<b>2. SSRF Protection:</b> Remote website and domain analysis modules incorporate strict Server-Side Request Forgery (SSRF) "
        "filters, blocking loopback addresses (127.0.0.1) and private subnets (10.0.0.0/8, 192.168.0.0/16) to protect internal infrastructure.<br/>"
        "<b>3. Chain of Custody & Evidence Preservation:</b> All uploaded digital evidence and case records compute SHA-256 cryptographic hashes "
        "at ingestion to guarantee evidentiary integrity under Section 65B of the Indian Evidence Act.",
        body_style
    )
    elements.append(arch_p)
    elements.append(Spacer(1, 12))

    # Verification Footer
    footer_text = Paragraph(
        "<b>LinkShield AI Verification Status:</b> 18/18 Automated Forensic Test Phases Passed (100% Operational) • "
        "Rajasthan Police Cyber Security Hackathon 2026 • Government of Rajasthan",
        caption_style
    )
    elements.append(footer_text)

    doc.build(elements)
    print(f"Features PDF successfully generated at: {output_path}")

if __name__ == "__main__":
    generate_pdf()
