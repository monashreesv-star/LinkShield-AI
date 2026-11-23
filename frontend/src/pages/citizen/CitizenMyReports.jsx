import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  Phone,
  CreditCard,
  Globe,
  Filter,
  Plus
} from 'lucide-react';

export default function CitizenMyReports() {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    const token = localStorage.getItem('ls_token');
    const param = statusFilter === 'ALL' ? '' : `?status=${statusFilter}`;

    fetch(`/api/citizen/my-reports${param}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch reports');
        return res.json();
      })
      .then((data) => {
        setReports(data);
        setLoading(false);

        // Auto-select if URL has id
        const targetId = searchParams.get('id');
        if (targetId) {
          const match = data.find((r) => r.submission_id === targetId);
          if (match) setSelectedReport(match);
          else if (data.length > 0) setSelectedReport(data[0]);
        } else if (data.length > 0) {
          setSelectedReport(data[0]);
        } else {
          setSelectedReport(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
            <FileText className="w-4 h-4" />
            <span>Citizen Incident Tracking</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">My Reports & Case Status</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track the verification progress of your submitted fraud reports with the Rajasthan Police Cyber Crime Cell.
          </p>
        </div>

        <Link
          to="/citizen/report-message"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Submission</span>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex items-center space-x-2 bg-white border border-slate-200 p-1 rounded-xl shadow-xs text-xs font-semibold w-fit">
        {['ALL', 'Submitted', 'Under Review', 'Analysed', 'Closed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === st ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Main Grid: List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Column */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 flex flex-col h-[600px]">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Submissions ({reports.length})</span>
            <span className="text-[10px] text-cyan-600 font-semibold">Protected Citizen Scope</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1">
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-400 animate-pulse">
                Loading submissions...
              </div>
            ) : reports.length > 0 ? (
              reports.map((r) => (
                <div
                  key={r.submission_id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition ${
                    selectedReport?.submission_id === r.submission_id
                      ? 'border-cyan-500 bg-cyan-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      {r.submission_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        r.status === 'Under Review'
                          ? 'bg-amber-100 text-amber-800'
                          : r.status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 mt-1 truncate">
                    {r.submission_type} Report
                  </div>
                  <div className="text-slate-500 text-[11px] truncate mt-0.5">
                    {r.submitted_content}
                  </div>

                  <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                    <span
                      className={`font-black uppercase ${
                        r.risk_level === 'HIGH'
                          ? 'text-rose-600'
                          : r.risk_level === 'MEDIUM'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {r.risk_level} • {r.risk_score}/100
                    </span>
                    <span>{r.created_at ? r.created_at.slice(0, 10) : ''}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-slate-400">
                No reports matching this filter.
              </div>
            )}
          </div>
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col h-[600px] overflow-y-auto">
          {selectedReport ? (
            <div className="space-y-6">
              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {selectedReport.submission_id}
                    </span>
                    <span
                      className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                        selectedReport.risk_level === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : selectedReport.risk_level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {selectedReport.risk_level} RISK ({selectedReport.risk_score}/100)
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    {selectedReport.submission_type} Submission
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      selectedReport.status === 'Under Review'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : selectedReport.status === 'Closed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    Status: {selectedReport.status}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Report Progression Workflow
                </div>
                <div className="grid grid-cols-4 text-center text-[11px] gap-2">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-800 font-bold">
                    1. Submitted
                  </div>
                  <div
                    className={`p-2 rounded-xl font-bold ${
                      selectedReport.status !== 'Submitted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    2. AI Analysed
                  </div>
                  <div
                    className={`p-2 rounded-xl font-bold ${
                      selectedReport.status === 'Under Review' || selectedReport.status === 'Closed'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    3. Police Review
                  </div>
                  <div
                    className={`p-2 rounded-xl font-bold ${
                      selectedReport.status === 'Closed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    4. Resolved
                  </div>
                </div>
              </div>

              {/* Submitted Content Excerpt */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Submitted Content / Message Excerpt
                </h4>
                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {selectedReport.submitted_content}
                </div>
              </div>

              {/* Safety Recommendation */}
              {selectedReport.recommendation && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-blue-800">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Citizen Safety Recommendation</span>
                  </div>
                  <p>{selectedReport.recommendation}</p>
                </div>
              )}

              {/* Extracted Identifiers */}
              {selectedReport.extracted_entities && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Actionable Extracted Identifiers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.extracted_entities.phones?.map((p, i) => (
                      <span key={i} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono font-bold">
                        Phone: {p}
                      </span>
                    ))}
                    {selectedReport.extracted_entities.upis?.map((u, i) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg text-xs font-mono font-bold">
                        UPI: {u}
                      </span>
                    ))}
                    {selectedReport.extracted_entities.domains?.map((d, i) => (
                      <span key={i} className="px-2.5 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-lg text-xs font-mono font-bold">
                        Domain: {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Officer Notes if present */}
              {selectedReport.officer_notes && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Official Police Review Update</span>
                  </div>
                  <p>{selectedReport.officer_notes}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Disclaimer:</strong> Automated risk assessments are preliminary indicators and do not establish that fraud has occurred. Verify findings through appropriate official channels.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-12 h-12 text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-xs font-medium">Select a submission from the list to track its status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
