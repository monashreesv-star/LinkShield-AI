import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  CreditCard,
  Globe,
  ExternalLink,
  Scale,
  FileText,
  AlertTriangle,
  User,
  ArrowRight,
  Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OfficerCitizenSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);
  const [officerNotes, setOfficerNotes] = useState('');
  const [newStatus, setNewStatus] = useState('Under Review');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [escalatedCaseId, setEscalatedCaseId] = useState(null);

  const fetchSubmissions = () => {
    setLoading(true);
    const token = localStorage.getItem('ls_token');
    let url = `/api/officer/citizen-submissions?`;
    if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
    if (riskFilter !== 'ALL') url += `risk=${riskFilter}&`;
    if (search.trim()) url += `q=${encodeURIComponent(search.trim())}&`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch citizen submissions');
        return res.json();
      })
      .then((data) => {
        setSubmissions(data);
        setLoading(false);
        if (data.length > 0) {
          if (!selectedSub || !data.some((s) => s.submission_id === selectedSub.submission_id)) {
            setSelectedSub(data[0]);
            setOfficerNotes(data[0].officer_notes || '');
            setNewStatus(data[0].status || 'Under Review');
            setEscalatedCaseId(data[0].converted_case_id || null);
          }
        } else {
          setSelectedSub(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, riskFilter]);

  const handleSelectSubmission = (sub) => {
    setSelectedSub(sub);
    setOfficerNotes(sub.officer_notes || '');
    setNewStatus(sub.status || 'Under Review');
    setEscalatedCaseId(sub.converted_case_id || null);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setActionLoading(true);

    const token = localStorage.getItem('ls_token');
    try {
      const res = await fetch(`/api/officer/citizen-submissions/${selectedSub.submission_id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          officer_notes: officerNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update status');

      setSelectedSub((prev) => ({
        ...prev,
        status: newStatus,
        officer_notes: officerNotes
      }));
      setSubmissions((prev) =>
        prev.map((s) =>
          s.submission_id === selectedSub.submission_id
            ? { ...s, status: newStatus, officer_notes: officerNotes }
            : s
        )
      );
      alert('Submission review status updated successfully.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToCase = async () => {
    if (!selectedSub) return;
    if (!window.confirm(`Convert submission ${selectedSub.submission_id} into an official Police Case FIR dossier?`)) return;

    setActionLoading(true);
    const token = localStorage.getItem('ls_token');
    try {
      const res = await fetch(`/api/officer/citizen-submissions/${selectedSub.submission_id}/convert-to-case`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Conversion failed');

      setEscalatedCaseId(data.case_id);
      setSelectedSub((prev) => ({
        ...prev,
        converted_case_id: data.case_id,
        status: 'Under Review'
      }));
      alert(`Success! Created Police Case Dossier: ${data.case_id}`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
            <Inbox className="w-4 h-4" />
            <span>Public Incident Triage & Oversight</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Citizen Submissions Review Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review reports submitted by citizens across Rajasthan, examine extracted identifiers, update investigation status, and escalate to formal police FIR cases.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchSubmissions();
            }}
            className="relative"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Citizen, Ref, Phone..."
              className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-xs w-48 sm:w-60"
            />
          </form>

          {/* Status Filter */}
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-xs text-xs font-semibold">
            {['ALL', 'Submitted', 'Under Review', 'Analysed', 'Closed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                  statusFilter === st ? 'bg-cyan-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Master / Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col h-[650px]">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Citizen Reports ({submissions.length})</span>
            <span className="text-[10px] text-cyan-600 font-semibold">Public Reporting Desk</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1">
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-400 animate-pulse">
                Loading citizen submissions...
              </div>
            ) : submissions.length > 0 ? (
              submissions.map((sub) => (
                <div
                  key={sub.submission_id}
                  onClick={() => handleSelectSubmission(sub)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                    selectedSub?.submission_id === sub.submission_id
                      ? 'border-cyan-500 bg-cyan-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      {sub.submission_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        sub.status === 'Under Review'
                          ? 'bg-amber-100 text-amber-800'
                          : sub.status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="font-bold text-slate-800 mt-1 flex items-center justify-between">
                    <span>{sub.citizen_name || 'Anonymous Citizen'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {sub.citizen_mobile}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] truncate mt-0.5">
                    {sub.submitted_content}
                  </div>

                  <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                    <span
                      className={`font-black uppercase ${
                        sub.risk_level === 'HIGH'
                          ? 'text-rose-600'
                          : sub.risk_level === 'MEDIUM'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {sub.risk_level} • {sub.risk_score}/100
                    </span>
                    <span>{sub.created_at ? sub.created_at.slice(0, 10) : ''}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-slate-400">
                No citizen submissions found.
              </div>
            )}
          </div>
        </div>

        {/* Submission Detail View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col h-[650px] overflow-y-auto">
          {selectedSub ? (
            <div className="space-y-6">
              {/* Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {selectedSub.submission_id}
                    </span>
                    <span
                      className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                        selectedSub.risk_level === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : selectedSub.risk_level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {selectedSub.risk_level} • {selectedSub.risk_score}/100
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    Complainant: {selectedSub.citizen_name} ({selectedSub.citizen_mobile || 'Unlisted'})
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  {escalatedCaseId ? (
                    <Link
                      to={`/cases?id=${escalatedCaseId}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>FIR Case: {escalatedCaseId}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={handleConvertToCase}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Escalate to Police FIR Case</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Submitted Content */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Submitted Citizen Content / Evidence Excerpt
                </h4>
                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {selectedSub.submitted_content}
                </div>
              </div>

              {/* Extracted Identifiers */}
              {selectedSub.extracted_entities && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Actionable Extracted Identifiers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSub.extracted_entities.phones?.map((p, i) => (
                      <span key={i} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono font-bold">
                        Phone: {p}
                      </span>
                    ))}
                    {selectedSub.extracted_entities.upis?.map((u, i) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg text-xs font-mono font-bold">
                        UPI: {u}
                      </span>
                    ))}
                    {selectedSub.extracted_entities.domains?.map((d, i) => (
                      <span key={i} className="px-2.5 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-lg text-xs font-mono font-bold">
                        Domain: {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Heuristic Indicators */}
              {selectedSub.indicators && selectedSub.indicators.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Automated Heuristic Indicators ({selectedSub.indicators.length})
                  </h4>
                  <div className="space-y-1.5">
                    {selectedSub.indicators.map((ind, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{ind.name}</div>
                          <div className="text-slate-600">{ind.reason}</div>
                        </div>
                        <span className="font-mono font-bold text-rose-600 shrink-0 ml-3">
                          +{ind.score} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Officer Review & Status Update Form */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Update Investigation Review Status
                </h4>
                <form onSubmit={handleUpdateStatus} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Report Investigation Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Submitted">Submitted (Pending Triage)</option>
                        <option value="Analysed">Analysed (Heuristics Verified)</option>
                        <option value="Under Review">Under Review (Assigned to Officer)</option>
                        <option value="Closed">Closed / Resolved</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Officer Notes for Complainant
                      </label>
                      <input
                        type="text"
                        value={officerNotes}
                        onChange={(e) => setOfficerNotes(e.target.value)}
                        placeholder="e.g. Subpoena issued under Sec 91 CrPC..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      {actionLoading ? 'Saving Update...' : 'Save Review Update'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Inbox className="w-12 h-12 text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-xs font-medium">Select a citizen submission from the list to review evidence and update status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
