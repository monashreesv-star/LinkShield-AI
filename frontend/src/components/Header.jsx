import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, LogOut, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [query, setQuery] = useState('');
  const [officer, setOfficer] = useState({
    name: 'Insp. Devendra Singh',
    badge: 'RJ-CYBER-8842',
    station: 'Jaipur HQ Cyber PS'
  });
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ls_officer');
      if (raw) {
        const parsed = JSON.parse(raw);
        setOfficer(parsed);
      }
    } catch (e) {
      // fallback
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/cases?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = () => {
    const token = localStorage.getItem('ls_token');
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});

    localStorage.removeItem('ls_auth');
    localStorage.removeItem('ls_user');
    localStorage.removeItem('ls_token');
    localStorage.removeItem('ls_role');
    localStorage.removeItem('ls_officer');
    window.location.href = '/login';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 font-sans">
      {/* Global Quick Search */}
      <form onSubmit={handleSearch} className="relative w-80 md:w-96">
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
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Evidence Status Pill */}
        <div className="hidden sm:flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          <span>Section 65B Certified Chain of Custody</span>
        </div>

        {/* Officer Profile Badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-cyan-400 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
            RP
          </div>
          <div className="text-left text-xs hidden md:block">
            <div className="font-bold text-slate-800 leading-tight truncate max-w-[150px]">
              {officer.name || 'Cyber Officer'}
            </div>
            <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
              {officer.badge ? `Badge: ${officer.badge}` : officer.station}
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            title="Log Out of Cyber Portal"
            className="p-1.5 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
