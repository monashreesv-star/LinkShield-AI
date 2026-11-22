import React, { useState } from 'react';
import { Search, Bell, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/cases?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs sticky top-0 z-30">
      {/* Global Quick Search */}
      <form onSubmit={handleSearch} className="relative w-96">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search UPI, Phone, Domain, or Case ID across registry..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
        />
      </form>

      {/* Right User Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          <span>Section 65B Chain of Custody Active</span>
        </div>

        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-cyan-400 flex items-center justify-center font-bold text-xs">
            RP
          </div>
          <div className="text-left text-xs">
            <div className="font-bold text-slate-800 leading-tight">Cyber Officer</div>
            <div className="text-[10px] text-slate-500">HQ Cyber Cell</div>
          </div>
        </div>
      </div>
    </header>
  );
}
