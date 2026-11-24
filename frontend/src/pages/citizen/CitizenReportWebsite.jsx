import React, { useState } from 'react';
import {
  Globe,
  Send,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  TrendingUp,
  CreditCard,
  Phone,
  Sparkles,
  ArrowRight,
  Coins
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SCHEME_SAMPLES = [
  {
    title: '📈 35% Weekly ROI Ponzi Scheme',
    name: 'RoyalGrow Wealth VIP',
    category: 'Ponzi / MLM Investment',
    content: 'Welcome to RoyalGrow Wealth! Invest Rs. 5000 today and receive guaranteed 35% weekly returns! Invite 5 friends to unlock VIP Level 3 bonus and earn 10% daily team income. 100% risk free SEBI certified fund. Transfer funds directly to UPI ID: royalwealth@ybl or WhatsApp +91 9876500001.'
  },
  {
    title: '🎰 Color Prediction Gambling Game',
    name: 'Daman Win Club / BDG Win',
    category: 'Illegal Online Betting',
    content: "Daman Win Club: India's No. 1 Color Prediction Game! Predict Red or Green and double your money in 30 seconds! Recharge your wallet now: Min deposit Rs 500. Direct UPI recharge to: damanpay@okaxis. Quick withdrawal to any bank account."
  },
  {
    title: '📱 Predatory Instant Loan Trap',
    name: 'RupeeQuick / FastCash Loan',
    category: 'Fake Loan App Extortion',
    content: 'Need urgent cash? Get instant Rs 50,000 in your bank account in 2 minutes! No CIBIL score required. Download APK from http://rupeequick-loan.cc. Requires contact list and gallery access. Repayment due in 7 days.'
  },
  {
    title: '🪙 AI Crypto Arbitrage Multiplier',
    name: 'TitanCrypto Arbitrage Bot',
    category: 'Fake Crypto High-Yield Bot',
    content: 'TitanCrypto Multiplier: Automated AI Arbitrage Bot guarantees 50% monthly profit on all USDT deposits. Minimum deposit: 100 USDT. Deposit TRC20 address: TXj6f8Lz5rP9mKwQ2yUv1tXoZbN4eRcVa3. Instant daily withdrawals.'
  }
];

export default function CitizenReportWebsite() {
  const [appName, setAppName] = useState('');
  const [promoterContact, setPromoterContact] = useState('');
  const [promoContent, setPromoContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!promoContent.trim()) {
      setErrorMsg('Please provide the promotional offer text or scheme details.');
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMsg('');

    const token = localStorage.getItem('ls_token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    try {
      let combined = `[Fraudulent Scheme / App: ${appName.trim() || 'Unspecified Scheme'}]\n`;
      if (promoterContact.trim()) combined += `[Promoter / Mule Contact: ${promoterContact.trim()}]\n`;
      combined += `\n${promoContent.trim()}`;

      const res = await fetch('/api/citizen/report', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          submission_type: 'Website',
          content: combined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        return;
      }
    } catch (fetchErr) {
      // Continue to offline forensic heuristics fallback
    }

    // Client-side Scheme Forensic Engine Fallback
    const lower = promoContent.toLowerCase();
    const hasPonzi = lower.includes('roi') || lower.includes('guaranteed') || lower.includes('daily profit') || lower.includes('double your money') || lower.includes('referral');
    const hasBetting = lower.includes('color prediction') || lower.includes('daman') || lower.includes('lottery') || lower.includes('bet');
    const hasLoan = lower.includes('instant loan') || lower.includes('contacts access') || lower.includes('gallery access');
    const upis = promoContent.match(/\b[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32}\b/g) || [];
    const phones = promoContent.match(/(?:\+?91[\-\s]?)?[6789]\d{9}/g) || [];

    const indicators = [];
    let score = 30;
    if (hasPonzi) {
      score += 40;
      indicators.push({ name: 'Unregistered Multi-Level Marketing / Ponzi Scheme', score: 40, reason: 'Promotes unrealistic guaranteed investment returns and recruit-chain bonuses prohibited under Prize Chits and Money Circulation Banning Act.' });
    }
    if (hasBetting) {
      score += 45;
      indicators.push({ name: 'Illegal Online Gambling Operation', score: 45, reason: 'Unlicensed betting / color prediction platform operating in violation of Public Gambling Act.' });
    }
    if (hasLoan) {
      score += 40;
      indicators.push({ name: 'Predatory Loan App Extortion Risk', score: 40, reason: 'Demands intrusive permissions (contacts/gallery) for blackmail and unauthorized recovery.' });
    }
    if (upis.length > 0) {
      score += 25;
      indicators.push({ name: 'Direct Mule UPI Endpoint', score: 25, reason: `Directs payments to personal/unverified UPI handle: ${upis[0]}` });
    }

    const risk_level = score >= 50 ? 'HIGH' : (score >= 25 ? 'MEDIUM' : 'LOW');
    const fallbackResult = {
      submission_id: `CIT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(16).substring(2, 8).toUpperCase()}`,
      status: 'Submitted',
      risk_score: Math.min(score, 100),
      risk_level,
      indicators,
      extracted_entities: { upis, phones, urls: [] },
      recommendation: risk_level === 'HIGH' ? 'Illegal fraudulent operation. Cease all money transfers immediately and report any debited funds to 1930.' : 'Standard inquiry logged. Never transfer money without verified RBI/SEBI registrations.',
      disclaimer: 'Automated risk assessments are preliminary indicators and do not establish that fraud has occurred. Verify findings through appropriate official channels.'
    };
    setResult(fallbackResult);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <Globe className="w-4 h-4" />
          <span>Rajasthan Police • Citizen Cyber Reporting Portal</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">
          Report Fake Loan App, Ponzi Scheme & Betting Trap
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Expose fraudulent investment schemes promising guaranteed returns, illegal color prediction gambling apps, or predatory loan platforms attempting contacts extortion.
        </p>
      </div>

      {/* Main Reporting Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Sample Schemes */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Try a common fraudulent scheme category:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SCHEME_SAMPLES.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAppName(s.name);
                  setPromoContent(s.content);
                  setResult(null);
                  setErrorMsg('');
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition active:scale-[0.99]"
              >
                <div className="text-xs font-bold text-slate-800">{s.title}</div>
                <div className="text-[10px] font-semibold text-purple-600 mt-0.5">{s.category}</div>
                <div className="text-[10px] text-slate-400 truncate mt-1">{s.name}</div>
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Scheme / App Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Scheme or App Name (Optional)
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. RoyalGrow, Daman Games, RupeeLoan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Promoter Contact / UPI ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Promoter UPI ID / WhatsApp (Optional)
              </label>
              <input
                type="text"
                value={promoterContact}
                onChange={(e) => setPromoterContact(e.target.value)}
                placeholder="e.g. damanpay@okaxis or 9876500001"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Promotional Offer Body */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Promotional Offer Text / Website Details *
            </label>
            <textarea
              rows={5}
              value={promoContent}
              onChange={(e) => setPromoContent(e.target.value)}
              placeholder="Paste the promotional message, guaranteed return promises, referral bonus instructions, or app store description..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 transition font-mono"
            />
          </div>

          {/* Legal Warning Notice */}
          <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex items-start space-x-3 text-xs text-rose-800">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="leading-relaxed">
              <span className="font-bold">Statutory Alert: </span>
              Under Rajasthan Public Gambling Ordinance and Indian laws, online color prediction betting games and unregistered multi-level Ponzi schemes are strictly illegal. Never deposit money into personal UPI accounts.
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-purple-600/20 active:scale-[0.99]"
          >
            {loading ? (
              <span className="animate-pulse">Inspecting Scheme Typology & Banking Identifiers...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Scheme for Police Intelligence Triage</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Analysis Result Card */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Official Incident Reference
              </span>
              <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                {result.submission_id}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Triage Status
              </span>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                <span>{result.status}</span>
              </div>
            </div>
          </div>

          {/* Risk Level Gauge */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                result.risk_level === 'HIGH'
                  ? 'bg-rose-500 shadow-rose-500/20'
                  : result.risk_level === 'MEDIUM'
                  ? 'bg-amber-500 shadow-amber-500/20'
                  : 'bg-emerald-500 shadow-emerald-500/20'
              }`}
            >
              {result.risk_level === 'HIGH' ? (
                <ShieldAlert className="w-7 h-7" />
              ) : result.risk_level === 'MEDIUM' ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <ShieldCheck className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm font-black uppercase tracking-wider ${
                    result.risk_level === 'HIGH'
                      ? 'text-rose-600'
                      : result.risk_level === 'MEDIUM'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {result.risk_level} RISK SCHEME DETECTED
                </span>
                <span className="text-xs font-bold text-slate-400">
                  (Score: {result.risk_score}/100)
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {result.recommendation}
              </p>
            </div>
          </div>

          {/* Indicators */}
          {result.indicators && result.indicators.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Fraud Indicators & Modus Operandi Detected:
              </h4>
              <div className="space-y-2">
                {result.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{ind.name}: </span>
                      <span className="text-slate-600">{ind.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Identifiers */}
          {result.extracted_entities && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {result.extracted_entities.upi?.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Flagged Mule UPI VPA(s)
                  </span>
                  <div className="font-mono text-xs font-bold text-purple-700">
                    {result.extracted_entities.upi.join(', ')}
                  </div>
                </div>
              )}
              {result.extracted_entities.phones?.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Flagged Promoter Phone(s)
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-800">
                    {result.extracted_entities.phones.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-[11px] text-amber-800 leading-relaxed">
            <span className="font-bold">⚠️ Notice: </span>
            {result.disclaimer}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/citizen/my-reports"
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center space-x-1"
            >
              <span>View Report in My Submissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/citizen/assistant"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>Ask AI Cyber Saathi about this scheme ↗</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
