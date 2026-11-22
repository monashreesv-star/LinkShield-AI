import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Globe,
  PhoneCall,
  CreditCard,
  Network,
  ArrowUpRight,
  TrendingUp,
  MessageSquareWarning,
  Link2,
  Smartphone
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const s = stats || {
    total_cases: 31,
    high_risk_cases: 14,
    medium_risk_cases: 7,
    low_risk_cases: 10,
    suspicious_domains: 12,
    flagged_phones: 8,
    flagged_upis: 9,
    repeated_identifiers: 5,
    risk_breakdown: [
      { name: 'High Risk', value: 14, color: '#EF4444' },
      { name: 'Medium Risk', value: 7, color: '#F59E0B' },
      { name: 'Low Risk', value: 10, color: '#10B981' }
    ],
    vector_distribution: [],
    recent_cases: [],
    top_repeat_entities: []
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800 tracking-wider">
              Rajasthan Police Cyber Command
            </span>
            <span className="text-xs text-slate-400">• Live Threat Monitor</span>
          </div>
          <h1 className="text-2xl font-black mt-2 tracking-tight">
            Unified Threat Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time multi-vector detection and persistent evidence registry across scam SMS, WhatsApp phishing, predatory loan APKs, and fraudulent high-yield Ponzi platforms.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/messages"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center space-x-1.5"
          >
            <MessageSquareWarning className="w-4 h-4" />
            <span>New Threat Scan</span>
          </Link>
          <Link
            to="/graph"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center space-x-1.5"
          >
            <Network className="w-4 h-4 text-cyan-400" />
            <span>Syndicate Graph</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Stat KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total FIRs / Cases</span>
            <ShieldAlert className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{s.total_cases}</div>
          <div className="text-[10px] text-slate-500 mt-1">Stored in SQLite</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-xs">
          <div className="flex items-center justify-between text-red-600 text-xs font-semibold">
            <span>High Risk Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 mt-2">{s.high_risk_cases}</div>
          <div className="text-[10px] text-red-500/80 mt-1">Score &ge; 50/100</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 text-xs font-semibold">
            <span>Medium Risk</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{s.medium_risk_cases}</div>
          <div className="text-[10px] text-amber-500/80 mt-1">Score 25–49</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Flagged Domains</span>
            <Globe className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{s.suspicious_domains}</div>
          <div className="text-[10px] text-slate-500 mt-1">Lookalikes & Ephemeral</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Scam Phone Numbers</span>
            <PhoneCall className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{s.flagged_phones}</div>
          <div className="text-[10px] text-slate-500 mt-1">TSP Notice Priority</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Mule UPI VPAs</span>
            <CreditCard className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{s.flagged_upis}</div>
          <div className="text-[10px] text-slate-500 mt-1">NPCI Lien Target</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Risk Assessment Distribution</h2>
          <p className="text-xs text-slate-400">Proportion of Low, Medium, and High threat ratings</p>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={s.risk_breakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {s.risk_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vector Distribution Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-900">Incidents by Threat Vector</h2>
          <p className="text-xs text-slate-400">Incident breakdown across SMS, URL, Website, and APKs</p>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.vector_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="source_type" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0284C7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Cases & Top Shared Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Investigations</h2>
              <p className="text-xs text-slate-400">Latest analyzed records in police registry</p>
            </div>
            <Link to="/cases" className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center">
              View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Vector</th>
                  <th className="py-2.5 px-3">Preview</th>
                  <th className="py-2.5 px-3">Risk</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(s.recent_cases || []).slice(0, 6).map((c) => (
                  <tr key={c.case_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">{c.case_id}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.source_type}</td>
                    <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs">{c.title || c.input_preview}</td>
                    <td className="py-2.5 px-3">
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
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/cases?id=${c.case_id}`}
                        className="text-cyan-600 hover:text-cyan-800 font-semibold text-xs"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Repeated Entities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Cross-Case Correlation</h2>
              <p className="text-xs text-slate-400">Identifiers linking multiple cases</p>
            </div>
            <Link to="/graph" className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold">
              Open Graph
            </Link>
          </div>

          <div className="space-y-3">
            {(s.top_repeat_entities || []).map((ent, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="font-mono text-xs font-bold text-slate-800">{ent.entity_value}</div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">
                    {ent.entity_type}
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded text-[10px]">
                  {ent.cases_count} FIRs
                </span>
              </div>
            ))}

            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-[11px] text-cyan-900">
              💡 <b>Syndicate Alert:</b> Entities appearing in &gt;1 case indicate shared financial endpoints or phone infrastructure across scam operations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
