"""
Synthetic demonstration dataset for LinkShield AI.
Contains 30+ realistic test cases across all threat vectors with synthetic identifiers.
No real personal data is included.
"""

SYNTHETIC_DATASET = [
    # 1. Electricity Bill Cutoff Scams
    {
        "source_type": "Message (SMS)",
        "content": "Dear Consumer, Your electricity connection will be disconnected tonight at 9:30 PM from the power office because your previous month bill was not updated. Please immediately contact our officer at +91 9876500001 or update bill at http://jvvnl-bijli-update.online. Urgently pay pending Rs. 450.",
        "label": "Scam - Electricity Cutoff",
        "expected_risk": "HIGH",
        "entities": {"phone": ["9876500001"], "domain": ["jvvnl-bijli-update.online"], "upi": ["jvvnlpower@okaxis"]}
    },
    {
        "source_type": "Message (SMS)",
        "content": "Urgent Alert: AVVNL Power cut notice for Meter No. 448201. Your power supply will be cut off today. Contact electricity department helpline 9876500002 immediately to verify pending bill payment of Rs 890 at http://avvnl-pay.cc/bill",
        "label": "Scam - Electricity Cutoff",
        "expected_risk": "HIGH",
        "entities": {"phone": ["9876500002"], "domain": ["avvnl-pay.cc"], "upi": ["avvnlhelp@paytm"]}
    },

    # 2. Fake Bank KYC & Suspension Scams
    {
        "source_type": "Message (SMS)",
        "content": "SBI Alert: Dear customer, your SBI NetBanking account has been suspended due to pending KYC verification. Click http://sbi-kyc-verify.cc to update your PAN and Aadhaar details immediately to avoid permanent deactivation.",
        "label": "Scam - Fake KYC",
        "expected_risk": "HIGH",
        "entities": {"domain": ["sbi-kyc-verify.cc"]}
    },
    {
        "source_type": "Message (SMS)",
        "content": "HDFC Bank Notice: Your bank account ending in 7102 is blocked. Please update your KYC immediately by visiting http://hdfc-kyc-portal.online or calling nodal officer at 9876500003.",
        "label": "Scam - Fake KYC",
        "expected_risk": "HIGH",
        "entities": {"phone": ["9876500003"], "domain": ["hdfc-kyc-portal.online"]}
    },
    {
        "source_type": "Message (WhatsApp)",
        "content": "Dear ICICI Customer, your credit card reward points worth Rs 9,850 are expiring today! Redeem cash directly into your bank account before midnight: http://icici-rewards-claim.top/redeem",
        "label": "Scam - Bank Reward Points",
        "expected_risk": "HIGH",
        "entities": {"domain": ["icici-rewards-claim.top"]}
    },

    # 3. Parcel / Courier Delivery Scams
    {
        "source_type": "Message (SMS)",
        "content": "India Post: Your package IN9823412 cannot be delivered due to incomplete delivery address. Please update your house address and pay Rs 25 re-delivery charge at http://indiapost-parcel-update.site within 24 hours.",
        "label": "Scam - Parcel Delivery",
        "expected_risk": "HIGH",
        "entities": {"domain": ["indiapost-parcel-update.site"], "upi": ["postofficehelp@upi"]}
    },
    {
        "source_type": "Message (SMS)",
        "content": "SpeedPost Alert: Parcel on hold at regional customs hub. Clearance fee of Rs 48 pending. Visit http://speedpost-clearance.cc or contact customs officer at 9876500004.",
        "label": "Scam - Courier Clearance",
        "expected_risk": "HIGH",
        "entities": {"phone": ["9876500004"], "domain": ["speedpost-clearance.cc"]}
    },

    # 4. Part-Time Job / Telegram Like & Earn Scams
    {
        "source_type": "Message (WhatsApp)",
        "content": "Hello! I am HR from Global Marketing Ltd. We offer part-time remote work. Like YouTube videos and review Google Maps locations to earn Rs 2,500 - 5,000 daily! Contact our manager on Telegram @EarnDailyPay or WhatsApp 9876500005.",
        "label": "Scam - Part-Time Job",
        "expected_risk": "HIGH",
        "entities": {"phone": ["9876500005"]}
    },
    {
        "source_type": "Message (SMS)",
        "content": "Congratulations! You are shortlisted for Amazon Part-Time Data Assistant. Work 30 mins a day, salary Rs 45,000/month. Join official hiring room: http://amazon-hiring-job.top/join or WhatsApp +91 9876500006.",
        "label": "Scam - Impersonation Job",
        "expected_risk": "HIGH",
        "entities": {"phone": ["9876500006"], "domain": ["amazon-hiring-job.top"]}
    },

    # 5. Lottery & Fake Government Schemes
    {
        "source_type": "Message (WhatsApp)",
        "content": "KBC Lucky Draw: Congratulations! Your mobile number has won Rs 25,00,000 in KBC All India WhatsApp lottery 2026. Contact KBC manager Rana Pratap Singh on WhatsApp 9876500007 to claim prize. Ref No: KBC-2026-98.",
        "label": "Scam - Lottery Win",
        "expected_risk": "HIGH",
        "entities": {"phone": ["9876500007"]}
    },
    {
        "source_type": "Message (SMS)",
        "content": "Govt PM Mudra Loan Yojana: Your business loan of Rs 5,00,000 is approved at 2% interest. Transfer processing fee Rs 1,499 to UPI: mudraloan@okhdfcbank or call 9876500008 to disburse.",
        "label": "Scam - Fake Govt Loan",
        "expected_risk": "HIGH",
        "entities": {"phone": ["9876500008"], "upi": ["mudraloan@okhdfcbank"]}
    },

    # 6. Fraudulent High-Yield Investment & Ponzi Websites
    {
        "source_type": "Fraudulent Website",
        "content": "Welcome to RoyalGrow Wealth! Invest Rs. 5,000 today and receive guaranteed 35% weekly returns! Invite 5 friends to unlock VIP Level 3 bonus and earn 10% daily team income. 100% risk free SEBI certified fund. Transfer funds directly to UPI ID: royalwealth@ybl or WhatsApp +91 9876500001.",
        "label": "Scam - Ponzi High ROI",
        "expected_risk": "HIGH",
        "entities": {"phone": ["9876500001"], "upi": ["royalwealth@ybl"], "domain": ["royalgrow-vip.top"]}
    },
    {
        "source_type": "Fraudulent Website",
        "content": "TitanCrypto Multiplier: Automated AI Arbitrage Bot guarantees 50% monthly profit on all USDT deposits. Minimum deposit: 100 USDT. Deposit TRC20 address: TXj6f8Lz5rP9mKwQ2yUv1tXoZbN4eRcVa3. Instant daily withdrawals. Multi-tier affiliate commission tree.",
        "label": "Scam - Crypto Ponzi",
        "expected_risk": "HIGH",
        "entities": {"crypto": ["TXj6f8Lz5rP9mKwQ2yUv1tXoZbN4eRcVa3"], "domain": ["titancrypto-bot.cc"]}
    },
    {
        "source_type": "Fraudulent Website",
        "content": "Bharat Solar Energy Investment Scheme: Rent a solar panel unit for Rs 3,000 and earn Rs 300 daily passive revenue for 365 days. Guaranteed return under national green energy mission. Send payment to UPI: bharatsolar@paytm or call helpline 9876500009.",
        "label": "Scam - Fake Solar Scheme",
        "expected_risk": "HIGH",
        "entities": {"phone": ["9876500009"], "upi": ["bharatsolar@paytm"], "domain": ["bharat-solar-earn.site"]}
    },

    # 7. Illegal Betting & Color Prediction Platforms
    {
        "source_type": "Fraudulent Website",
        "content": "Daman Win Club: India's No. 1 Color Prediction Game! Predict Red or Green and double your money in 30 seconds! Recharge your wallet now: Min deposit Rs 500. Direct UPI recharge to: damanpay@okaxis. Quick withdrawal to any bank account within 5 minutes. Join VIP prediction channel.",
        "label": "Scam - Color Prediction Betting",
        "expected_risk": "HIGH",
        "entities": {"upi": ["damanpay@okaxis"], "domain": ["damanwin-club.online"]}
    },
    {
        "source_type": "Fraudulent Website",
        "content": "Royal Casino 777 - Play Aviator, Teen Patti, Dragon vs Tiger online. Instant cash payout, 100% bonus on first deposit. Deposit via UPI: casino777@ybl. Support Telegram @RoyalCasinoSupport.",
        "label": "Scam - Illegal Gambling",
        "expected_risk": "HIGH",
        "entities": {"upi": ["casino777@ybl"], "domain": ["royalcasino777.top"]}
    },

    # 8. Malicious Instant-Loan APKs
    {
        "source_type": "Android APK",
        "content": "App: RupeeQuick Fast Loan (com.fastcash.rupeeloan). Discovered from: http://download.rupeeloan.cc/app.apk. Permissions: READ_CONTACTS, READ_SMS, CAMERA, ACCESS_FINE_LOCATION, WRITE_EXTERNAL_STORAGE. Embedded C2 Server: http://194.26.29.112:8080/sync",
        "label": "Malicious APK - Predatory Loan",
        "expected_risk": "HIGH",
        "entities": {"domain": ["download.rupeeloan.cc"], "upi": ["fastcashloan@paytm"]}
    },
    {
        "source_type": "Android APK",
        "content": "App: CashStar Instant Credit (com.starcredit.cashapp). Permissions: android.permission.READ_CONTACTS, android.permission.READ_SMS, android.permission.SEND_SMS, android.permission.RECORD_AUDIO. Embedded C2 Server: http://api.cashstar-loan.cc/upload. Phone: 9876500001",
        "label": "Malicious APK - Predatory Loan",
        "expected_risk": "HIGH",
        "entities": {"phone": ["9876500001"], "domain": ["cashstar-loan.cc"], "upi": ["starcredit@okhdfcbank"]}
    },
    {
        "source_type": "Android APK",
        "content": "App: PaisaPro Loan Master (com.paisapro.finance). Permissions: android.permission.READ_CONTACTS, android.permission.CAMERA, android.permission.ACCESS_FINE_LOCATION. Embedded C2 Server: http://45.130.22.99:9000/contacts",
        "label": "Malicious APK - Spyware Loan",
        "expected_risk": "HIGH",
        "entities": {"domain": ["paisapro-finance.top"]}
    },

    # 9. Suspicious & Phishing URLs
    {
        "source_type": "URL / Link",
        "content": "http://sbi-banking-login.cc/netbanking/auth",
        "label": "Phishing URL - Banking Typosquat",
        "expected_risk": "HIGH",
        "entities": {"domain": ["sbi-banking-login.cc"]}
    },
    {
        "source_type": "URL / Link",
        "content": "http://jvvnl-bill-pay.in.net/quick-pay",
        "label": "Phishing URL - Utility Impersonation",
        "expected_risk": "HIGH",
        "entities": {"domain": ["jvvnl-bill-pay.in.net"]}
    },
    {
        "source_type": "URL / Link",
        "content": "http://income-tax-refund2026.online/claim",
        "label": "Phishing URL - Tax Refund Lure",
        "expected_risk": "HIGH",
        "entities": {"domain": ["income-tax-refund2026.online"]}
    },
    {
        "source_type": "URL / Link",
        "content": "http://185.193.125.77/pan-update.html",
        "label": "Phishing URL - Naked IP Host",
        "expected_risk": "HIGH",
        "entities": {"domain": ["185.193.125.77"]}
    },

    # 10. Medium Risk / Ambiguous Communications
    {
        "source_type": "Message (SMS)",
        "content": "Reminder: Your subscription renewal is due in 3 days. Please visit https://sub-renewals-check.com to review your active plan and invoice details.",
        "label": "Suspicious - Unverified Domain",
        "expected_risk": "MEDIUM",
        "entities": {"domain": ["sub-renewals-check.com"]}
    },
    {
        "source_type": "Message (Email)",
        "content": "Subject: Important update regarding your membership profile. Please verify your contact preferences at http://service-member-update.net/auth before end of month.",
        "label": "Suspicious - Plain HTTP & New Domain",
        "expected_risk": "MEDIUM",
        "entities": {"domain": ["service-member-update.net"]}
    },

    # 11. Clean / Legitimate Baseline Communications (Low Risk)
    {
        "source_type": "Message (SMS)",
        "content": "Dear Customer, INR 2,500.00 debited from your HDFC Bank A/c ending 4589 on 22-NOV-26 to SWIGGY. Available Bal: INR 34,120.00. If not done by you, call official toll-free 18002026161.",
        "label": "Genuine - Bank Transaction Alert",
        "expected_risk": "LOW",
        "entities": {"phone": ["18002026161"]}
    },
    {
        "source_type": "Message (SMS)",
        "content": "Your OTP for Aadhaar authentication is 849201. Valid for 10 minutes. Do not share this OTP with anyone, including bank or UIDAI officials. Generated at 14:35 hrs.",
        "label": "Genuine - Official UIDAI OTP",
        "expected_risk": "LOW",
        "entities": {}
    },
    {
        "source_type": "Message (SMS)",
        "content": "JVVNL Alert: Dear Consumer (K No: 120938491), your bill of Rs 1,420 for month of OCT-26 is generated. Due date is 05-DEC-26. Pay safely at official portal https://energy.rajasthan.gov.in.",
        "label": "Genuine - Official Discom Bill",
        "expected_risk": "LOW",
        "entities": {"domain": ["energy.rajasthan.gov.in"]}
    },
    {
        "source_type": "URL / Link",
        "content": "https://onlinesbi.sbi/portal/personal/login.htm",
        "label": "Genuine - Official SBI NetBanking",
        "expected_risk": "LOW",
        "entities": {"domain": ["onlinesbi.sbi"]}
    },
    {
        "source_type": "URL / Link",
        "content": "https://energy.rajasthan.gov.in/jvvnl",
        "label": "Genuine - Government Utility Portal",
        "expected_risk": "LOW",
        "entities": {"domain": ["energy.rajasthan.gov.in"]}
    },
    {
        "source_type": "URL / Link",
        "content": "https://incometax.gov.in/iec/foportal",
        "label": "Genuine - Income Tax Official Portal",
        "expected_risk": "LOW",
        "entities": {"domain": ["incometax.gov.in"]}
    }
]
