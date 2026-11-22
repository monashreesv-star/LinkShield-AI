import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Send,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Phone,
  CreditCard,
  Globe,
  Mail,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLES = [
  {
    label: '⚡ Electricity Cutoff',
    text: 'Dear Consumer, Your electricity connection will be disconnected tonight at 9:30 PM from the power office because your previous month bill was not updated. Please immediately contact our officer at +91 9876500001 or update bill at http://jvvnl-bijli-update.online. Urgently pay pending Rs. 450.'
  },
  {
    label: '🏦 SBI KYC Suspension',
    text: 'SBI Alert: Dear customer, your SBI NetBanking account has been suspended due to pending KYC verification. Click http://sbi-kyc-verify.cc to update your PAN and Aadhaar details immediately to avoid permanent deactivation.'
  },
  {
    label: '💼 Part-Time Job Scam',
    text: 'Hello! I am HR from Global Marketing Ltd. We offer part-time remote work. Like YouTube videos and review Google Maps locations to earn Rs 2,500 - 5,000 daily! Contact our manager on Telegram @EarnDailyPay or WhatsApp 9876500005.'
  },
  {
    label: '✅ Genuine Bank Alert',
    text: 'Dear Customer, INR 2,500.00 debited from your HDFC Bank A/c ending 4589 on 22-NOV-26 to SWIGGY. Available Bal: INR 34,120.00. If not done by you, call official toll-free 18002026161.'
  }
];

export default function MessageAnalyzer() {
  const [text, setText] = useState(SAMPLES[0].text);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch('/api/analyze/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Message analysis failed');
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <MessageSquareWarning className="w-4 h-4" />
          <span>SMS & WhatsApp Phishing Triage Engine</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">Scam Message & Social Engineering Analyzer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detects fake KYC, urgency coercion, bank impersonation, electricity bill cutoff scams, and extracts phone numbers and lookalike links.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        {/* Quick Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Select Scenario:</span>
          {SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setText(s.text);
                setTitle(s.label);
                setResult(null);
                setErrorMsg('');
              }}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleScan} className="space-y-3">
          <div>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste suspicious SMS, WhatsApp message, email, or chat excerpt..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-2"
            >
              <span>{loading ? 'Analyzing Message...' : 'Triage Message'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black ${
                  result.risk_level === 'HIGH'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : result.risk_level === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                <span className="text-xl leading-none">{result.risk_score}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">/ 100</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                      result.risk_level === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : result.risk_level === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {result.risk_level} RISK THREAT
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Case #{result.case_id}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mt-1">{result.recommendation}</h3>
              </div>
            </div>

            <Link
              to={`/cases?id=${result.case_id}`}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspect Case Dossier</span>
            </Link>
          </div>

          {/* Triggered Forensic Indicators */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Triggered Coercion & Deception Indicators ({result.indicators?.length || 0})
            </h4>
            <div className="space-y-2">
              {result.indicators && result.indicators.length > 0 ? (
                result.indicators.map((ind, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800">{ind.name}</div>
                      <div className="text-slate-600">{ind.reason}</div>
                    </div>
                    <span className="font-mono font-bold text-rose-600 shrink-0 ml-4">
                      +{ind.score} pts
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-emerald-600 font-medium">Standard legitimate transactional communication.</div>
              )}
            </div>
          </div>

          {/* Extracted Identifiers */}
          {result.extracted_entities && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Extracted Actionable Identifiers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {result.extracted_entities.phones?.map((p, i) => (
                  <div key={i} className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-emerald-600">Telephony Endpoint</div>
                      <div className="font-mono font-bold text-emerald-900">{p}</div>
                    </div>
                  </div>
                ))}
                {result.extracted_entities.urls?.map((u, i) => (
                  <div key={i} className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-xs flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-cyan-600 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-cyan-600">Embedded Link</div>
                      <div className="font-mono font-bold text-cyan-900 break-all">{u}</div>
                    </div>
                  </div>
                ))}
                {result.extracted_entities.upis?.map((upi, i) => (
                  <div key={i} className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-purple-600">Mule UPI VPA</div>
                      <div className="font-mono font-bold text-purple-900 break-all">{upi}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
