import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck(filename="LinkedShield_AI_Action_Plan.pptx"):
    prs = Presentation()
    # Set 16:9 widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Palette
    C_NAVY_DARK = RGBColor(10, 25, 47)      # #0A192F Deep Police Navy
    C_CARD_BG   = RGBColor(18, 38, 70)      # #122646 Card Background
    C_CYAN      = RGBColor(0, 212, 255)     # #00D4FF Tech Accent
    C_WHITE     = RGBColor(255, 255, 255)   # #FFFFFF
    C_GRAY_LIGHT= RGBColor(200, 210, 225)   # #C8D2E1 Subtext
    C_AMBER     = RGBColor(255, 179, 0)     # #FFB300 Alert/Medium
    C_RED       = RGBColor(255, 82, 82)     # #FF5252 High Risk
    C_GREEN     = RGBColor(0, 230, 118)     # #00E676 Safe/Success

    blank_layout = prs.slide_layouts[6]

    def set_slide_background(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="PS01: CYBER FRAUD / PHISHING / MALICIOUS APPS"):
        # Category pill/text
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_CYAN

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.7))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = C_WHITE

    def add_card(slide, left, top, width, height, title, items, badge="", badge_color=C_CYAN):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = RGBColor(30, 58, 100)
        card.line.width = Pt(1.2)

        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        # Card Title
        p_title = tf.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(16)
        p_title.font.bold = True
        p_title.font.color.rgb = C_CYAN

        if badge:
            p_badge = tf.add_paragraph()
            p_badge.text = f"[{badge}]"
            p_badge.font.size = Pt(10)
            p_badge.font.bold = True
            p_badge.font.color.rgb = badge_color
            p_badge.space_after = Pt(6)

        for item in items:
            p = tf.add_paragraph()
            p.text = f"• {item}"
            p.font.size = Pt(12)
            p.font.color.rgb = C_GRAY_LIGHT
            p.space_after = Pt(4)

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, C_NAVY_DARK)

    # Accent decorative bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.2), Inches(3.8))
    bar.fill.solid()
    bar.fill.fore_color.rgb = C_CYAN
    bar.line.fill.background()

    tb1 = s1.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(11.0), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "RAJASTHAN POLICE HACKATHON | PROBLEM STATEMENT PS01"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = C_CYAN
    p0.space_after = Pt(12)

    p1 = tf1.add_paragraph()
    p1.text = "LinkedShield AI"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE
    p1.space_after = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = "Unified Cyber Threat Intelligence & Phishing Investigation Platform"
    p2.font.size = Pt(22)
    p2.font.color.rgb = C_GRAY_LIGHT
    p2.space_after = Pt(18)

    p3 = tf1.add_paragraph()
    p3.text = "A multi-modal AI platform analyzing suspicious SMS/WhatsApp messages, lookalike URLs, fraudulent websites & rogue APKs with explainable risk scoring, identifier cross-correlation and court-ready police dossiers."
    p3.font.size = Pt(13)
    p3.font.color.rgb = RGBColor(160, 180, 205)
    p3.space_after = Pt(24)

    p4 = tf1.add_paragraph()
    p4.text = "Team: LinkedShield Innovators  |  Submission Date: November 2026  |  Track: Cyber Defense & AI Forensics"
    p4.font.size = Pt(12)
    p4.font.bold = True
    p4.font.color.rgb = C_CYAN

    # -------------------------------------------------------------
    # SLIDE 2: Problem Statement & Operational Challenges
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, C_NAVY_DARK)
    add_header(s2, "The Problem Landscape: Fragmented Threats & Coordinated Scams")

    add_card(s2, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "1. Multi-Vector Attack Surge",
             [
                 "Citizens face relentless fraud via SMS, WhatsApp, Telegram, and rogue APKs.",
                 "High-impact lures: Fake electricity bill cutoff, KYC suspension, instant pre-approved loans, illegal betting & 30% monthly ROI Ponzi schemes.",
                 "Vulnerable citizens lose life savings while fake loan apps extort victims through contact harvesting."
             ], "CRITICAL CITIZEN RISK", C_RED)

    add_card(s2, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "2. The Police Blind Spot",
             [
                 "Siloed Case Reporting: An SMS is filed in one portal, a malicious link in another, and a fraud UPI ID in a third.",
                 "Common Infrastructure Re-use: Scammers reuse identical phone numbers, UPI VPAs, bank accounts & domains across hundreds of victims.",
                 "Without correlation, police treat each FIR as an isolated event, missing organized syndicates."
             ], "INVESTIGATION BOTTLENECK", C_AMBER)

    add_card(s2, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "3. The Hackathon Objective",
             [
                 "Build a unified platform that ingests messages, URLs, websites & APKs.",
                 "Extract actionable forensic identifiers (UPI IDs, phone numbers, crypto wallets, domains).",
                 "Provide explainable risk indicators (not opaque black-box AI).",
                 "Generate court-admissible Section 65B evidence reports."
             ], "MANDATE", C_CYAN)

    # -------------------------------------------------------------
    # SLIDE 3: Proposed Solution - LinkedShield AI
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, C_NAVY_DARK)
    add_header(s3, "Proposed Solution: LinkedShield AI Unified Architecture")

    add_card(s3, Inches(0.8), Inches(1.6), Inches(3.6), Inches(2.5),
             "Multi-Modal Ingestion",
             [
                 "Analyzes SMS, WhatsApp, Telegram & Email text.",
                 "Inspects URLs, shortened links & lookalikes.",
                 "Parses fraudulent investment & betting HTML.",
                 "Static manifest auditing of Android APKs."
             ], "INPUT LAYER")

    add_card(s3, Inches(4.8), Inches(1.6), Inches(3.6), Inches(2.5),
             "Explainable AI Engine",
             [
                 "Rule-based + NLP contextual urgency detector.",
                 "Lookalike domain & typosquatting calculator.",
                 "Transparent additive scoring (0 - 100).",
                 "Actionable citizen advisories + police evidence."
             ], "ANALYTICS ENGINE")

    add_card(s3, Inches(8.8), Inches(1.6), Inches(3.6), Inches(2.5),
             "Cross-Case Correlation Graph",
             [
                 "Automated entity extraction: Phone, UPI, Bank, Host.",
                 "Bi-directional graph linking related cases.",
                 "Uncovers organized scam rings sharing UPI VPAs.",
                 "Real-time fraud cluster visualization."
             ], "INTELLIGENCE LAYER", C_CYAN)

    add_card(s3, Inches(0.8), Inches(4.3), Inches(5.6), Inches(2.5),
             "Police Investigation Command Center",
             [
                 "Full-text search across all prior FIRs and scam records.",
                 "Live heat-list of top repeated malicious numbers, domains & UPI IDs.",
                 "Role-based views for Cyber Cell investigators and citizens.",
                 "Real-time threat level statistics & geographical tagging."
             ], "INVESTIGATOR WORKFLOW")

    add_card(s3, Inches(6.8), Inches(4.3), Inches(5.6), Inches(2.5),
             "Court-Ready Automated Evidence Dossier",
             [
                 "One-click generation of formal PDF investigation dossiers.",
                 "Includes hash digests, extracted regex entities, and triggered indicators.",
                 "Structured for compliance with Section 65B of Indian Evidence Act.",
                 "Reduces manual report preparation time from hours to seconds."
             ], "LEGAL FORENSICS", C_GREEN)

    # -------------------------------------------------------------
    # SLIDE 4: Core Technical Modules
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, C_NAVY_DARK)
    add_header(s4, "Core Detection Capabilities Across Threat Vectors")

    add_card(s4, Inches(0.8), Inches(1.6), Inches(2.7), Inches(5.2),
             "Message & NLP Analysis",
             [
                 "Urgency & Threat Detection ('bill cutoff', 'police warrant', 'PAN locked').",
                 "Brand Impersonation (SBI, HDFC, JVVNL, India Post, Income Tax).",
                 "Fake KYC & SIM expiry triggers.",
                 "Work-from-home & part-time review scam pattern matching.",
                 "URL & phone number extraction via compiled regex."
             ], "MODULE 1")

    add_card(s4, Inches(3.8), Inches(1.6), Inches(2.7), Inches(5.2),
             "URL & Phishing Engine",
             [
                 "Typosquatting & Levenshtein distance against 100+ trusted Indian domains.",
                 "Uncommon TLD detection (.xyz, .top, .cc, .pw, .online).",
                 "Redirect-chain tracer for shortened URLs (bit.ly, t.co).",
                 "Missing SSL / IP-based URL alerts.",
                 "Synthetic sample blacklist matching."
             ], "MODULE 2")

    add_card(s4, Inches(6.8), Inches(1.6), Inches(2.7), Inches(5.2),
             "Website & Scheme Scraper",
             [
                 "Static, sandboxed HTML parser (BeautifulSoup).",
                 "Ponzi & MLM keyword flags ('guaranteed 30% ROI', 'referral tree').",
                 "Illegal betting & color prediction signatures.",
                 "Automated extraction of UPI IDs (@okhdfcbank, @paytm), IFSC & Crypto wallets.",
                 "Safe snapshot generation without script execution."
             ], "MODULE 3")

    add_card(s4, Inches(9.8), Inches(1.6), Inches(2.7), Inches(5.2),
             "Android APK Inspector",
             [
                 "Static manifest auditing without dynamic execution.",
                 "Flags dangerous permission sets: READ_CONTACTS, READ_SMS, CAMERA.",
                 "Identifies predatory loan app profiles (loan calculator needing contacts).",
                 "Extracts hardcoded command & control (C2) URLs and IP addresses.",
                 "Package metadata & signature inspection."
             ], "MODULE 4")

    # -------------------------------------------------------------
    # SLIDE 5: Explainable Risk Scoring Engine
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, C_NAVY_DARK)
    add_header(s5, "Explainable Risk Assessment: Transparent, Auditable Scoring")

    add_card(s5, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Risk Calibration Matrix",
             [
                 "LOW RISK (0 - 24):",
                 "Clean communications, verified domain structures, HTTPS present, standard business language.",
                 "",
                 "MEDIUM RISK (25 - 49):",
                 "Urgent phrasing, newly observed unranked domain, or missing SSL without direct fraud keywords.",
                 "",
                 "HIGH RISK (50 - 100):",
                 "Impersonation + urgent cutoff threats, lookalike domain, known blacklist hit, or predatory APK permissions."
             ], "SCORING RUBRIC", C_CYAN)

    add_card(s5, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Additive Weight Indicators",
             [
                 "• Impersonation of Bank/Govt: +25 pts",
                 "• Lookalike / Typosquat Domain: +25 pts",
                 "• Urgent / Coercive Language: +20 pts",
                 "• Fake KYC / Verification Demand: +20 pts",
                 "• Guaranteed Financial Returns: +20 pts",
                 "• Blacklist / Sample DB Hit: +35 pts",
                 "• Suspicious TLD / Missing SSL: +15 pts",
                 "• APK Contact/SMS Harvesting: +30 pts"
             ], "SAMPLE WEIGHTS", C_AMBER)

    add_card(s5, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Explainability for Court & Citizen",
             [
                 "Never a 'Black Box': Every score displays the exact list of triggered rules with line-by-line evidence.",
                 "",
                 "Citizen Advisory Mode: Immediate red alert banner advising non-technical users ('DO NOT share OTP', 'DO NOT send funds').",
                 "",
                 "Police Evidence Mode: Technical audit trail listing raw regex matches, HTTP headers, and domain parameters."
             ], "TRANSPARENCY", C_GREEN)

    # -------------------------------------------------------------
    # SLIDE 6: Cross-Case Correlation & Threat Intelligence
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, C_NAVY_DARK)
    add_header(s6, "Syndicate Unmasking: Identifier Relationship Graph")

    add_card(s6, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2),
             "How Identifier Correlation Works",
             [
                 "Cyber syndicates run dozens of parallel campaigns (electricity bill, courier fraud, loan apps) but route stolen funds to limited financial endpoints.",
                 "",
                 "Automated Entity Linkage:",
                 "• UPI ID Extraction: Normalizes and indexes VPAs across all submitted cases.",
                 "• Phone Number Extraction: Links caller IDs from WhatsApp/SMS to fraudulent bank support lines.",
                 "• Domain & Host Clustering: Groups domains hosted on identical IP subnets.",
                 "",
                 "Case Convergence:",
                 "When Case #104 (SMS scam) and Case #218 (Fake Website) both contain UPI ID 'refund77@ybl', LinkedShield AI automatically bridges both FIRs into an active Syndicate Cluster."
             ], "CORRELATION ENGINE", C_CYAN)

    add_card(s6, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2),
             "Live Intelligence Heat-List & Search",
             [
                 "Unified Entity Search:",
                 "Investigators can enter any UPI ID, phone number or domain to immediately surface every historical case, total victim count, and cumulative financial exposure.",
                 "",
                 "Scam Trending Heat-List:",
                 "• Top 10 Most Active Fraud Phone Numbers",
                 "• Top 10 Phishing Domains Trending in Rajasthan",
                 "• Top 10 Compromised Mule UPI Accounts",
                 "",
                 "Law Enforcement Action:",
                 "Enables rapid bulk freezing requests to NPCI/Banks and emergency DNS takedown notices with consolidated multi-case evidence."
             ], "INVESTIGATIVE ADVANTAGE", C_GREEN)

    # -------------------------------------------------------------
    # SLIDE 7: System Architecture & Workflow Diagram
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, C_NAVY_DARK)
    add_header(s7, "End-to-End System Workflow & Technical Architecture")

    add_card(s7, Inches(0.8), Inches(1.6), Inches(2.7), Inches(5.2),
             "1. Input Ingestion",
             [
                 "• Citizen Portal & Cyber Cell Officer Console",
                 "• Raw text: SMS, WhatsApp, Email",
                 "• URLs & Shortlinks",
                 "• HTML Web Target URL / Saved Page",
                 "• APK Package Upload"
             ], "STEP 1")

    add_card(s7, Inches(3.8), Inches(1.6), Inches(2.7), Inches(5.2),
             "2. Detection & Extraction",
             [
                 "• Regex Entity Extractor (UPI, Phone, IFSC)",
                 "• NLP Urgency & Impersonation Engine",
                 "• Typosquatting / Domain Auditor",
                 "• Static HTML / Manifest Parser"
             ], "STEP 2")

    add_card(s7, Inches(6.8), Inches(1.6), Inches(2.7), Inches(5.2),
             "3. Risk & Graph Analysis",
             [
                 "• Explainable Multi-Factor Scoring (0-100)",
                 "• Entity Cross-Referencing",
                 "• Bi-directional Relationship Graph Builder",
                 "• Heat-List Counter Incrementer"
             ], "STEP 3")

    add_card(s7, Inches(9.8), Inches(1.6), Inches(2.7), Inches(5.2),
             "4. Actionable Outputs",
             [
                 "• Real-Time Risk Warning for Citizens",
                 "• Police Investigation Dashboard View",
                 "• Interactive React Flow Entity Graph",
                 "• One-Click Section 65B PDF Dossier"
             ], "STEP 4")

    # -------------------------------------------------------------
    # SLIDE 8: Technology Stack & Implementation Feasibility
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, C_NAVY_DARK)
    add_header(s8, "Technology Stack: Robust, Scalable & Zero-License Cost")

    add_card(s8, Inches(0.8), Inches(1.6), Inches(3.6), Inches(2.5),
             "Frontend & Visuals",
             [
                 "React.js + Tailwind CSS (Responsive Cyber Command Theme)",
                 "Lucide Icons & Recharts for Threat Visuals",
                 "Vis.js / React Flow for Entity Relationship Graph"
             ], "UI / UX")

    add_card(s8, Inches(4.8), Inches(1.6), Inches(3.6), Inches(2.5),
             "Backend & API",
             [
                 "Python 3.14 + FastAPI (High-performance async API)",
                 "Pydantic for Data Validation & Schemas",
                 "Uvicorn ASGI Production Server"
             ], "CORE BACKEND")

    add_card(s8, Inches(8.8), Inches(1.6), Inches(3.6), Inches(2.5),
             "Data & Storage",
             [
                 "SQLite3 (Zero-setup embedded database for hackathon)",
                 "Indexed Entity Tables (cases, identifiers, links)",
                 "Production Migration Ready (PostgreSQL / TimescaleDB)"
             ], "DATABASE")

    add_card(s8, Inches(0.8), Inches(4.3), Inches(5.6), Inches(2.5),
             "Forensic & Analysis Libraries",
             [
                 "• urllib & tldextract: Domain decomposition & TLD validation",
                 "• BeautifulSoup4 & lxml: Static HTML parsing & heuristic scanning",
                 "• Regex Engine: Pre-compiled patterns for Indian phone/UPI/IFSC",
                 "• zipfile: Android APK Manifest extraction & permission auditing"
             ], "FORENSIC ENGINE")

    add_card(s8, Inches(6.8), Inches(4.3), Inches(5.6), Inches(2.5),
             "Reporting & Evidence Generation",
             [
                 "• ReportLab: Native high-fidelity PDF dossier generation",
                 "• Cryptographic SHA-256 case evidence hashing",
                 "• Section 65B Indian Evidence Act compliant formatting",
                 "• Fully reproducible and auditable output"
             ], "LEGAL REPORTING")

    # -------------------------------------------------------------
    # SLIDE 9: User Interface & Police Dashboard Design
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, C_NAVY_DARK)
    add_header(s9, "Platform UI & Police Investigation Dashboard")

    add_card(s9, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Unified Scanner Console",
             [
                 "• Tabbed interface: Message Scanner, URL Inspector, Website Analyzer & APK Auditor.",
                 "• Instant feedback with live Risk Gauge (Low/Medium/High).",
                 "• Triggered indicators highlighted in color-coded pills.",
                 "• Citizen-safe recommendations displayed prominently."
             ], "SCREEN 1: SCANNER", C_CYAN)

    add_card(s9, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Case History & Search",
             [
                 "• Searchable case ledger with filter by risk level, date, and source vector.",
                 "• Universal search bar: Type any UPI ID (e.g. 'fraud@upi') or Phone number to view all matching FIRs.",
                 "• Quick-actions: View technical evidence, inspect graph, download PDF dossier."
             ], "SCREEN 2: REPOSITORY", C_AMBER)

    add_card(s9, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Intelligence & Graph Hub",
             [
                 "• Interactive Node-Edge Graph: Visualizes connections between Cases, Phone Numbers, UPI IDs, and Domains.",
                 "• Live Heat-List Table: Real-time leaderboard of trending scam identifiers.",
                 "• Exportable syndicate summaries for inter-agency coordination."
             ], "SCREEN 3: INTEL", C_GREEN)

    # -------------------------------------------------------------
    # SLIDE 10: Implementation Strategy & 3-Day Execution Plan
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, C_NAVY_DARK)
    add_header(s10, "Execution Strategy: Rapid Hackathon Implementation Plan")

    add_card(s10, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Day 1: Architecture & Detection",
             [
                 "• Complete FastAPI REST API setup with CORS.",
                 "• Build compiled regex entity extractor (Phone, UPI, Bank).",
                 "• Implement Message NLP urgency & impersonation heuristics.",
                 "• Implement URL domain & typosquatting analysis.",
                 "• Setup SQLite schema for case records.",
                 "Status: Completed & Functional"
             ], "MILESTONE 1 (22 NOV)", C_CYAN)

    add_card(s10, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Day 2: Web / APK & Correlation",
             [
                 "• Implement static Website analyzer for Ponzi/betting schemes.",
                 "• Implement APK static manifest permission auditor.",
                 "• Build Explainable Scoring Engine with additive weights.",
                 "• Develop Cross-Case Correlation Engine & Heat-List.",
                 "• Build responsive Cyber Command Dashboard UI.",
                 "Status: Integrated & Tested"
             ], "MILESTONE 2 (23 NOV)", C_AMBER)

    add_card(s10, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Day 3: Dossiers, Testing & Demo",
             [
                 "• Integrate ReportLab automated PDF report generator.",
                 "• Test with genuine vs. scam synthetic datasets (R4C sample data).",
                 "• Validate relationship graph with multi-case syndicate cluster.",
                 "• Finalize 12-slide submission presentation & video demo.",
                 "• Ready for Hackathon Submission."
             ], "MILESTONE 3 (24 NOV)", C_GREEN)

    # -------------------------------------------------------------
    # SLIDE 11: Scope Management: Must-Have vs. Future Enhancements
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, C_NAVY_DARK)
    add_header(s11, "Scope Adherence & Innovation Boundaries")

    add_card(s11, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Hackathon Scope (Must-Have)",
             [
                 "Message & URL Risk Analysis with full explainability.",
                 "Fraudulent Website text analysis & entity extraction.",
                 "Static APK permission audit.",
                 "Investigation Case History with Universal Search.",
                 "Downloadable Investigation Dossier (PDF).",
                 "",
                 "100% compliant with PS01 requirements."
             ], "DELIVERED IN PROTOTYPE", C_GREEN)

    add_card(s11, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Key Differentiators (Good-to-Have)",
             [
                 "Cross-Case Entity Relationship Graph (React Flow / Vis.js).",
                 "Trending Heat-List of malicious entities across Rajasthan.",
                 "Section 65B Indian Evidence Act compliant report templates.",
                 "Pre-configured test case selector for instant demonstration.",
                 "",
                 "Elevates LinkedShield AI above simple classification tools."
             ], "COMPETITIVE EDGE", C_CYAN)

    add_card(s11, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Strictly Out of Scope",
             [
                 "Dynamic APK execution in runtime sandbox (prohibited by time & scope).",
                 "Automated takedown / DNS blocking (requires judicial warrants).",
                 "Access to private bank/telecom systems without authorization.",
                 "",
                 "Ensures strict compliance with ethical and legal standards."
             ], "OUT OF SCOPE", C_RED)

    # -------------------------------------------------------------
    # SLIDE 12: Impact, Innovation & Law Enforcement Value
    # -------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12, C_NAVY_DARK)
    add_header(s12, "Impact, Scalability & Value for Rajasthan Police")

    add_card(s12, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Operational Law Enforcement Value",
             [
                 "• Fast-Track FIR Registration: Extracted indicators auto-fill standard cyber crime reporting formats.",
                 "• 80% Reduction in Triage Time: Automated risk scoring prioritizes acute high-risk extortion and fraud cases.",
                 "• Coordinated Syndicate Busts: Unmasks shared mule bank accounts and UPI IDs across district boundaries."
             ], "POLICE EFFICIENCY", C_CYAN)

    add_card(s12, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Citizen Protection & Trust",
             [
                 "• Proactive Defense: Citizen-friendly warnings explain fraud mechanics in simple language before money is lost.",
                 "• Easy Reporting: Simple copy-paste interface encourages public reporting of scam SMS & WhatsApp lures.",
                 "• Reduced Cyber Victimization: Empowers citizens with immediate verification of electricity bills, KYC, and loan offers."
             ], "CITIZEN SAFETY", C_AMBER)

    add_card(s12, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2),
             "Future Scale & Deployment",
             [
                 "• WhatsApp / Telegram Citizen Bot Integration for 1-click verification.",
                 "• Integration with National Cyber Crime Reporting Portal (NCRP) / 1930 Helpline.",
                 "• Machine Learning fine-tuning with regional dialect smishing datasets (Hindi / Marwari).",
                 "• Seamless transition from prototype to state-wide cyber cell deployment."
             ], "STATE-WIDE ROADMAP", C_GREEN)

    prs.save(filename)
    print(f"Presentation saved successfully as: {filename}")

if __name__ == "__main__":
    create_deck()
