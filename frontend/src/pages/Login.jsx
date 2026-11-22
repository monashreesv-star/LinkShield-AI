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
  Fingerprint
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
    }, 400);
  };

  const handleQuickEvaluatorLogin = () => {
    localStorage.setItem('ls_auth', 'true');
    localStorage.setItem(
      'ls_officer',
      JSON.stringify({
        name: 'Evaluation Panel (Cyber Cell)',
        badge: 'HACKATHON-EVAL-2026',
        station: 'Rajasthan Police Cyber Command HQ',
        rank: 'Supervisory Cyber Investigator',
        loginTime: new Date().toISOString()
      })
    );
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Cyber Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Emblem & Portal Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/20 mb-3">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-9 h-9 text-cyan-400" />
            </div>
          </div>
          <div className="inline-block px-3 py-1 bg-cyan-950/80 border border-cyan-800/80 rounded-full text-[11px] font-bold text-cyan-400 tracking-wider uppercase mb-2">
            Rajasthan Police • State Cyber Crime Command
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Linked<span className="text-cyan-400">Shield</span> AI
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Law Enforcement Portal • Phishing, Fraud & Malicious App Triage
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
          {/* Quick Evaluator Access Button */}
          <div className="bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800/60 rounded-xl p-3 text-center">
            <div className="text-[11px] text-cyan-300 font-medium mb-2">
              Judges & Evaluators Direct Access
            </div>
            <button
              type="button"
              onClick={handleQuickEvaluatorLogin}
              className="w-full py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-cyan-500/20"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>1-Click Evaluator Login</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Or Officer Authentication
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Officer Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Investigating Officer
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  placeholder="Officer Full Name"
                />
              </div>
            </div>

            {/* Badge ID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Police Badge / Service ID
              </label>
              <div className="relative">
                <Fingerprint className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  placeholder="RJ-CYBER-XXXX"
                />
              </div>
            </div>

            {/* Station Jurisdiction */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Assigned Police Station / Unit
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <select
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition appearance-none"
                >
                  <option value="State Cyber Police Station, Jaipur HQ">State Cyber Police Station, Jaipur HQ</option>
                  <option value="Cyber Crime Police Station, Jodhpur">Cyber Crime Police Station, Jodhpur</option>
                  <option value="Cyber Crime Cell, Kota Range">Cyber Crime Cell, Kota Range</option>
                  <option value="Cyber Crime Cell, Udaipur Range">Cyber Crime Cell, Udaipur Range</option>
                  <option value="Cyber Crime Cell, Bikaner Range">Cyber Crime Cell, Bikaner Range</option>
                  <option value="Cyber Crime Cell, Bharatpur Range">Cyber Crime Cell, Bharatpur Range</option>
                </select>
              </div>
            </div>

            {/* Security Passcode */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Command Key / PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  placeholder="Enter Passcode"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-600/20 disabled:opacity-60 mt-2"
            >
              <span>{loading ? 'Authenticating Officer...' : 'Enter Investigation Command'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Compliance & Security Footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center text-[10px] text-slate-500 space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sec 65B Electronic Evidence & Chain-of-Custody Protected</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 mt-4">
          Government of Rajasthan • Police Department • For Official Use Only
        </div>
      </div>
    </div>
  );
}
