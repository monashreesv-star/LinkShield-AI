import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Link2,
  Globe,
  Upload,
  Send,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Phone,
  CreditCard,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLES = {
  Message: [
    {
      title: 'Electricity Cutoff Panic SMS',
      content: 'Dear Consumer, Your electricity connection will be disconnected tonight at 9:30 PM from the power office because your previous month bill was not updated. Please immediately contact our officer at +91 9876500001 or pay at http://jvvnl-bijli-update.online. Urgently pay pending Rs. 450.'
    },
    {
      title: 'SBI NetBanking KYC Lock',
      content: 'SBI Alert: Dear customer, your SBI account has been blocked due to pending KYC verification. Click http://sbi-kyc-verify.cc to update your Aadhaar and PAN immediately.'
    },
    {
      title: 'Part-Time Job Task Offer',
      content: 'Hello! I am HR from Global Media. Like 3 YouTube videos and earn Rs 3,000 daily! Contact our manager on WhatsApp 9876500005.'
    }
  ],
  URL: [
    { title: 'SBI Typosquat Domain', content: 'http://sbi-banking-login.cc/netbanking/auth' },
    { title: 'Fake Power Discom Link', content: 'http://jvvnl-bijli-update.online/pay' }
  ],
  Website: [
    {
      title: '35% Weekly ROI Ponzi',
      content: 'Welcome to RoyalGrow! Invest Rs 5,000 today and receive guaranteed 35% weekly returns! Transfer to UPI: royalwealth@ybl or WhatsApp +91 9876500001.'
    },
    {
      title: 'Color Prediction Betting',
      content: 'Daman Win Club: Predict Red or Green color and double your money in 30 seconds! Direct UPI recharge to damanpay@okaxis.'
    }
  ]
};

export default function CitizenReportForm({ defaultType = 'Message' }) {
  const [reportType, setReportType] = useState(defaultType); // 'Message', 'URL', 'Website', 'Evidence'
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setResult(null);
    setErrorMsg('');

    const token = localStorage.getItem('ls_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (reportType === 'Evidence') {
        if (!file) throw new Error('Please select an evidence screenshot or document to upload.');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('notes', notes);

        const res = await fetch('/api/citizen/upload-evidence', {
          method: 'POST',
          headers,
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Upload failed');
        setResult(data);
      } else {
        if (!content.trim()) throw new Error('Please provide the suspicious content to analyze.');

        const res = await fetch('/api/citizen/report', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submission_type: reportType,
            content: content.trim()
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Analysis failed');
        setResult(data);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <ShieldAlert className="w-4 h-4" />
          <span>Rajasthan Police • Citizen Cyber Reporting Portal</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">
          Report Suspicious Incident & Instant Risk Triage
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit deceptive messages, unverified links, or fraudulent platforms. Our AI engine instantly evaluates threat indicators and routes the complaint to the cyber crime police cell.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Report Type Selector */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-100">
          {[
            { id: 'Message', label: 'Suspicious Message (SMS/WhatsApp)', icon: MessageSquareWarning },
            { id: 'URL', label: 'Suspicious URL / Link', icon: Link2 },
            { id: 'Website', label: 'Fraudulent Scheme / Website', icon: Globe },
            { id: 'Evidence', label: 'Upload Screenshot / File', icon: Upload }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = reportType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setReportType(tab.id);
                  setResult(null);
                  setErrorMsg('');
                  setContent('');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Samples for Demo */}
        {SAMPLES[reportType] && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-400">Sample Threats:</span>
            {SAMPLES[reportType].map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setContent(s.content);
                  setResult(null);
                  setErrorMsg('');
                }}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition"
              >
                {s.title}
              </button>
            ))}
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {reportType === 'Evidence' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Evidence Screenshot or File (PNG, JPG, PDF, TXT - Max 10MB)
                </label>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf,.txt,.html"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer border border-slate-200 rounded-xl p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Describe How the Scammer Contacted You (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Scammer demanded immediate electricity bill payment via WhatsApp and sent this QR code..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {reportType === 'URL'
                  ? 'Suspicious Link / Web Address'
                  : reportType === 'Website'
                  ? 'Promotional Text / Scheme Description'
                  : 'Suspicious SMS, WhatsApp Message, or Email Text'}
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  reportType === 'URL'
                    ? 'e.g. http://sbi-kyc-verify.cc/login'
                    : 'Paste the exact text received from the suspicious sender...'
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
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
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition flex items-center space-x-2"
            >
              <span>{loading ? 'Evaluating Risk & Submitting...' : 'Analyze & Submit Report'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Instant Citizen Risk Analysis Result */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-6 animate-in fade-in duration-300">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
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
                  <span className="text-xs text-slate-500 font-mono font-bold">
                    Ref: {result.submission_id}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-1 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Status: <strong>{result.status}</strong> (Routed to Rajasthan Cyber Police Cell)</span>
                </div>
              </div>
            </div>

            <Link
              to={`/citizen/my-reports?id=${result.submission_id}`}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Track Report Status</span>
            </Link>
          </div>

          {/* Safety Recommendation Banner */}
          {result.recommendation && (
            <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Recommended Citizen Safety Action</span>
              </div>
              <p className="text-xs text-blue-950 font-medium leading-relaxed">
                {result.recommendation}
              </p>
            </div>
          )}

          {/* Extracted Identifiers */}
          {result.extracted_entities && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Actionable Extracted Identifiers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {result.extracted_entities.phones?.map((p, i) => (
                  <div key={i} className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase">Suspicious Phone</div>
                      <div className="font-mono font-bold text-emerald-950">{p}</div>
                    </div>
                  </div>
                ))}
                {result.extracted_entities.upis?.map((u, i) => (
                  <div key={i} className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs flex items-center space-x-2">
                    <CreditCard className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-purple-600 uppercase">Flagged UPI VPA</div>
                      <div className="font-mono font-bold text-purple-950 break-all">{u}</div>
                    </div>
                  </div>
                ))}
                {result.extracted_entities.domains?.map((d, i) => (
                  <div key={i} className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-xs flex items-center space-x-2">
                    <Globe className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-cyan-600 uppercase">Phishing Domain</div>
                      <div className="font-mono font-bold text-cyan-950 break-all">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Triggered Indicators */}
          {result.indicators && result.indicators.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Why Was This Flagged? ({result.indicators.length} Heuristic Reasons)
              </h4>
              <div className="space-y-2">
                {result.indicators.map((ind, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{ind.name}</div>
                      <div className="text-slate-600 mt-0.5">{ind.reason}</div>
                    </div>
                    <span className="font-mono font-bold text-rose-600 shrink-0 ml-3">
                      +{ind.score} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mandatory Statutory Disclaimer */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Notice:</strong> {result.disclaimer}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
