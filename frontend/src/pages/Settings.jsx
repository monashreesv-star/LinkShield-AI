import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Database, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';

export default function Settings() {
  const [agency, setAgency] = useState('Rajasthan Police Cyber Crime Division');
  const [lowThresh, setLowThresh] = useState('24');
  const [medThresh, setMedThresh] = useState('49');
  const [archiveDays, setArchiveDays] = useState('90');
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.agency_name) setAgency(data.agency_name);
        if (data.low_threshold) setLowThresh(data.low_threshold);
        if (data.med_threshold) setMedThresh(data.med_threshold);
        if (data.auto_archive_days) setArchiveDays(data.auto_archive_days);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            agency_name: agency,
            low_threshold: lowThresh,
            med_threshold: medThresh,
            auto_archive_days: archiveDays
          }
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' });
      if (res.ok) {
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 4000);
      }
    } catch (err) {
      alert('Seed error: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <SettingsIcon className="w-4 h-4" />
          <span>Module 10 • Configuration & Policy</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">System & Calibration Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure risk scoring thresholds, law enforcement agency metadata, and manage demonstration test records.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Agency Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Agency & Report Branding</h2>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Authorized Cyber Crime Unit Name
            </label>
            <input
              type="text"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">Printed on all official Section 65B forensic PDF dossiers.</p>
          </div>
        </div>

        {/* Risk Thresholds */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Risk Assessment Thresholds (0–100 Scale)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Low Risk Ceiling (Default: 24)
              </label>
              <input
                type="number"
                value={lowThresh}
                onChange={(e) => setLowThresh(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">Scores 0 to this value are classified as LOW RISK.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Medium Risk Ceiling (Default: 49)
              </label>
              <input
                type="number"
                value={medThresh}
                onChange={(e) => setMedThresh(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">Scores above this value trigger HIGH RISK alerts.</p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          {saved ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Settings successfully persisted to SQLite!</span>
            </span>
          ) : (
            <span></span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4 text-cyan-400" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Demo Data Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
          <Database className="w-4 h-4 text-cyan-600" />
          <span>Synthetic Demonstration Dataset</span>
        </div>
        <p className="text-xs text-slate-500">
          Instantly seeds 30+ categorized demonstration records across electricity cutoff scams, fake SBI/HDFC KYC alerts, job lures, Ponzi wealth schemes, and predatory loan APK profiles.
        </p>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-2 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding Database...' : 'Reload 30+ Synthetic Cases'}</span>
          </button>

          {seedSuccess && (
            <span className="text-xs font-bold text-emerald-600">
              ✅ 30+ Demonstration Cases Seeded!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
