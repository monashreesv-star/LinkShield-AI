import React, { useState } from 'react';
import {
  Link2,
  Send,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Globe,
  Lock,
  Unlock,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const URL_SAMPLES = [
  {
    title: '🏦 SBI Banking Typosquat',
    url: 'http://sbi-banking-login.cc/netbanking/auth',
    target: 'State Bank of India',
    why: 'Uses unofficial `.cc` domain with plain HTTP to steal NetBanking passwords'
  },
  {
    title: '⚡ JVVNL Electricity Impersonation',
    url: 'http://jvvnl-bijli-update.online/pay',
    target: 'Jaipur Vidyut Vitran Nigam Ltd',
    why: 'Typosquatted domain with fake payment gateway targeting Rajasthan consumers'
  },
  {
    title: '⚠️ Naked IP Phishing Host',
    url: 'http://185.193.125.77/pan-update.html',
    target: 'Direct IP Server',
    why: 'Bypasses DNS domain reputation using raw unencrypted IP address'
  },
  {
    title: '✅ Official Gov Portal (Genuine)',
    url: 'https://energy.rajasthan.gov.in/jvvnl',
    target: 'Official Government of Rajasthan',
    why: 'Secure HTTPS verified under genuine `.rajasthan.gov.in` domain'
  }
];

export default function CitizenReportUrl() {
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!url.trim()) {
      setErrorMsg('Please enter a link or website address.');
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
      const fullContent = notes.trim()
        ? `[Citizen URL Report]\nURL: ${url.trim()}\nContext / Notes: ${notes.trim()}`
        : url.trim();

      const res = await fetch('/api/citizen/report', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          submission_type: 'URL',
          content: fullContent
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'URL analysis failed');
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <Link2 className="w-4 h-4" />
          <span>Rajasthan Police • Citizen Cyber Reporting Portal</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">
          Report Suspicious Link & Lookalike Domain
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Received an unverified web link? Scan it before clicking. Our engine checks for deceptive typosquatting, insecure connections, and known malicious blacklists across Rajasthan.
        </p>
      </div>

      {/* Main Reporting Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Sample Links */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Try a sample URL tested in cyber forensics:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {URL_SAMPLES.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(s.url);
                  setNotes(`Reported lookalike target: ${s.target}`);
                  setResult(null);
                  setErrorMsg('');
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition active:scale-[0.99]"
              >
                <div className="text-xs font-bold text-slate-800">{s.title}</div>
                <div className="text-[11px] font-mono text-cyan-700 truncate mt-0.5">{s.url}</div>
                <div className="text-[10px] text-slate-400 mt-1 leading-snug">{s.why}</div>
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
          {/* Target URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Website URL / Link *
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. http://sbi-banking-login.cc/netbanking or jvvnl-bijli-update.online"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition font-mono"
              />
            </div>
          </div>

          {/* Context Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Where did you receive this link? (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received via WhatsApp message claiming unpaid electricity bill"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Pre-Click Safety Warning */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start space-x-3 text-xs text-amber-800">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="leading-relaxed">
              <span className="font-bold">Citizen Safety Tip: </span>
              Never enter banking passwords, OTPs, or Aadhaar numbers on unverified websites. Official Government of Rajasthan websites strictly end in <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">.rajasthan.gov.in</code> or <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">.gov.in</code>.
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-600/20 active:scale-[0.99]"
          >
            {loading ? (
              <span className="animate-pulse">Inspecting Domain Heuristics...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Scan Link & Submit to Police Registry</span>
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
                  {result.risk_level} RISK LINK
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

          {/* Detected Domain Indicators */}
          {result.indicators && result.indicators.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Technical Deception Markers Detected:
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
              <span>Track Incident in My Submissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/citizen/assistant"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>Ask AI Cyber Saathi about this link ↗</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
