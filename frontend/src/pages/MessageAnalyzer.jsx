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
  RotateCcw
} from 'lucide-react';

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

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/analyze/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Analysis error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (result && result.case_id) {
      window.open(`/api/cases/${result.case_id}/pdf`, '_blank');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <MessageSquareWarning className="w-4 h-4" />
          <span>Module 1 • NLP & Heuristic Classifier</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">Scam Message & Smishing Analyzer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detects fake KYC alerts, electricity disconnection threats, parcel scams, and job fraud across SMS, WhatsApp, and Telegram.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Sample Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Test Scenarios:</span>
          {SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setText(s.text);
                setTitle(s.label);
              }}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Suspicious Message Text
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste raw SMS, WhatsApp, Email, or Telegram message here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setText('');
                setResult(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Analyzing Indicators...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Main Risk Score Card */}
          <div
            className={`p-6 rounded-2xl border-l-4 shadow-xs bg-white ${
              result.risk_level === 'HIGH'
                ? 'border-red-500 bg-red-50/20'
                : result.risk_level === 'MEDIUM'
                ? 'border-amber-500 bg-amber-50/20'
                : 'border-emerald-500 bg-emerald-50/20'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-5">
                <div
                  className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-black ${
                    result.risk_level === 'HIGH'
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : result.risk_level === 'MEDIUM'
                      ? 'border-amber-500 text-amber-600 bg-amber-50'
                      : 'border-emerald-500 text-emerald-600 bg-emerald-50'
                  }`}
                >
                  <span className="text-2xl leading-none">{result.risk_score}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">/ 100</span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      {result.risk_level} RISK THREAT
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {result.case_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 font-medium max-w-xl">
                    {result.recommendation}
                  </p>
                </div>
              </div>

              <button
                onClick={downloadPdf}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-2 shrink-0"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Download Section 65B Dossier</span>
              </button>
            </div>
          </div>

          {/* 2-Column: Identifiers & Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Extracted Identifiers */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center">
                Extracted Identifiers
              </h2>

              <div className="space-y-2 text-xs">
                {result.extracted_entities?.phone?.map((p, i) => (
                  <div key={i} className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <span className="flex items-center font-mono text-emerald-900">
                      <Phone className="w-3.5 h-3.5 mr-2 text-emerald-600" /> {p}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Phone</span>
                  </div>
                ))}

                {result.extracted_entities?.upi?.map((u, i) => (
                  <div key={i} className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                    <span className="flex items-center font-mono text-purple-900">
                      <CreditCard className="w-3.5 h-3.5 mr-2 text-purple-600" /> {u}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">UPI</span>
                  </div>
                ))}

                {result.extracted_entities?.domain?.map((d, i) => (
                  <div key={i} className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <span className="flex items-center font-mono text-amber-900">
                      <Globe className="w-3.5 h-3.5 mr-2 text-amber-600" /> {d}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Domain</span>
                  </div>
                ))}

                {(!result.extracted_entities?.phone?.length &&
                  !result.extracted_entities?.upi?.length &&
                  !result.extracted_entities?.domain?.length) && (
                  <div className="text-slate-400 italic text-center py-4">
                    No structured payment or telecom endpoints extracted.
                  </div>
                )}
              </div>
            </div>

            {/* Explainable Indicators */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs md:col-span-2 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Explainable Risk Evidence Log
              </h2>

              <div className="space-y-3">
                {result.indicators?.map((ind, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{ind.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{ind.reason}</div>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md shrink-0">
                      +{ind.score} pts
                    </span>
                  </div>
                ))}

                {!result.indicators?.length && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Clean Communication: Zero suspicious markers triggered.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
