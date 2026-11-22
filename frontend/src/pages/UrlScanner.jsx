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
  AlertTriangle
} from 'lucide-react';

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

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('URL scan error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <Link2 className="w-4 h-4" />
          <span>Module 2 • Domain & URL Inspector</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">Phishing & Look-Alike URL Scanner</h1>
        <p className="text-xs text-slate-500 mt-1">
          Decomposes URL components, analyzes typosquatting against Indian banking portals, detects Punycode and naked IP hosts.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Test URLs:</span>
          {URL_SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUrl(s.url)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleScan} className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter suspicious link (e.g., http://sbi-kyc-verify.cc/login)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition flex items-center space-x-2 shrink-0 disabled:opacity-50"
          >
            {loading ? <span>Scanning...</span> : <span>Scan Destination</span>}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
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
                      {result.risk_level} RISK LINK
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
                onClick={() => window.open(`/api/cases/${result.case_id}/pdf`, '_blank')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          {/* Indicators list */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Technical Domain & URL Indicators
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
                  <span>Verified Domain: No malicious patterns or typosquatting flags found.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
