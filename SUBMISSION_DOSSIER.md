# LINKEDSHIELD AI — HACKATHON SUBMISSION DOSSIER
**Rajasthan Police Hackathon | Cyber Defense & AI Forensics Track**

---

## 1. Selected Problem Statement
* **Problem Statement Code:** `PS01`
* **Title:** Cyber Fraud / Phishing / Malicious Apps — Scam Message & Phishing Link Detection with Fake Loan / Investment App and Fraudulent Website Analysis
* **Target Agency:** Rajasthan Police / State Cyber Crime Cell

---

## 2. Proposed Solution / Executive Summary
**LinkedShield AI** is an AI-assisted unified cyber threat intelligence and forensic investigation platform designed specifically for law enforcement officers and citizens. 

Traditional cyber crime tools treat fraud channels in silos—an SMS complaint is logged in one database, a malicious link in another, a predatory loan app elsewhere, and a mule bank/UPI account separately. This allows organized cyber syndicates to run dozens of scam operations concurrently while reusing the same backend financial endpoints and phone numbers undetected.

**LinkedShield AI solves this by delivering a 4-in-1 multi-modal ingestion pipeline:**
1. **Scam Message Scanner:** Analyzes SMS, WhatsApp, and Telegram text for urgency, threats (electricity cutoff, SIM blocking), fake KYC, and bank/government impersonation using NLP heuristics.
2. **Phishing & Lookalike Link Inspector:** Decomposes URLs, detects typosquatting against official state and banking domains (e.g., `sbi-kyc.cc`, `jvvnl-bijli.online`), unmasks URL shortener redirect chains, audits SSL/HTTPS status, and checks synthetic phishing blacklists.
3. **Fraudulent Website & Scheme Analyzer:** Safely parses static content of high-yield investment schemes (Ponzi/MLM promising 30–50% ROI), illegal betting/color prediction platforms, and automatically extracts actionable payment endpoints (UPI VPAs, bank IFSCs, crypto wallets).
4. **Android APK Static Auditor:** Inspects APK manifests to identify predatory instant-loan extortion profiles (e.g., simple loan calculators requesting `READ_CONTACTS`, `READ_SMS`, and `CAMERA` for contact harvesting and blackmail).

---

## 3. Key Differentiators & Forensic Capabilities

| Feature | Citizen Facing Value | Police Investigation Value |
| :--- | :--- | :--- |
| **Explainable Risk Engine** | Provides plain-language safety alerts ("DO NOT share OTP", "Verify on official discom site"). | Transparent additive score (0–100) with line-by-line evidence justification; no unverified black-box outputs. |
| **Cross-Case Syndicate Correlation** | Warns citizens if a phone number or UPI VPA was previously reported. | **Bi-directional relationship graph** connects separate FIRs sharing the same UPI VPA, phone number, or IP subnet into an organized syndicate cluster. |
| **Trending Heat-List** | Informs the public of trending regional scams. | Ranks the top 10 most reported phone numbers, phishing domains, and mule UPI accounts for immediate bulk freezing with NPCI/banks. |
| **Automated Forensic Dossier** | Enables instant proof export when filing complaints. | One-click export of an investigation-ready **Section 65B (Indian Evidence Act)** compliant PDF report with SHA-256 evidence digests. |

---

## 4. System Architecture & Workflow

```
                        CITIZEN / INVESTIGATING OFFICER
                        ┌───────────────────────────────┐
                        │   LinkedShield Command Center │
                        │ (SMS / URL / Website / APK)   │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │       Multi-Modal Ingestion & Regex Engine          │
             │   Extracts: Phone Numbers, UPI VPAs, URLs, Crypto   │
             └──────────────────────────┬──────────────────────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            ▼                           ▼                           ▼
 ┌──────────────────────┐   ┌───────────────────────┐   ┌──────────────────────┐
 │ Message NLP Engine   │   │  URL & Domain Engine  │   │  Web & APK Parser    │
 │ • Coercion & Urgency │   │ • Typosquatting Match │   │ • Ponzi / MLM Flags  │
 │ • Impersonation Lure │   │ • Suspicious TLD (.cc)│   │ • Dangerous Perms    │
 │ • Fake KYC Triggers  │   │ • HTTP/SSL Audit      │   │ • C2 Server Extraction│
 └──────────┬───────────┘   └───────────┬───────────┘   └──────────┬───────────┘
            │                           │                          │
            └───────────────────────────┼──────────────────────────┘
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │            Explainable Risk Scoring Engine          │
             │  Additive scoring (0-100) + Risk Tier Calibration   │
             │    LOW (0-24)  |  MEDIUM (25-49)  |  HIGH (50+)     │
             └──────────────────────────┬──────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
     ┌──────────────────────────────┐       ┌──────────────────────────────┐
     │  SQLite3 Case & Entity Store │       │ Section 65B PDF Dossier      │
     │  • Normalized Identifiers    │       │ • ReportLab Engine           │
     │  • SHA-256 Chain of Custody  │       │ • Court Admissible Dossier   │
     └──────────────┬───────────────┘       └──────────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────────┐
     │ Syndicate Intelligence Hub   │
     │ • Cross-Case Vis.js Graph    │
     │ • Trending Heat-List         │
     │ • Universal Case Search      │
     └──────────────────────────────┘
```

---

## 5. Technology Stack & Technical Feasibility

* **Backend Framework:** Python 3.14 + FastAPI (High-performance async REST API, zero overhead)
* **Frontend Interface:** Responsive Cyber Command Center (Tailwind CSS, Font Awesome, Vis.js Network Engine)
* **Intelligence & Heuristics:**
  * Pre-compiled Indian telecom regex (`+91` 10-digit mobile parser)
  * NPCI UPI Virtual Payment Address (VPA) extractor
  * Levenshtein distance & brand dictionary typosquatting analyzer
  * BeautifulSoup4 static web content scanner
* **Database & Indexing:** SQLite3 with indexed relational tables (`cases`, `identifiers`)
* **Legal Reporting:** ReportLab PDF generating SHA-256 certified Section 65B evidence briefs
* **Zero License Cost:** 100% open-source components with zero third-party proprietary API dependencies.

---

## 6. Implementation Strategy & Milestones

* **Milestone 1 (Completed):**
  * Core multi-modal detection engine for Messages, URLs, Websites, and Android APK metadata.
  * Regex entity extraction for Indian phone numbers, UPI VPAs, and lookalike domains.
  * Database schema setup and seed dataset loaded with realistic scam and clean cases.
* **Milestone 2 (Completed):**
  * Explainable risk scoring model with transparent point weights.
  * Cross-case correlation algorithm and interactive syndicate relationship graph.
  * Universal search bar across cases and indicators.
  * Trending heat-list for top domains, phones, and UPI accounts.
* **Milestone 3 (Completed):**
  * Section 65B Indian Evidence Act compliant PDF dossier generation with ReportLab.
  * Single-command runner (`python run.py`) launching local server and dashboard.
  * 12-slide widescreen presentation deck (`LinkedShield_AI_Action_Plan.pptx`).

---

## 7. Action Plan Presentation & Deliverables
* **Presentation File:** `LinkedShield_AI_Action_Plan.pptx` (12 slides formatted to Rajasthan Police guidelines)
* **Working Prototype Source Code:** Self-contained inside project directory.
* **Interactive Live Demo:** Run `python run.py` (accessible at `http://127.0.0.1:8000`).
