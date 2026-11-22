import React, { useState, useEffect } from 'react';
import { Flame, Globe, Phone, CreditCard, Mail, Coins, ShieldAlert, ArrowUpRight, Filter, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ThreatHeatList() {
  const [days, setDays] = useState('7');
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
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-600">
            <Flame className="w-4 h-4" />
            <span>Statewide High-Frequency Scam Registry</span>
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
              <h3 className="text-sm font-bold text-slate-800">Trending Phishing Domains</h3>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              DNS Priority
            </span>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-xs text-slate-400 py-6 text-center animate-pulse">Scanning domains...</div>
            ) : heatData.domain && heatData.domain.length > 0 ? (
              heatData.domain.map((item, idx) => {
                const domainVal = item.value || item.entity_value || '';
                const firCount = item.count || item.case_count || 1;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/80 transition"
                  >
                    <div className="truncate mr-3">
                      <div className="text-xs font-mono font-bold text-slate-900 truncate">
                        {domainVal}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Last observed: {item.last_seen ? item.last_seen.slice(0, 10) : 'Recent'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-xs rounded-md">
                        {firCount} FIRs
                      </span>
                      <Link
                        to={`/cases?q=${encodeURIComponent(domainVal)}`}
                        className="block text-[10px] font-bold text-cyan-600 hover:underline mt-1"
                      >
                        Trace ↗
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">No domains recorded in this period.</div>
            )}
          </div>
        </div>

        {/* Scam Phone Numbers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800">Flagged Scam Numbers</h3>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              CDR Subpoena
            </span>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-xs text-slate-400 py-6 text-center animate-pulse">Scanning telephony...</div>
            ) : heatData.phone && heatData.phone.length > 0 ? (
              heatData.phone.map((item, idx) => {
                const phoneVal = item.value || item.entity_value || '';
                const firCount = item.count || item.case_count || 1;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/80 transition"
                  >
                    <div className="truncate mr-3">
                      <div className="text-xs font-mono font-bold text-slate-900 truncate">
                        {phoneVal}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Last observed: {item.last_seen ? item.last_seen.slice(0, 10) : 'Recent'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-md">
                        {firCount} FIRs
                      </span>
                      <Link
                        to={`/cases?q=${encodeURIComponent(phoneVal)}`}
                        className="block text-[10px] font-bold text-cyan-600 hover:underline mt-1"
                      >
                        Trace ↗
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">No numbers recorded in this period.</div>
            )}
          </div>
        </div>

        {/* Mule UPI VPAs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-slate-800">Mule UPI VPAs</h3>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              NPCI Freeze
            </span>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-xs text-slate-400 py-6 text-center animate-pulse">Scanning banking VPAs...</div>
            ) : heatData.upi && heatData.upi.length > 0 ? (
              heatData.upi.map((item, idx) => {
                const upiVal = item.value || item.entity_value || '';
                const firCount = item.count || item.case_count || 1;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/80 transition"
                  >
                    <div className="truncate mr-3">
                      <div className="text-xs font-mono font-bold text-slate-900 truncate">
                        {upiVal}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Last observed: {item.last_seen ? item.last_seen.slice(0, 10) : 'Recent'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 font-bold text-xs rounded-md">
                        {firCount} FIRs
                      </span>
                      <Link
                        to={`/cases?q=${encodeURIComponent(upiVal)}`}
                        className="block text-[10px] font-bold text-cyan-600 hover:underline mt-1"
                      >
                        Trace ↗
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">No mule VPAs recorded in this period.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
