import React, { useState } from 'react';
import {
  Smartphone,
  Upload,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Server,
  Lock,
  CheckCircle2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

const APK_SAMPLES = [
  {
    name: 'RupeeQuick Instant Loan',
    pkg: 'com.fastcash.rupeeloan',
    perms: 'android.permission.READ_CONTACTS, android.permission.READ_SMS, android.permission.CAMERA, android.permission.ACCESS_FINE_LOCATION, android.permission.WRITE_EXTERNAL_STORAGE',
    urls: 'http://download.rupeeloan.cc/app.apk',
    ips: '194.26.29.112'
  },
  {
    name: 'CashStar Fast Credit',
    pkg: 'com.starcredit.cashapp',
    perms: 'android.permission.READ_CONTACTS, android.permission.READ_SMS, android.permission.RECORD_AUDIO, android.permission.SEND_SMS',
    urls: 'http://api.cashstar-loan.cc/upload',
    ips: '45.130.22.99'
  },
  {
    name: 'Standard Utility Calculator (Clean)',
    pkg: 'com.simple.calculator',
    perms: 'android.permission.VIBRATE, android.permission.INTERNET',
    urls: '',
    ips: ''
  }
];

export default function ApkAnalyzer() {
  const [tab, setTab] = useState('metadata'); // 'metadata' or 'upload'
  const [appName, setAppName] = useState(APK_SAMPLES[0].name);
  const [pkgName, setPkgName] = useState(APK_SAMPLES[0].pkg);
  const [perms, setPerms] = useState(APK_SAMPLES[0].perms);
  const [urls, setUrls] = useState(APK_SAMPLES[0].urls);
  const [ips, setIps] = useState(APK_SAMPLES[0].ips);
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
      if (tab === 'metadata') {
        const res = await fetch('/api/analyze/apk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app_name: appName,
            package_name: pkgName,
            permissions: perms.split(',').map((p) => p.trim()).filter(Boolean),
            embedded_urls: urls.split(',').map((u) => u.trim()).filter(Boolean),
            embedded_ips: ips.split(',').map((i) => i.trim()).filter(Boolean)
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Metadata audit failed');
        setResult(data);
      } else {
        if (!file) throw new Error('Please select an Android APK package to upload.');

        if (!file.name.toLowerCase().endsWith('.apk')) {
          throw new Error(`Invalid File: '${file.name}' is not an Android Package (.apk). Please select a valid .apk file.`);
        }

        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/analyze/apk/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'APK Binary Audit failed');
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
          <Smartphone className="w-4 h-4" />
          <span>Predatory Loan & Spyware APK Auditor</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">Malicious Android Package Inspector</h1>
        <p className="text-xs text-slate-500 mt-1">
          Audits Android manifest permissions, detects predatory loan extortion signatures (contact and SMS harvesting), and unmasks embedded C2 servers without executing binaries.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Tab Selector & Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setTab('metadata');
                setErrorMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                tab === 'metadata' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Audit Manifest Metadata
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('upload');
                setErrorMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                tab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Upload Safe Test APK (.apk)
            </button>
          </div>

          {tab === 'metadata' && (
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-400 font-semibold">Samples:</span>
              {APK_SAMPLES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAppName(s.name);
                    setPkgName(s.pkg);
                    setPerms(s.perms);
                    setUrls(s.urls);
                    setIps(s.ips);
                    setResult(null);
                    setErrorMsg('');
                  }}
                  className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md font-medium text-slate-700 transition"
                >
                  {s.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Forms */}
        <form onSubmit={handleScan} className="space-y-4">
          {tab === 'metadata' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Package Name (e.g. com.fastcash.loan)
                </label>
                <input
                  type="text"
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition font-mono"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Manifest Permissions (Comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={perms}
                  onChange={(e) => setPerms(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition font-mono"
                  placeholder="android.permission.READ_CONTACTS, android.permission.READ_SMS..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Extracted C2 URLs (Comma-separated)
                </label>
                <input
                  type="text"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hardcoded C2 IP Addresses
                </label>
                <input
                  type="text"
                  value={ips}
                  onChange={(e) => setIps(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition font-mono"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Android APK File (Max 50MB, Safely parsed as ZIP)
              </label>
              <input
                type="file"
                accept=".apk"
                onChange={(e) => {
                  const selected = e.target.files[0];
                  setFile(selected);
                  setErrorMsg('');
                  if (selected && !selected.name.toLowerCase().endsWith('.apk')) {
                    setErrorMsg(`Warning: '${selected.name}' is not an .apk file. Please choose an Android package.`);
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                required
              />
              <p className="text-[11px] text-slate-400 mt-2 flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                <span>Sandbox Guarantee: The engine extracts manifest XML strings and DEX byte strings. APK code is never run.</span>
              </p>
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
              <span>{loading ? 'Performing Static Audit...' : 'Run Static Audit'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {result && result.risk_score !== undefined && (
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
                    {result.risk_level} THREAT APP
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
              Permission & Static Signature Analysis ({result.indicators?.length || 0})
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
                <div className="text-xs text-emerald-600 font-medium">Standard harmless utility permissions. No predatory loan signatures detected.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
