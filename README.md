# 🛡️ LINKSHIELD AI
### Unified Cyber Fraud Detection, Phishing Analysis & Investigation Intelligence Platform
**Rajasthan Police Cyber Security Hackathon 2026 | Challenge PS01: Cyber Fraud / Phishing / Malicious Apps**

> **Tagline:** *Detect. Explain. Investigate. Protect.*

---

## 📌 Executive Overview
**LINKSHIELD AI** is a production-grade, AI-assisted cyber threat intelligence platform developed for the **Rajasthan Police Cyber Crime Division** and citizens. 

Traditional cybercrime investigation tools operate in isolation: SMS messages are reported in one system, phishing links in another, predatory loan applications elsewhere, and mule UPI accounts separately. Organized cyber syndicates exploit this fragmentation by running dozens of concurrent campaigns while recycling the same backend financial endpoints and phone numbers.

**LINKSHIELD AI eliminates this blind spot through a unified multi-modal intelligence pipeline:**
* Ingests and analyzes suspicious **Messages (SMS/WhatsApp/Telegram)**, **URLs**, **Fraudulent Websites**, and **Android APKs**.
* Explains risk with an **additive, transparent scoring rubric** (0–100) calibrated into **LOW (0-24)**, **MEDIUM (25-49)**, and **HIGH (50+)**.
* Automatically unmasks organized crime syndicates through an **interactive relationship graph** connecting shared UPI VPAs, phone numbers, and hosting subnets.
* Generates court-admissible, **Section 65B (Indian Evidence Act)** compliant forensic dossiers in one click.

---

## 🚀 Key Modules & Capabilities

| Module | Features & Capabilities |
| :--- | :--- |
| **1. Threat Intelligence Dashboard** | Real-time overview of total FIRs, risk distribution charts, threat vector breakdown, top repeated entities, and recent incident ledger. |
| **2. Scam Message Analyzer** | NLP & regex classifier detecting urgency coercion, fake KYC demands, electricity bill cutoff threats, parcel scams, and part-time job lures across SMS, WhatsApp, and Telegram. |
| **3. Phishing URL Scanner** | Decomposes URL syntax, audits SSL/HTTPS, detects typosquatting and Punycode spoofing against Indian banks/utilities, flags naked IP hosts and ephemeral TLDs (`.cc`, `.online`, `.top`). |
| **4. Fraudulent Website Analyzer** | Static parsing of high-yield investment schemes (Ponzi/MLM promising 35%+ weekly ROI) and illegal betting platforms. Includes **SSRF Protection** blocking private IP spaces. |
| **5. Android APK Static Inspector** | Audits APK manifest permissions (`READ_CONTACTS`, `READ_SMS`, `CAMERA`) and DEX strings to detect predatory instant-loan extortion signatures without executing binary code. |
| **6. Scam Relationship Graph** | Interactive network graph (Vis.js / React Flow) mapping cross-case linkages between FIRs and shared phone numbers, UPI VPAs, and hosting domains. |
| **7. Case Management** | Searchable registry with filters (Risk, Vector, Date), investigator notes persistence, evidence hash verification, and case details inspection. |
| **8. Threat Heat-List** | Real-time leaderboard of the most frequently reported domains, phone numbers, and mule accounts with time-range filtering for emergency NPCI liens and TSP subpoenas. |
| **9. Investigation Reports** | Instant generation and download of **Section 65B Indian Evidence Act** compliant forensic PDF dossiers stamped with SHA-256 evidence digests. |
| **10. AI Investigation Assistant** | Conversational forensic assistant answering questions directly from persistent SQLite case records and entity indexes without hallucinations. |
| **11. System Settings & Policies** | Configurable risk thresholds, law enforcement agency branding, and synthetic demonstration dataset management. |

---

## 🏗️ System Architecture & Workflow

```
                        CITIZEN / INVESTIGATING OFFICER
                        ┌───────────────────────────────┐
                        │   LinkedShield Command Center │
                        │  (React 18 + Tailwind + Vite) │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │            FastAPI Async REST Gateway               │
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
     │  • Normalized Identifiers    │       │ • ReportLab Forensic Builder │
     │  • SHA-256 Chain of Custody  │       │ • Court-Admissible Dossier   │
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

## 💻 Tech Stack

* **Frontend:** React 18, Vite, JavaScript, Tailwind CSS, Lucide React, Recharts, Vis.js / React Flow
* **Backend:** Python 3.14 + FastAPI, Pydantic, Uvicorn
* **Database:** SQLite with persistent storage and indexed entity tables
* **Analysis & Security:**
  * Regex extraction (Indian mobile numbers `+91`, NPCI UPI VPAs, IFSC, Crypto)
  * SSRF Protection & safe remote URL fetching
  * BeautifulSoup4 static HTML parsing
  * Static APK archive parsing (`AndroidManifest.xml` and `classes.dex` strings)
* **Reporting:** ReportLab PDF generator with Section 65B legal formatting and SHA-256 hashing

---

## ⚡ Exact Startup Instructions (Windows)

### Option 1: One-Click Production Launcher
Start the unified application (FastAPI backend + compiled React frontend) with a single command:
```powershell
python run.py
```
*The script starts the server on `http://127.0.0.1:8000` and automatically opens the Cyber Defense Command Center in your browser.*

### Option 2: Full-Stack Developer Mode
If you wish to run both the FastAPI backend and Vite frontend separately:

1. **Terminal 1 (Backend):**
```powershell
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

2. **Terminal 2 (Frontend):**
```powershell
cd frontend
npm.cmd run dev
```
*Access the hot-reloading frontend at `http://localhost:5173`.*

---

## 🧪 Automated Testing & Verification
To execute the comprehensive automated test suite verifying all 10 system phases:
```powershell
python test_system.py
```

---

## 🏆 How to Demonstrate to Hackathon Judges

1. **Dashboard Overview (`/`):** Point out the dynamic metrics (total cases, high/medium/low distribution, top repeated entities) computed from persistent SQLite storage.
2. **Message Analyzer (`/messages`):**
   * Click **"⚡ Electricity Cutoff"** sample and execute scan.
   * Highlight the **Risk Score (100/100)**, extracted phone number (`9876500001`), lookalike JVVNL domain, and plain HTTP alert.
   * Click **"Download Section 65B Dossier"** to view the court-admissible PDF evidence report.
3. **Syndicate Correlation Graph (`/graph`):**
   * Show how **Case 1 (Electricity Cutoff)** and **Case 2 (RoyalGrow Ponzi Scheme)** are connected via the shared phone number `9876500001`.
   * Click the shared phone node to demonstrate the syndicate linkage panel.
4. **Website & Scheme Analyzer (`/websites`):**
   * Demonstrate detection of guaranteed 35% weekly ROI Ponzi claims and extraction of recipient UPI ID `royalwealth@ybl`.
5. **APK Inspector (`/apks`):**
   * Demonstrate permission auditing flagging `READ_CONTACTS` and `READ_SMS` for predatory instant-loan extortion apps.
6. **AI Investigation Assistant (`/assistant`):**
   * Click the suggestion: *"Which phone number appears in multiple cases?"*
   * Watch the assistant cite explicit Case IDs and suggest issuing a Section 91 CrPC notice to TSPs.

---

## ⚖️ Legal & Ethical Compliance
* **Section 65B Indian Evidence Act, 1872:** Every submitted threat is stamped with a SHA-256 cryptographic digest to preserve chain of custody.
* **Non-Invasive Static Analysis:** No untrusted APK binaries or JavaScript payloads are executed at any time.
* **SSRF Protected:** Localhost and internal private networks (RFC 1918) cannot be accessed by URL fetchers.
