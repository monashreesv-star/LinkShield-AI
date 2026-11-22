import React, { useState } from 'react';
import {
  Globe,
  Upload,
  Send,
  ShieldAlert,
  CreditCard,
  Phone,
  FileText,
  AlertCircle,
  TrendingUp,
  Coins
} from 'lucide-react';

const WEB_SAMPLES = [
  {
    label: '📈 35% Weekly ROI Ponzi',
    url: 'http://royalgrow-vip.top',
    content: 'Welcome to RoyalGrow Wealth! Invest Rs. 5000 today and receive guaranteed 35% weekly returns! Invite 5 friends to unlock VIP Level 3 bonus and earn 10% daily team income. 100% risk free SEBI certified fund. Transfer funds directly to UPI ID: royalwealth@ybl or WhatsApp +91 9876500001.'
  },
  {
    label: '🎰 Color Prediction Betting',
    url: 'http://damanwin-club.online',
    content: "Daman Win Club: India's No. 1 Color Prediction Game! Predict Red or Green and double your money in 30 seconds! Recharge your wallet now: Min deposit Rs 500. Direct UPI recharge to: damanpay@okaxis. Quick withdrawal to any bank account."
  },
  {
    label: '🪙 Crypto High-Yield Bot',
    url: 'http://titancrypto-bot.cc',
    content: 'TitanCrypto Multiplier: Automated AI Arbitrage Bot guarantees 50% monthly profit on all USDT deposits. Minimum deposit: 100 USDT. Deposit TRC20 address: TXj6f8Lz5rP9mKwQ2yUv1tXoZbN4eRcVa3. Instant daily withdrawals.'
  }
];

export default function WebsiteAnalyzer() {
  const [mode, setMode] = useState('text'); // 'text', 'fetch', 'upload'
  const [url, setUrl] = useState(WEB_SAMPLES[0].url);
  const [content, setContent] = useState(WEB_SAMPLES[0].content);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      if (mode === 'text') {
        const res = await fetch('/api/analyze/website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, content })
        });
        const data = await res.json();
        setResult(data);
      } else if (mode === 'fetch') {
        const res = await fetch('/api/analyze/website/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Fetch failed');
        }
        const data = await res.json();
        setResult(data);
      } else if (mode === 'upload') {
        if (!file) throw new Error('Please select an HTML file to upload');
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/analyze/website/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      alert('Website analysis error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <Globe className="w-4 h-4" />
          <span>Module 3 • Scheme & Platform Inspector</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">Fraudulent Website & Ponzi Scheme Analyzer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Scans promotional web pages for guaranteed ROI claims, multi-level marketing trees, illegal betting, and extracts UPI VPAs and crypto wallets.
        </p>
      </div>

      {/* Input Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Mode Switcher */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setMode('text')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                mode === 'text' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Paste Web Content
            </button>
            <button
              onClick={() => setMode('fetch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                mode === 'fetch' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Safe Remote Fetch (SSRF Protected)
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                mode === 'upload' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Upload Saved HTML
            </button>
          </div>

          {mode === 'text' && (
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-400 font-semibold">Samples:</span>
              {WEB_SAMPLES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUrl(s.url);
                    setContent(s.content);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-medium"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          {mode === 'fetch' ? (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Target URL (Safely Scraped without Script Execution)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/investment-plan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                🛡️ <b>SSRF Safeguard:</b> Private subnets (127.0.0.1, 192.168.x, 10.x, metadata IPs) are automatically blocked.
              </p>
            </div>
          ) : mode === 'upload' ? (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Select HTML / Text File (Max 2MB)
              </label>
              <input
                type="file"
                accept=".html,.htm,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Website URL (Optional reference)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://royalgrow-vip.top"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Web Page Body / Promotional Text
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste website text, terms, or investment promises here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition flex items-center space-x-2"
            >
              {loading ? <span>Analyzing Platform...</span> : <span>Scan Web Platform</span>}
            </button>
          </div>
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
                      {result.risk_level} RISK SCHEME
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Extracted Identifiers */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Payment & Contact Endpoints
              </h2>
              <div className="space-y-2 text-xs">
                {result.extracted_entities?.upi?.map((u, i) => (
                  <div key={i} className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                    <span className="font-mono text-purple-900">{u}</span>
                    <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">UPI</span>
                  </div>
                ))}

                {result.extracted_entities?.crypto?.map((c, i) => (
                  <div key={i} className="p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                    <span className="font-mono text-yellow-900 truncate max-w-xs">{c}</span>
                    <span className="text-[9px] font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded">CRYPTO</span>
                  </div>
                ))}

                {result.extracted_entities?.phone?.map((p, i) => (
                  <div key={i} className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <span className="font-mono text-emerald-900">{p}</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">PHONE</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicators */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs md:col-span-2 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Scheme Risk Breakdown
              </h2>
              <div className="space-y-2.5">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
