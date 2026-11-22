import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FolderGit2,
  Search,
  Filter,
  FileText,
  Plus,
  MessageSquare,
  ShieldAlert,
  Calendar,
  X,
  ExternalLink
} from 'lucide-react';

export default function CaseManagement() {
  const [searchParams] = useSearchParams();
  const [cases, setCases] = useState([]);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCase, setSelectedCase] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [author, setAuthor] = useState('Inspector Sharma');
  const [loading, setLoading] = useState(true);

  const fetchCases = () => {
    setLoading(true);
    let url = `/api/cases?risk=${riskFilter}`;
    if (searchQuery.trim()) {
      url += `&q=${encodeURIComponent(searchQuery.trim())}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCases(data);
        setLoading(false);

        // Auto-select if URL has id param
        const targetId = searchParams.get('id');
        if (targetId) {
          fetchCaseDetail(targetId);
        }
      })
      .catch((err) => {
        console.error('Failed to load cases:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCases();
  }, [riskFilter]);

  const fetchCaseDetail = (cid) => {
    fetch(`/api/cases/${cid}`)
      .then((res) => res.json())
      .then((data) => setSelectedCase(data))
      .catch((err) => console.error(err));
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedCase) return;

    try {
      const res = await fetch(`/api/cases/${selectedCase.case_id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, note_text: newNote })
      });
      if (res.ok) {
        setNewNote('');
        fetchCaseDetail(selectedCase.case_id);
      }
    } catch (err) {
      alert('Error adding note: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
            <FolderGit2 className="w-4 h-4" />
            <span>Module 6 • Evidence & Registry Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Investigation Case Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable registry of analyzed cybercrime incidents, preserved chain-of-custody hashes, and investigator notes.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-3">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchCases();
            }}
            className="relative"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword / VPA..."
              className="bg-white border border-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl focus:outline-none w-48 focus:w-64 transition-all"
            />
          </form>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Case Reference ID</th>
                <th className="py-3 px-4">Source Vector</th>
                <th className="py-3 px-4">Subject / Excerpt</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading records from SQLite...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No cases match the specified search parameters.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.case_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-700">{c.case_id}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{c.source_type}</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-sm">{c.title || c.input_preview}</td>
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
                        {c.risk_level} ({c.risk_score})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{c.created_at}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => fetchCaseDetail(c.case_id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => window.open(`/api/cases/${c.case_id}/pdf`, '_blank')}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold rounded-lg transition"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Details Drawer / Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-cyan-50 text-cyan-700 font-bold">
                  {selectedCase.case_id}
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  {selectedCase.title || selectedCase.source_type}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Risk Assessment</span>
                <div className="font-extrabold text-red-600 text-sm mt-0.5">
                  {selectedCase.risk_level} ({selectedCase.risk_score}/100)
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Registered Timestamp</span>
                <div className="font-medium text-slate-700 mt-0.5">{selectedCase.created_at}</div>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Evidence SHA-256 Digest</span>
                <div className="font-mono text-[10px] text-slate-800 break-all mt-0.5">
                  {selectedCase.evidence_hash}
                </div>
              </div>
            </div>

            {/* Submitted Content Excerpt */}
            <div>
              <span className="text-xs font-bold uppercase text-slate-600">Submitted Content / Excerpt</span>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 mt-1.5 whitespace-pre-wrap">
                {selectedCase.full_input}
              </div>
            </div>

            {/* Extracted Identifiers */}
            <div>
              <span className="text-xs font-bold uppercase text-slate-600">Actionable Identifiers</span>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {selectedCase.identifiers?.map((id, i) => (
                  <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between">
                    <span className="font-mono text-slate-800">{id.entity_value}</span>
                    <span className="text-[9px] font-bold uppercase text-cyan-700">{id.entity_type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-Case Connected FIRs */}
            {selectedCase.connected_cases?.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-red-700 block">
                  🚨 Cross-Case Syndicate Linkages Detected
                </span>
                <div className="space-y-1.5 text-xs">
                  {selectedCase.connected_cases.map((conn, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-red-100">
                      <span className="font-mono font-bold text-slate-800">{conn.case_id}</span>
                      <span className="text-[10px] text-red-600 font-semibold">
                        Shares {conn.entity_type.toUpperCase()}: {conn.entity_value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investigator Notes */}
            <div className="space-y-3 flex-1">
              <span className="text-xs font-bold uppercase text-slate-600">Investigator Notes & Annotation</span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedCase.notes?.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>{n.author}</span>
                      <span>{n.created_at}</span>
                    </div>
                    <p className="text-slate-800">{n.note_text}</p>
                  </div>
                ))}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-100">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Append investigation update, bank freeze status, or CDR subpoena ref..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                >
                  Save Note to Dossier
                </button>
              </form>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.open(`/api/cases/${selectedCase.case_id}/pdf`, '_blank')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Download Section 65B Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
