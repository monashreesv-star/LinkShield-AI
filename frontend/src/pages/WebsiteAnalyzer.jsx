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
  Coins,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const [errorMsg, setErrorMsg] = useState('');

  const handleScan = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setResult(null);
    setErrorMsg('');

    try {
      if (mode === 'text') {
        const res = await fetch('/api/analyze/website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, content })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Analysis failed');
        setResult(data);
      } else if (mode === 'fetch') {
        const res = await fetch('/api/analyze/website/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Remote fetch failed');
        setResult(data);
      } else if (mode === 'upload') {
        if (!file) throw new Error('Please select an HTML or TXT file to upload.');
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/analyze/website/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'File upload analysis failed');
        setResult(data);
      }
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
          <Globe className="w-4 h-4" />
          <span>Ponzi, MLM & Illegal Betting Inspector</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">Fraudulent Website & Scheme Analyzer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Scans promotional web pages for guaranteed ROI claims, multi-level referral trees, illegal betting operations, and extracts UPI VPAs and crypto wallets.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Mode Selector & Quick Samples */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setMode('text');
                setErrorMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                mode === 'text' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Paste Web Content
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('fetch');
                setErrorMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                mode === 'fetch' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Safe Remote Fetch (SSRF Protected)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('upload');
                setErrorMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                mode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
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
                    setResult(null);
                    setErrorMsg('');
                  }}
                  className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md font-medium text-slate-700 transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Forms */}
        <form onSubmit={handleScan} className="space-y-4">
          {mode === 'text' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Website URL (Optional Reference)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://royalgrow-vip.top"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Web Page Body / Promotional Text
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste page text, referral copy, or HTML body..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition font-mono"
                  required
                />
              </div>
            </>
          )}

          {mode === 'fetch' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target URL (Safely Scraped Without Script Execution)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://damanwin-club.online"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-1.5"></span>
                SSRF Safeguard: Private subnets (127.0.0.1, 192.168.x, 10.x, metadata IPs) are automatically blocked.
              </p>
            </div>
          )}

          {mode === 'upload' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select HTML / Text File (Max 2MB)
              </label>
              <input
                type="file"
                accept=".html,.htm,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                required
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-2"
            >
              <span>{loading ? 'Analyzing Platform...' : 'Scan Web Platform'}</span>
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
                    {result.risk_level} RISK SCHEME
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
              Detected Platform Violations ({result.indicators?.length || 0})
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
                <div className="text-xs text-emerald-600 font-medium">No fraudulent scheme indicators identified.</div>
              )}
            </div>
          </div>

          {/* Extracted Identifiers */}
          {result.extracted_entities && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Actionable Extracted Payment & Telephony Identifiers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {result.extracted_entities.upis?.map((upi, i) => (
                  <div key={i} className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-purple-600">Mule UPI VPA</div>
                      <div className="font-mono font-bold text-purple-900 break-all">{upi}</div>
                    </div>
                  </div>
                ))}
                {result.extracted_entities.phones?.map((phone, i) => (
                  <div key={i} className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-emerald-600">Scam Phone</div>
                      <div className="font-mono font-bold text-emerald-900">{phone}</div>
                    </div>
                  </div>
                ))}
                {result.extracted_entities.crypto_wallets?.map((w, i) => (
                  <div key={i} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-600">Crypto Wallet</div>
                      <div className="font-mono font-bold text-amber-900 break-all">{w}</div>
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
