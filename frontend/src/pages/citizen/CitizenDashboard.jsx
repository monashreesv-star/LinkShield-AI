import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  MessageSquareWarning,
  Link2,
  Globe,
  Upload,
  ArrowRight,
  PhoneCall,
  ExternalLink,
  Info
} from 'lucide-react';

export default function CitizenDashboard() {
  const [stats, setStats] = useState({
    total_reports: 0,
    under_review: 0,
    analysed: 0,
    closed: 0,
    high_threats_flagged: 0,
    recent_submissions: []
  });
  const [user, setUser] = useState({ name: 'Citizen' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ls_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {}

    const token = localStorage.getItem('ls_token');
    fetch('/api/citizen/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard');
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rajasthan Police • Citizen Cyber Safety Desk</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Report suspicious messages, fraudulent URLs, and malicious websites directly to the Rajasthan Police State Cyber Crime Command. Track your submission review status in real time.
            </p>
          </div>

          {/* Quick Action Button */}
          <Link
            to="/citizen/report-message"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition flex items-center space-x-2 shrink-0 self-start md:self-auto"
          >
            <MessageSquareWarning className="w-4 h-4" />
            <span>Report Suspicious Incident</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 1930 Emergency Helpline Callout */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-rose-400">Victim of financial cyber fraud?</span>
            <span className="text-slate-400">Call national helpline within the Golden Hour (2 hours):</span>
          </div>
          <a
            href="tel:1930"
            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-950/80 border border-rose-800/80 text-rose-300 rounded-xl font-black text-xs hover:bg-rose-900 transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Dial 1930 (Toll-Free)</span>
          </a>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Reports</span>
            <FileText className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.total_reports}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Submitted by you</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 text-xs font-semibold">
            <span>Under Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{stats.under_review}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Assigned to Cyber Officer</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 text-xs font-semibold">
            <span>AI Analysed</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{stats.analysed}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Automated heuristics verified</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold">
            <span>Resolved / Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{stats.closed}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">Review completed</div>
        </div>
      </div>

      {/* Quick Reporting Actions Grid */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-3">
          Citizen Reporting Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/citizen/report-message"
            className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
              Report Scam Message
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Report fake KYC, electricity cutoff threats, and deceptive job SMS/WhatsApp messages.
            </p>
          </Link>

          <Link
            to="/citizen/report-url"
            className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-cyan-600 transition">
              Report Suspicious Link
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify unknown links before opening. Detect banking typosquats and credential-harvesting pages.
            </p>
          </Link>

          <Link
            to="/citizen/report-website"
            className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition">
              Report Fake Scheme
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Report high-yield Ponzi platforms, color-prediction betting apps, and predatory loan portals.
            </p>
          </Link>

          <Link
            to="/citizen/upload-evidence"
            className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition">
              Upload Screenshot Evidence
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload payment proofs, threatening chat screenshots, or suspicious documents.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Submissions & Tracking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900">My Recent Submissions</h3>
            <p className="text-xs text-slate-500">Live status of your submitted reports</p>
          </div>
          <Link
            to="/citizen/my-reports"
            className="text-xs font-bold text-cyan-600 hover:underline flex items-center space-x-1"
          >
            <span>View All My Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400 animate-pulse">
            Loading your submission history...
          </div>
        ) : stats.recent_submissions && stats.recent_submissions.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_submissions.map((sub, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition"
              >
                <div className="space-y-1 truncate">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {sub.submission_id}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {sub.submission_type}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        sub.risk_level === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : sub.risk_level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {sub.risk_level} RISK
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate max-w-xl">
                    {sub.submitted_content}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Reported on: {sub.created_at}
                  </span>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      sub.status === 'Under Review'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : sub.status === 'Closed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {sub.status}
                  </span>
                  <Link
                    to={`/citizen/my-reports?id=${sub.submission_id}`}
                    className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-white rounded-lg transition"
                    title="View Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            You haven't submitted any reports yet. Use the buttons above to verify any suspicious message or link.
          </div>
        )}

        {/* Official Statutory Disclaimer */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Official Advisory:</strong> Automated risk assessments are preliminary indicators and do not establish that fraud has occurred. Verify findings through appropriate official channels.
          </span>
        </div>
      </div>
    </div>
  );
}
