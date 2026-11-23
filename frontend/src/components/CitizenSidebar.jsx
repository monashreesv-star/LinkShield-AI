import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  MessageSquareWarning,
  Link2,
  Globe,
  Upload,
  FileText,
  LifeBuoy,
  PhoneCall
} from 'lucide-react';

const CITIZEN_NAV = [
  { path: '/citizen', label: 'Citizen Dashboard', icon: LayoutDashboard },
  { path: '/citizen/report-message', label: 'Report Message', icon: MessageSquareWarning },
  { path: '/citizen/report-url', label: 'Report Suspicious Link', icon: Link2 },
  { path: '/citizen/report-website', label: 'Report Fake Scheme', icon: Globe },
  { path: '/citizen/upload-evidence', label: 'Upload Evidence', icon: Upload },
  { path: '/citizen/my-reports', label: 'My Submissions & Status', icon: FileText },
  { path: '/citizen/safety-guide', label: 'Cyber Safety Guide', icon: LifeBuoy }
];

export default function CitizenSidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-screen font-sans">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-white text-base tracking-tight">
              Linked<span className="text-cyan-400">Shield</span>
            </span>
            <span className="text-[10px] font-bold bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">
              CITIZEN
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Rajasthan Police Cyber Cell</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Citizen Services
        </div>
        {CITIZEN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/citizen'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Emergency Helpline Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Emergency Assistance</span>
        </div>
        <a
          href="tel:1930"
          className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-rose-600/20"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 1930 (Cyber Helpline)</span>
        </a>
      </div>
    </aside>
  );
}
