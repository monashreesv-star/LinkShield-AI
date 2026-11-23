import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogOut, PhoneCall, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CitizenHeader() {
  const [user, setUser] = useState({ name: 'Citizen', mobile: '' });
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ls_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    const token = localStorage.getItem('ls_token');
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});

    localStorage.removeItem('ls_auth');
    localStorage.removeItem('ls_user');
    localStorage.removeItem('ls_token');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 font-sans">
      <div className="flex items-center space-x-3">
        <div className="flex items-center text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-full">
          <ShieldCheck className="w-4 h-4 mr-1.5 text-cyan-600" />
          <span>Rajasthan Police Citizen Cyber Desk</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Helpline Button */}
        <a
          href="tel:1930"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Helpline: 1930</span>
        </a>

        {/* User Badge */}
        <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
            {user.name ? user.name.slice(0, 2).toUpperCase() : 'CZ'}
          </div>
          <div className="text-left text-xs hidden md:block">
            <div className="font-bold text-slate-800 leading-tight truncate max-w-[140px]">
              {user.name}
            </div>
            <div className="text-[10px] text-slate-500">Registered Citizen</div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out of Citizen Portal"
            className="p-1.5 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
