import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  MessageSquareWarning,
  Link2,
  Globe,
  Smartphone,
  Network,
  FolderGit2,
  Flame,
  FileText,
  Bot,
  Settings
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Command Dashboard', icon: LayoutDashboard },
  { path: '/messages', label: 'Message Analyzer', icon: MessageSquareWarning },
  { path: '/urls', label: 'URL Scanner', icon: Link2 },
  { path: '/websites', label: 'Website Analyzer', icon: Globe },
  { path: '/apks', label: 'APK Analyzer', icon: Smartphone },
  { path: '/graph', label: 'Intelligence Graph', icon: Network },
  { path: '/cases', label: 'Case Management', icon: FolderGit2 },
  { path: '/heat-list', label: 'Threat Heat-List', icon: Flame },
  { path: '/reports', label: 'Investigation Reports', icon: FileText },
  { path: '/assistant', label: 'AI Investigator', icon: Bot },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-screen font-sans">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-white text-base tracking-tight">
              Linked<span className="text-cyan-400">Shield</span>
            </span>
            <span className="text-[10px] font-bold bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">
              AI
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Rajasthan Police Cyber Cell</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 shadow-sm'
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

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>State Cyber Command</span>
          <span className="text-emerald-400 font-semibold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            Operational
          </span>
        </div>
      </div>
    </aside>
  );
}
