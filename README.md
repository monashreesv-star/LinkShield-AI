# 🛡️ LinkedShield AI
### AI-Assisted Unified Cyber Threat Intelligence & Phishing Investigation Platform
**Rajasthan Police Hackathon | Problem Statement PS01 (Cyber Fraud / Phishing / Malicious Apps)**

---

## 📌 Overview
LinkedShield AI is an end-to-end cyber threat analysis and investigation system that ingests suspicious messages (SMS/WhatsApp/Telegram), phishing URLs, fraudulent investment/betting websites, and rogue Android APK metadata. It extracts actionable identifiers, calculates transparent explainable risk scores, links related cases into syndicate clusters, and generates court-admissible Section 65B forensic reports.

---

## 🚀 Key Features

* **📱 Multi-Modal Threat Detection:**
  * **Messages:** Detects urgency, threats (electricity cutoff, SIM blocking), fake KYC, and bank/government impersonation.
  * **URLs & Links:** Identifies lookalike/typosquatted domains (e.g. `sbi-kyc.cc`, `jvvnl-bijli.online`), suspicious TLDs, missing SSL/HTTPS, and blacklisted domains.
  * **Fraudulent Websites:** Analyzes Ponzi/MLM claims ("guaranteed 35% ROI"), illegal betting, and extracts payment details.
  * **Android APKs:** Audits dangerous permissions (`READ_CONTACTS`, `READ_SMS`, `CAMERA`) typical of predatory instant-loan extortion apps.
* **🔎 Actionable Identifier Extraction:**
  * Automatically extracts and normalizes Indian mobile numbers, UPI Virtual Payment Addresses (VPAs), bank accounts, IFSC codes, and crypto wallets.
* **⚖️ Explainable Risk Scoring Engine:**
  * Additive scoring rubric (0–100) calibrated into **LOW (0-24)**, **MEDIUM (25-49)**, and **HIGH (50+)** with line-by-line evidence justification.
* **🕸️ Syndicate Cross-Case Correlation Graph:**
  * Automatically connects disparate cases sharing the same phone number, UPI VPA, or hosting domain into an interactive network graph (Vis.js).
* **🔥 Trending Threat Heat-List:**
  * Real-time leaderboard of the most frequently reported domains, phone numbers, and mule UPI accounts.
* **📄 Section 65B Evidence Dossier:**
  * One-click generation of court-ready PDF investigation reports with cryptographic SHA-256 evidence digests.

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
* Python 3.10+ (Tested on Python 3.14)
* Installed dependencies: `fastapi`, `uvicorn`, `reportlab`, `beautifulsoup4`, `python-pptx`

### 2. Run the Platform
To launch the complete application with the web dashboard:
```bash
python run.py
```
*The command will start the FastAPI backend on `http://127.0.0.1:8000` and automatically open the interactive Cyber Defense Command Center in your default browser.*

### 3. Generate the 12-Slide Action Plan Presentation
To generate or update the official submission presentation (`.pptx`):
```bash
python generate_presentation.py
```
*Creates `LinkedShield_AI_Action_Plan.pptx` ready for PowerPoint / Google Slides.*

---

## 📂 Project Architecture

```
LinkedShield AI/
├── backend/
│   ├── analyzer.py          # Regex extractors, NLP urgency heuristics, typosquatting logic
│   ├── database.py          # SQLite3 case database, correlation algorithms, seed data
│   ├── main.py              # FastAPI REST endpoints & static file mounting
│   └── pdf_generator.py     # ReportLab Section 65B forensic PDF dossier builder
├── static/
│   └── index.html           # Responsive Cyber Command Center UI with Vis.js Graph
├── reports/                 # Auto-generated Section 65B investigation PDF dossiers
├── generate_presentation.py # Automation script generating the 12-slide submission PPTX
├── LinkedShield_AI_Action_Plan.pptx # Final submission presentation file
├── run.py                   # One-click execution launcher
├── test_system.py           # End-to-end integration test suite
├── SUBMISSION_DOSSIER.md    # Formal submission text for hackathon portal
└── README.md                # Project documentation
```

---

## 🧪 Demo Test Samples

Try these built-in samples in the web scanner:
1. **⚡ Electricity Cutoff Scam:** *"Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM from the power office... contact 9876543210 or update at http://jvvnl-bijli-update.online"*
2. **📈 35% Weekly ROI Ponzi Scheme:** *"Invest Rs. 5000 today and get guaranteed 35% weekly returns! Invite 5 friends... UPI: royalwealth@ybl"*
3. **📱 Rogue Loan App (APK):** *"RupeeQuick Express Loan (com.fastcash.rupeeloan) requesting READ_CONTACTS, READ_SMS, CAMERA"*
4. **✅ Legitimate Bank Alert:** *"Dear Customer, INR 2,500.00 debited from your HDFC Bank A/c... call 18002026161."*

---

## 📜 Compliance & Ethics
* **Section 65B Indian Evidence Act, 1872:** Every ingested threat is stamped with a SHA-256 hash to ensure strict digital chain of custody.
* **Safe Analysis:** All web and APK inspections are performed via static parsing; no untrusted binaries or scripts are executed.
