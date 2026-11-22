import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserCheck,
  Building2,
  KeyRound,
  ArrowRight,
  Zap,
  Fingerprint,
  Award,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [badgeId, setBadgeId] = useState('RJ-CYBER-8842');
  const [officerName, setOfficerName] = useState('Insp. Devendra Singh');
  const [station, setStation] = useState('State Cyber Police Station, Jaipur HQ');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e?.preventDefault();
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('ls_auth', 'true');
      localStorage.setItem(
        'ls_officer',
        JSON.stringify({
          name: officerName,
          badge: badgeId,
          station: station,
          rank: 'Inspector of Police (Cyber Crime)',
          loginTime: new Date().toISOString()
        })
      );
      setLoading(false);
      navigate('/');
    }, 350);
  };

  const handleQuickEvaluatorLogin = () => {
    localStorage.setItem('ls_auth', 'true');
    localStorage.setItem(
      'ls_officer',
      JSON.stringify({
        name: 'Evaluation Jury (R4C Cyber Cell)',
        badge: 'RJ-HACKATHON-JURY-2026',
        station: 'Rajasthan Police Academy, Jaipur',
        rank: 'Chief Evaluator / Cyber Command',
        loginTime: new Date().toISOString()
      })
    );
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#070d19] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Rajasthan Heritage & Cyber Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      
      {/* Ambient Cyber Light Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-[400px] h-[250px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-lg z-10 my-4">
        {/* Hackathon Official Identity Header */}
        <div className="text-center mb-5">
          {/* Top Organization Pills */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-700/80 rounded-full shadow-lg backdrop-blur-md mb-3">
            <span className="flex items-center text-[11px] font-black tracking-wider text-rose-400 uppercase">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
              Rajasthan Police
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-black tracking-wider text-cyan-400 uppercase">
              R4C Cyber Control Centre
            </span>
          </div>

          {/* Hackathon Title & Tagline from Official Banner */}
          <div className="relative inline-block">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase drop-shadow-md">
              Rajasthan Police <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-amber-300">Hackathon 2026</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-amber-400 tracking-widest uppercase mt-1">
              <span>Think • Build • Innovate</span>
              <span className="text-slate-600">|</span>
              <span>Innovate • Secure • Empower</span>
            </div>
          </div>

          {/* Solution Identity */}
          <div className="mt-3 flex items-center justify-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-base font-extrabold text-slate-200">
              Linked<span className="text-cyan-400">Shield</span> <span className="text-[11px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">AI</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">— Forensic Cyber Triage Platform</span>
          </div>
        </div>

        {/* Elegant Glassmorphism Portal Card */}
        <div className="bg-slate-900/85 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Golden-Cyan Accent Edge */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-amber-400" />

          {/* Evaluator Fast Login Highlight */}
          <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-cyan-950/90 border border-cyan-500/30 rounded-2xl p-4 text-center mb-5 shadow-inner">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-cyan-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Grand Finale Jury & Evaluator Access</span>
            </div>
            <button
              type="button"
              onClick={handleQuickEvaluatorLogin}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-500/25 active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>⚡ 1-Click Hackathon Evaluator Login</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-2">
              Pre-authorized Super Admin session with seeded Rajasthan fraud incidents
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Or Officer Service Credentials
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* Officer Form */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Officer Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Investigating Officer
                </label>
                <div className="relative">
                  <UserCheck className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    required
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {/* Badge ID */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Police Badge / Service ID
                </label>
                <div className="relative">
                  <Fingerprint className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    required
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Jurisdiction Dropdown */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Assigned Cyber Command Station
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <select
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition appearance-none"
                >
                  <option value="State Cyber Police Station, Jaipur HQ">State Cyber Police Station, Jaipur HQ</option>
                  <option value="R4C Control Centre, PHQ Jaipur">R4C Control Centre, PHQ Jaipur</option>
                  <option value="Cyber Crime Police Station, Jodhpur">Cyber Crime Police Station, Jodhpur</option>
                  <option value="Cyber Crime Cell, Kota Range">Cyber Crime Cell, Kota Range</option>
                  <option value="Cyber Crime Cell, Udaipur Range">Cyber Crime Cell, Udaipur Range</option>
                  <option value="Cyber Crime Cell, Bikaner Range">Cyber Crime Cell, Bikaner Range</option>
                  <option value="Cyber Crime Cell, Bharatpur Range">Cyber Crime Cell, Bharatpur Range</option>
                </select>
              </div>
            </div>

            {/* Passcode */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Police Command Token / Key
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition border border-slate-700 mt-2"
            >
              <span>{loading ? 'Authenticating with R4C...' : 'Enter Investigation Command Center'}</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </form>

          {/* Hackathon Grand Finale Location Badge */}
          <div className="mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2">
            <span className="flex items-center text-slate-400">
              <MapPin className="w-3 h-3 text-amber-400 mr-1 shrink-0" />
              <span>Rajasthan Police Academy, Jaipur</span>
            </span>
            <span className="flex items-center text-emerald-400 font-semibold">
              <ShieldCheck className="w-3 h-3 mr-1" />
              <span>Sec 65B Admissible</span>
            </span>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="text-center text-[10px] text-slate-500 mt-4 space-x-2">
          <span>Grand Finale: 28–29 November 2026</span>
          <span>•</span>
          <span>Rajasthan Police • Government of Rajasthan</span>
        </div>
      </div>
    </div>
  );
}
