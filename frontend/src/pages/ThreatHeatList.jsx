import React, { useState, useEffect } from 'react';
import { Flame, Globe, Phone, CreditCard, Mail, Coins, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ThreatHeatList() {
  const [days, setDays] = useState('ALL');
  const [heatData, setHeatData] = useState({ domain: [], phone: [], upi: [], url: [], email: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const param = days === 'ALL' ? '' : `?days=${days}`;
    fetch(`/api/intel/heat-list${param}`)
      .then((res) => res.json())
      .then((data) => {
        setHeatData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Heat list error:', err);
        setLoading(false);
      });
  }, [days]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-600">
            <Flame className="w-4 h-4" />
            <span>Module 7 • State-Wide Threat Heat-List</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Trending Cyber Threat Heat-List</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ranks the most frequently reported domains, mobile numbers, and mule UPI accounts for immediate law enforcement triage and bulk freezing.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center space-x-2 bg-white border border-slate-200 p-1 rounded-xl shadow-xs text-xs font-semibold">
          <button
            onClick={() => setDays('7')}
            className={`px-3 py-1.5 rounded-lg transition ${
              days === '7' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDays('30')}
            className={`px-3 py-1.5 rounded-lg transition ${
              days === '30' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDays('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              days === 'ALL' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All-Time Registry
          </button>
        </div>
      </div>

      {/* 3 Main Heat Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Phishing Domains */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Trending Phishing Domains</h2>
            </div>
            <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              DNS Priority
            </span>
          </div>

          <div className="space-y-2.5">
            {heatData.domain?.map((d, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-800">{d.entity_value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Last observed: {d.last_seen?.slice(0, 10)}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md">
                    {d.case_count} FIRs
                  </span>
                  <Link to={`/cases?q=${d.entity_value}`} className="block text-[10px] text-cyan-600 hover:underline mt-1">
                    Trace <ArrowUpRight className="w-2.5 h-2.5 inline" />
                  </Link>
                </div>
              </div>
            ))}
            {!heatData.domain?.length && (
              <div className="text-center py-6 text-slate-400 text-xs">No active domains in this period.</div>
            )}
          </div>
        </div>

        {/* Scam Phone Numbers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900">Flagged Scam Numbers</h2>
            </div>
            <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              CDR Subpoena
            </span>
          </div>

          <div className="space-y-2.5">
            {heatData.phone?.map((p, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-800">{p.entity_value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Last observed: {p.last_seen?.slice(0, 10)}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                    {p.case_count} FIRs
                  </span>
                  <Link to={`/cases?q=${p.entity_value}`} className="block text-[10px] text-cyan-600 hover:underline mt-1">
                    Trace <ArrowUpRight className="w-2.5 h-2.5 inline" />
                  </Link>
                </div>
              </div>
            ))}
            {!heatData.phone?.length && (
              <div className="text-center py-6 text-slate-400 text-xs">No active phone numbers in this period.</div>
            )}
          </div>
        </div>

        {/* Mule UPI Accounts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-purple-500" />
              <h2 className="text-sm font-bold text-slate-900">Mule UPI VPAs</h2>
            </div>
            <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              NPCI Freeze
            </span>
          </div>

          <div className="space-y-2.5">
            {heatData.upi?.map((u, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-800">{u.entity_value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Last observed: {u.last_seen?.slice(0, 10)}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-md">
                    {u.case_count} FIRs
                  </span>
                  <Link to={`/cases?q=${u.entity_value}`} className="block text-[10px] text-cyan-600 hover:underline mt-1">
                    Trace <ArrowUpRight className="w-2.5 h-2.5 inline" />
                  </Link>
                </div>
              </div>
            ))}
            {!heatData.upi?.length && (
              <div className="text-center py-6 text-slate-400 text-xs">No active UPI accounts in this period.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
