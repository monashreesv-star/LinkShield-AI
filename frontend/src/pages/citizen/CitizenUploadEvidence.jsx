import React, { useState } from 'react';
import {
  Upload,
  Send,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
  FileCheck,
  PhoneCall,
  Clock,
  ArrowRight,
  Eye,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CitizenUploadEvidence() {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [notes, setNotes] = useState('');
  const [moneyLost, setMoneyLost] = useState('');
  const [hoursAgo, setHoursAgo] = useState('0-2'); // '0-2', '2-24', '24+'
  const [scammerContact, setScammerContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Client-side SHA-256 Hash Calculation for Chain of Custody
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      setErrorMsg('File exceeds 10MB limit. Please upload a smaller screenshot or file.');
      return;
    }

    setFile(selected);
    setErrorMsg('');

    // If image, create preview
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setFilePreview(event.target.result);
      reader.readAsDataURL(selected);
    } else {
      setFilePreview(null);
    }

    // Compute SHA-256 hash
    const hashReader = new FileReader();
    hashReader.onload = async (event) => {
      try {
        const buffer = event.target.result;
        const digestBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(digestBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        setFileHash(hashHex);
      } catch (err) {
        console.error('Hash error:', err);
      }
    };
    hashReader.readAsArrayBuffer(selected);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!file) {
      setErrorMsg('Please select an evidence screenshot, transaction receipt, or file to upload.');
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMsg('');

    const token = localStorage.getItem('ls_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const formData = new FormData();
      formData.append('file', file);

      let contextDescription = notes.trim();
      if (moneyLost.trim()) {
        contextDescription += `\n[Reported Financial Loss: Rs. ${moneyLost.trim()} | Time Window: ${hoursAgo} hours ago]`;
      }
      if (scammerContact.trim()) {
        contextDescription += `\n[Scammer Account / Phone: ${scammerContact.trim()}]`;
      }
      if (fileHash) {
        contextDescription += `\n[Client-Verified SHA-256 Digest: ${fileHash}]`;
      }

      formData.append('notes', contextDescription);

      const res = await fetch('/api/citizen/upload-evidence', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Evidence upload failed');
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <Upload className="w-4 h-4" />
          <span>Rajasthan Police • Citizen Cyber Reporting Portal</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">
          Upload Digital Evidence & Chain-of-Custody Vault
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit screenshots of fraudulent WhatsApp chats, payment transaction slips, fake loan APKs, or bank SMS alerts. Files are cryptographically fingerprinted under Section 65B Indian Evidence Act standards.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Golden Hour Emergency Alert Box */}
        {moneyLost && hoursAgo === '0-2' && (
          <div className="p-4 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border-2 border-rose-500/40 rounded-2xl animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="text-xs font-black uppercase text-rose-700 tracking-wider">
                  🚨 CRITICAL 'GOLDEN HOUR' FINANCIAL FREEZE OPPORTUNITY
                </span>
              </div>
              <a
                href="tel:1930"
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center space-x-1 shadow-md shadow-rose-600/30"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 1930 Helpline</span>
              </a>
            </div>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              You reported a financial loss within the last 2 hours! Dial <strong className="text-rose-700">1930 immediately</strong> to instruct Rajasthan Cyber Police & NPCI to freeze the recipient mule account before the money is withdrawn.
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Screenshot or Evidence File (PNG, JPG, PDF, TXT, APK — Max 10MB) *
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-cyan-500 rounded-2xl p-6 text-center bg-slate-50/70 transition flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-cyan-600 mb-2" />
              <div className="text-xs font-bold text-slate-700">
                {file ? file.name : 'Click to select or drag and drop evidence file'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Supported: WhatsApp chat screenshots, UPI receipts, payment slips, APK files
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.txt,.apk"
                className="mt-3 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Cryptographic Hash Badge */}
          {fileHash && (
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2 truncate mr-3">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-700 shrink-0">SHA-256 Digest:</span>
                <span className="text-slate-500 truncate">{fileHash}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                Sec 65B Ready
              </span>
            </div>
          )}

          {/* Image Preview if available */}
          {filePreview && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Screenshot Preview
              </span>
              <img
                src={filePreview}
                alt="Evidence Preview"
                className="rounded-xl max-h-48 object-contain border border-slate-200"
              />
            </div>
          )}

          {/* Loss & Scammer Context Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Money Lost (Rs.) (If Any)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="number"
                  value={moneyLost}
                  onChange={(e) => setMoneyLost(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                When Did This Occur?
              </label>
              <select
                value={hoursAgo}
                onChange={(e) => setHoursAgo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition"
              >
                <option value="0-2">Within last 2 Hours (Golden Hour)</option>
                <option value="2-24">Between 2 to 24 Hours</option>
                <option value="24+">More than 24 Hours Ago</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Scammer UPI / Phone
              </label>
              <input
                type="text"
                value={scammerContact}
                onChange={(e) => setScammerContact(e.target.value)}
                placeholder="e.g. scammer@ybl, 98765..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Description Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Describe How the Incident Happened (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Scammer contacted on WhatsApp offering part-time task, sent QR code, and money was debited..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition font-sans"
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-600/20 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Uploading to Chain-of-Custody Vault...</span>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Upload Evidence & Register Complaint</span>
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
                Vault Status
              </span>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Evidence Preserved ({result.status})</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-1">
              Evidence Attached: <span className="font-mono text-cyan-700">{result.evidence_filename}</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your digital proof has been logged into the police investigation registry. An investigating officer from Rajasthan Cyber Command will review the attached file.
            </p>
          </div>

          {/* Disclaimer */}
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
              <span>Ask AI Cyber Saathi about this case ↗</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
