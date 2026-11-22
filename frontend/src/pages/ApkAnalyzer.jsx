import React, { useState } from 'react';
import {
  Smartphone,
  Upload,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Server,
  Lock,
  CheckCircle2
} from 'lucide-react';

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

  const handleScan = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setResult(null);

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
        setResult(data);
      } else {
        if (!file) throw new Error('Please select an APK package to upload.');
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/analyze/apk/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      alert('APK audit error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <Smartphone className="w-4 h-4" />
          <span>Module 4 • Static Android Package Auditor</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">Malicious & Predatory Loan APK Inspector</h1>
        <p className="text-xs text-slate-500 mt-1">
          Audits Android manifest permissions, detects predatory loan extortion signatures (contact and SMS harvesting), and unmasks embedded C2 servers without executing binaries.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setTab('metadata')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                tab === 'metadata' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Audit Manifest Metadata
            </button>
            <button
              onClick={() => setTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                tab === 'upload' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-medium"
                >
                  {s.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          {tab === 'upload' ? (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Select Android APK File (Max 50MB, Safely Parsed As Zip)
              </label>
              <input
                type="file"
                accept=".apk"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-2">
                🔒 <b>Sandbox Guarantee:</b> The engine extracts manifest XML strings and DEX byte strings. APK code is never run.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">App Display Name</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Package Name</label>
                  <input
                    type="text"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Requested Permissions (Comma Separated)
                </label>
                <textarea
                  rows={2}
                  value={perms}
                  onChange={(e) => setPerms(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Embedded URLs</label>
                  <input
                    type="text"
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Embedded C2 IPs</label>
                  <input
                    type="text"
                    value={ips}
                    onChange={(e) => setIps(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition flex items-center space-x-2"
            >
              {loading ? <span>Analyzing Package...</span> : <span>Run Static Audit</span>}
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
                      {result.risk_level} THREAT APP
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

          {/* Indicators */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Permission & Static Signature Analysis
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
      )}
    </div>
  );
}
