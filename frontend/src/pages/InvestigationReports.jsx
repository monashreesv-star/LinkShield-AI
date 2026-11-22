import React, { useState, useEffect } from 'react';
import { FileText, Download, ShieldCheck, Printer, Search, ExternalLink } from 'lucide-react';

export default function InvestigationReports() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/cases?limit=50')
      .then((res) => res.json())
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Reports fetch error:', err);
        setLoading(false);
      });
  }, []);

  const filtered = cases.filter(
    (c) =>
      c.case_id.toLowerCase().includes(search.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
      c.source_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
            <FileText className="w-4 h-4" />
            <span>Module 8 • Forensic Documentation & Section 65B</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Investigation Evidence Dossiers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generates standardized, court-admissible forensic PDF reports compliant with Section 65B of the Indian Evidence Act.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report by Case ID..."
            className="w-full bg-white border border-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Compliance Callout Banner */}
      <div className="p-4 bg-gradient-to-r from-cyan-900 to-slate-900 text-white rounded-2xl flex items-center justify-between border border-cyan-800/60 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-xs uppercase tracking-wider text-cyan-300">
              Section 65B Indian Evidence Act Compliance
            </span>
            <p className="text-xs text-slate-300 mt-0.5">
              Each generated report contains a cryptographic SHA-256 evidence digest, system certification timestamp, and unmanipulated raw threat logs.
            </p>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Case Reference ID</th>
                <th className="py-3 px-4">Subject Description</th>
                <th className="py-3 px-4">Risk Rating</th>
                <th className="py-3 px-4">Evidence Hash (SHA-256)</th>
                <th className="py-3 px-4">Date Registered</th>
                <th className="py-3 px-4 text-right">Dossier Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.case_id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-700">{c.case_id}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{c.title || c.source_type}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        c.risk_level === 'HIGH'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : c.risk_level === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {c.risk_level} ({c.risk_score}/100)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                    {c.evidence_hash?.slice(0, 16)}...
                  </td>
                  <td className="py-3 px-4 text-slate-500">{c.created_at}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => window.open(`/api/cases/${c.case_id}/pdf`, '_blank')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold rounded-lg text-xs shadow-xs transition inline-flex items-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
