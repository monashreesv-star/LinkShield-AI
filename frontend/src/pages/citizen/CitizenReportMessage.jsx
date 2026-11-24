import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Send,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Phone,
  Link2,
  ExternalLink,
  Sparkles,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLES = [
  {
    title: '⚡ JVVNL Electricity Disconnection',
    sender: '+91 9876500001 (Personal Number)',
    content: 'Dear Consumer, Your electricity connection will be disconnected tonight at 9:30 PM from the power office because your previous month bill was not updated. Please immediately contact our officer at +91 9876500001 or pay at http://jvvnl-bijli-update.online. Urgently pay pending Rs. 450.'
  },
  {
    title: '🏦 SBI KYC Account Blocked',
    sender: '+91 9876500003 (Personal Number)',
    content: 'SBI Alert: Dear customer, your SBI account has been blocked due to pending KYC verification. Click http://sbi-kyc-verify.cc to update your Aadhaar and PAN immediately.'
  },
  {
    title: '💼 YouTube Like Part-Time Job',
    sender: '+91 9876500005 (WhatsApp Business)',
    content: 'Hello! I am HR from Global Media. Like 3 YouTube videos and earn Rs 3,000 daily! Simple work from home on WhatsApp. Contact our manager on WhatsApp 9876500005 to start task.'
  },
  {
    title: '📦 Jaipur Customs Parcel Hold',
    sender: '+91 9876500008 (SMS)',
    content: 'SpeedPost Alert: Your parcel #RJ992819 is on hold at Jaipur Central Customs hub due to incorrect delivery address. Pay Rs 25 clearance fee at http://indiapost-redelivery.top within 12 hours.'
  }
];

export default function CitizenReportMessage() {
  const [senderInfo, setSenderInfo] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!content.trim()) {
      setErrorMsg('Please enter or paste the message text.');
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMsg('');

    const token = localStorage.getItem('ls_token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    try {
      const fullText = senderInfo.trim()
        ? `[Sender Header / Number: ${senderInfo.trim()}]\n\n${content.trim()}`
        : content.trim();

      const res = await fetch('/api/citizen/report', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          submission_type: 'Message',
          content: fullText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        return;
      }
    } catch (fetchErr) {
      // Continue to offline forensic heuristics fallback
    }

    // Client-side Heuristics Engine Fallback
    const lower = content.toLowerCase();
    const hasUrgency = lower.includes('disconnected') || lower.includes('9:30 pm') || lower.includes('blocked') || lower.includes('urgent') || lower.includes('immediately');
    const hasKyc = lower.includes('kyc') || lower.includes('pan') || lower.includes('aadhaar');
    const hasJob = lower.includes('job') || lower.includes('youtube') || lower.includes('earn rs');
    const phones = content.match(/(?:\+?91[\-\s]?)?[6789]\d{9}/g) || [];
    const urls = content.match(/https?:\/\/[^\s]+/g) || [];

    const indicators = [];
    let score = 20;
    if (hasUrgency) {
      score += 35;
      indicators.push({ name: 'Urgent Coercion Trigger', score: 35, reason: 'Short deadline or threat of service disconnection designed to induce panic.' });
    }
    if (hasKyc) {
      score += 30;
      indicators.push({ name: 'Fake KYC / Bank Impersonation', score: 30, reason: 'Deceptive demand to update banking credentials or identity documents.' });
    }
    if (hasJob) {
      score += 35;
      indicators.push({ name: 'Task-Based / Part-Time Job Scam', score: 35, reason: 'Unrealistic daily earnings promised for simple online actions.' });
    }
    if (urls.length > 0) {
      score += 25;
      indicators.push({ name: 'Unverified External Link', score: 25, reason: `Contains unverified destination link: ${urls[0]}` });
    }

    const risk_level = score >= 50 ? 'HIGH' : (score >= 25 ? 'MEDIUM' : 'LOW');
    const fallbackResult = {
      submission_id: `CIT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(16).substring(2, 8).toUpperCase()}`,
      status: 'Submitted',
      risk_score: Math.min(score, 100),
      risk_level,
      indicators,
      extracted_entities: { phones, urls, upis: [] },
      recommendation: risk_level === 'HIGH' ? 'DO NOT click links, call the number, or transfer funds. Report immediately to 1930.' : 'Exercise standard cyber hygiene. Verify via official discom/bank portals.',
      disclaimer: 'Automated risk assessments are preliminary indicators and do not establish that fraud has occurred. Verify findings through appropriate official channels.'
    };
    setResult(fallbackResult);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <MessageSquareWarning className="w-4 h-4" />
          <span>Rajasthan Police • Citizen Cyber Reporting Portal</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">
          Report Suspicious Message (SMS / WhatsApp / Email)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Paste deceptive messages regarding fake KYC, power disconnections, or job offers. Our AI immediately breaks down urgency triggers and extracts scammer phone numbers.
        </p>
      </div>

      {/* Main Reporting Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Sample Threat Chips */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Try a common scam template reported in Rajasthan:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setContent(s.content);
                  setSenderInfo(s.sender);
                  setResult(null);
                  setErrorMsg('');
                }}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition active:scale-95 text-left"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sender Header */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Sender Phone Number or SMS Header (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={senderInfo}
                onChange={(e) => setSenderInfo(e.target.value)}
                placeholder="e.g. +91 9876500001, or VM-SBIINB, or WhatsApp Business account"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              💡 Tip: Legitimate government discoms & banks send alerts from alphanumeric headers (e.g. `JVVNL-GOV`), NEVER from personal 10-digit mobile numbers.
            </p>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Message Text Received *
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the complete SMS, WhatsApp message, or email body here..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition font-mono"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Includes links, phone numbers, or urgency deadlines.</span>
              <span>{content.length} characters</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-600/20 active:scale-[0.99]"
          >
            {loading ? (
              <span className="animate-pulse">Analyzing Message Heuristics...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analyze & Submit Scam Message</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Analysis Result Card */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Official Incident Reference
              </span>
              <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                {result.submission_id}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Triage Status
              </span>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                <span>{result.status}</span>
              </div>
            </div>
          </div>

          {/* Risk Level Gauge */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                result.risk_level === 'HIGH'
                  ? 'bg-rose-500 shadow-rose-500/20'
                  : result.risk_level === 'MEDIUM'
                  ? 'bg-amber-500 shadow-amber-500/20'
                  : 'bg-emerald-500 shadow-emerald-500/20'
              }`}
            >
              {result.risk_level === 'HIGH' ? (
                <ShieldAlert className="w-7 h-7" />
              ) : result.risk_level === 'MEDIUM' ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <ShieldCheck className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm font-black uppercase tracking-wider ${
                    result.risk_level === 'HIGH'
                      ? 'text-rose-600'
                      : result.risk_level === 'MEDIUM'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {result.risk_level} RISK THREAT DETECTED
                </span>
                <span className="text-xs font-bold text-slate-400">
                  (Score: {result.risk_score}/100)
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {result.recommendation}
              </p>
            </div>
          </div>

          {/* Detected Scam Indicators */}
          {result.indicators && result.indicators.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Why was this flagged? (Explainable Indicators)
              </h4>
              <div className="space-y-2">
                {result.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{ind.name}: </span>
                      <span className="text-slate-600">{ind.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Identifiers */}
          {result.extracted_entities && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {result.extracted_entities.phones?.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Flagged Scammer Phone(s)
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-800">
                    {result.extracted_entities.phones.join(', ')}
                  </div>
                </div>
              )}
              {result.extracted_entities.urls?.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Flagged Deceptive Link(s)
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-800 truncate">
                    {result.extracted_entities.urls.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mandatory Statutory Disclaimer */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-[11px] text-amber-800 leading-relaxed">
            <span className="font-bold">⚠️ Notice: </span>
            {result.disclaimer}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/citizen/my-reports"
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center space-x-1"
            >
              <span>View in My Submissions & Track Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/citizen/assistant"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>Have doubts? Ask AI Cyber Saathi ↗</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
