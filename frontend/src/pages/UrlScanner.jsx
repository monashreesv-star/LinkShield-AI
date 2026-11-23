import React, { useState } from 'react';
import {
  Link2,
  Search,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const URL_SAMPLES = [
  { label: 'SBI Typosquat', url: 'http://sbi-banking-login.cc/netbanking/auth' },
  { label: 'JVVNL Impersonation', url: 'http://jvvnl-bijli-update.online/pay' },
  { label: 'Naked IP Phishing', url: 'http://185.193.125.77/pan-update.html' },
  { label: 'Official Gov Portal (Clean)', url: 'https://energy.rajasthan.gov.in/jvvnl' }
];

export default function UrlScanner() {
  const [url, setUrl] = useState(URL_SAMPLES[0].url);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch('/api/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Server error (${res.status})`);
      }
      if (!res.ok) {
        throw new Error(data?.detail || 'URL Scan failed');
      }
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
          <Link2 className="w-4 h-4" />
          <span>Domain & Typosquatting Hunter</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">Phishing & Look-Alike URL Scanner</h1>
        <p className="text-xs text-slate-500 mt-1">
          Decomposes URL components, analyzes typosquatting against Indian banking portals, detects Punycode and naked IP hosts.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        {/* Quick Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Test Samples:</span>
          {URL_SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(s.url);
                setResult(null);
                setErrorMsg('');
              }}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleScan} className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. http://sbi-kyc-update.cc/verify"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center space-x-2"
          >
            <span>{loading ? 'Scanning...' : 'Scan URL'}</span>
          </button>
        </form>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Scan Results */}
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
                    {result.risk_level} RISK DOMAIN
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Case #{result.case_id}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mt-1">{result.recommendation}</h3>
              </div>
            </div>

            <Link
              to={`/cases?id=${result.case_id}`}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 self-start md:self-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open Case Dossier</span>
            </Link>
          </div>

          {/* Triggered Forensic Indicators */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Triggered Heuristic Indicators ({result.indicators?.length || 0})
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
                <div className="text-xs text-emerald-600 font-medium">No malicious heuristics flagged. Clean URL structure.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
