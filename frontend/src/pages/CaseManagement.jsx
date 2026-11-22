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
  ExternalLink,
  Scale,
  Printer,
  Copy,
  Check
} from 'lucide-react';

export default function CaseManagement() {
  const [searchParams] = useSearchParams();
  const [cases, setCases] = useState([]);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCase, setSelectedCase] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [author, setAuthor] = useState('Insp. Devendra Singh');
  const [loading, setLoading] = useState(true);

  // Legal Notice Generator Modal state
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [noticeType, setNoticeType] = useState('sec_91_crpc'); // 'sec_91_crpc' or 'sec_102_lien'
  const [targetEntity, setTargetEntity] = useState('');
  const [firNumber, setFirNumber] = useState('FIR No. 42/2026 u/s 66D IT Act & 318(4) BNS');
  const [generatedNotice, setGeneratedNotice] = useState(null);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchCases = (overrideQ) => {
    setLoading(true);
    const queryToUse = overrideQ !== undefined ? overrideQ : searchQuery;
    let url = `/api/cases?risk=${riskFilter}`;
    if (queryToUse && queryToUse.trim()) {
      url += `&q=${encodeURIComponent(queryToUse.trim())}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCases(data);
        setLoading(false);

        // Auto-select if URL has id param or auto-select first case
        const targetId = searchParams.get('id');
        if (targetId) {
          fetchCaseDetail(targetId);
        } else if (data && data.length > 0) {
          fetchCaseDetail(data[0].case_id);
        } else {
          setSelectedCase(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load cases:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    setSearchQuery(qParam);
    fetchCases(qParam);
  }, [riskFilter, searchParams]);

  const fetchCaseDetail = (cid) => {
    fetch(`/api/cases/${cid}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedCase(data);
        // Default target entity from entities
        const ents = data.extracted_entities || {};
        const firstTarget = ents.phones?.[0] || ents.upis?.[0] || ents.domains?.[0] || '';
        setTargetEntity(firstTarget);
        setGeneratedNotice(null);
      })
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
      const data = await res.json();
      setSelectedCase((prev) => ({
        ...prev,
        notes: [...(prev.notes || []), data]
      }));
      setNewNote('');
    } catch (err) {
      alert('Failed to save investigator note: ' + err.message);
    }
  };

  const handleGenerateNotice = async () => {
    if (!selectedCase) return;
    setNoticeLoading(true);
    try {
      const res = await fetch(`/api/cases/${selectedCase.case_id}/notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notice_type: noticeType,
          officer_name: author || 'Inspector Devendra Singh',
          officer_rank: 'Inspector of Police (Cyber Crime)',
          police_station: 'State Cyber Police Station, Jaipur',
          fir_number: firNumber,
          target_entity: targetEntity
        })
      });
      const data = await res.json();
      setGeneratedNotice(data);
    } catch (err) {
      alert('Failed to generate legal notice: ' + err.message);
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleCopyNotice = () => {
    if (generatedNotice?.notice_text) {
      navigator.clipboard.writeText(generatedNotice.notice_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
            <FolderGit2 className="w-4 h-4" />
            <span>Case Repository & Statutory Action Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">FIR Evidence & Case Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable case logs, cryptographic SHA-256 evidence records, cross-FIR linkages, and statutory police notice generation.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchCases();
            }}
            className="relative"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FIR, VPA, Phone..."
              className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition shadow-xs w-48 sm:w-60"
            />
          </form>

          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-xs text-xs font-semibold">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                  riskFilter === lvl ? 'bg-cyan-500 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Case List + Case Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List Column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col h-[650px]">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Indexed Cases ({cases.length})</span>
            <span className="text-[10px] text-cyan-600 font-semibold">Live SQLite Registry</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1">
            {loading ? (
              <div className="text-xs text-slate-400 py-12 text-center animate-pulse">Loading case records...</div>
            ) : cases.length > 0 ? (
              cases.map((c) => (
                <div
                  key={c.case_id}
                  onClick={() => fetchCaseDetail(c.case_id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                    selectedCase?.case_id === c.case_id
                      ? 'border-cyan-500 bg-cyan-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{c.case_id}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        c.risk_level === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : c.risk_level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {c.risk_level} • {c.risk_score}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 mt-1 truncate">{c.title || c.source_type}</div>
                  <div className="text-slate-500 text-[11px] truncate mt-0.5">{c.input_preview}</div>
                  <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>{c.source_type}</span>
                    <span>{c.created_at ? c.created_at.slice(0, 10) : ''}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-12 text-center">No cases found matching filter.</div>
            )}
          </div>
        </div>

        {/* Case Detail View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col h-[650px] overflow-y-auto">
          {selectedCase ? (
            <div className="space-y-6">
              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {selectedCase.case_id}
                    </span>
                    <span
                      className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
                        selectedCase.risk_level === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : selectedCase.risk_level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {selectedCase.risk_level} • {selectedCase.risk_score}/100
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    {selectedCase.title || selectedCase.source_type}
                  </h2>
                </div>

                {/* Actions: Notice & PDF */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setNoticeModalOpen(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Generate Statutory Notice</span>
                  </button>

                  <a
                    href={`/api/cases/${selectedCase.case_id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </a>
                </div>
              </div>

              {/* SHA256 Evidence Stamp */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
                  <span>Section 65B Electronic Evidence SHA-256 Digest</span>
                  <span className="text-emerald-600">Tamper-Proof Audit Sealed</span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 break-all">
                  {selectedCase.evidence_hash}
                </div>
              </div>

              {/* Raw Input Content */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Seized Digital Evidence / Content
                </h4>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {selectedCase.full_input}
                </div>
              </div>

              {/* Extracted Identifiers */}
              {selectedCase.identifiers && selectedCase.identifiers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Actionable Extracted Entities ({selectedCase.identifiers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.identifiers.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                      >
                        <span className="font-bold uppercase text-cyan-700 text-[10px] mr-1">
                          {item.entity_type}:
                        </span>
                        {item.entity_value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross-Case Linkages */}
              {selectedCase.connected_cases && selectedCase.connected_cases.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                    <span>Syndicate Linkages ({selectedCase.connected_cases.length} Connected FIRs)</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedCase.connected_cases.map((conn, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold font-mono text-rose-900">{conn.case_id}</span>
                          <span className="text-slate-600 ml-2">Shared {conn.shared_identifier}</span>
                        </div>
                        <button
                          onClick={() => fetchCaseDetail(conn.case_id)}
                          className="text-[10px] font-bold text-rose-700 hover:underline"
                        >
                          View Linked Case ↗
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Investigator Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Investigator Notes & Chain of Custody
                </h4>
                <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
                  {selectedCase.notes && selectedCase.notes.length > 0 ? (
                    selectedCase.notes.map((n, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                          <span className="font-bold text-slate-700">{n.author}</span>
                          <span>{n.timestamp ? n.timestamp.slice(0, 19).replace('T', ' ') : ''}</span>
                        </div>
                        <div className="text-slate-800">{n.note_text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">No notes recorded yet.</div>
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an investigation note, subpoena number, or status update..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Add Note
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <FolderGit2 className="w-12 h-12 text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-xs font-medium">Select a case record from the registry to view forensic details and generate legal notices.</p>
            </div>
          )}
        </div>
      </div>

      {/* Statutory Legal Notice Generator Modal */}
      {noticeModalOpen && selectedCase && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Statutory Police Requisition Notice Generator
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Rajasthan Police State Cyber Crime Command • Court & Law Enforcement Admissible
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNoticeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Requisition Statute
                  </label>
                  <select
                    value={noticeType}
                    onChange={(e) => setNoticeType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="sec_91_crpc">Section 91 CrPC / Sec 94 BNSS (CAF/CDR/IPDR Requisition to Telcos)</option>
                    <option value="sec_102_lien">Section 102 CrPC / Sec 106 BNSS (Debit Freeze & Lien Order to Banks/NPCI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    FIR / Crime Diary Reference
                  </label>
                  <input
                    type="text"
                    value={firNumber}
                    onChange={(e) => setFirNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Flagged Identifier (Phone, UPI, Domain)
                  </label>
                  <input
                    type="text"
                    value={targetEntity}
                    onChange={(e) => setTargetEntity(e.target.value)}
                    placeholder="e.g. +91 9876500001 or damanpay@okaxis"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issuing Cyber Officer Name
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerateNotice}
                  disabled={noticeLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <Scale className="w-4 h-4" />
                  <span>{noticeLoading ? 'Formatting Requisition...' : 'Generate Official Notice'}</span>
                </button>
              </div>

              {generatedNotice && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Formal Court & Nodal Requisition Document
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyNotice}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto border border-slate-800">
                    {generatedNotice.notice_text}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
