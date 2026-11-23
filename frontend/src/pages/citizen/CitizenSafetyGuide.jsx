import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  Lock,
  ExternalLink,
  Zap,
  Smartphone,
  CreditCard
} from 'lucide-react';

export default function CitizenSafetyGuide() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Rajasthan Police • Citizen Awareness & Advisory</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">
          Cyber Safety Guidelines & Emergency Action SOP
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Essential protocols to protect yourself against financial fraud, fake power cutoff threats, predatory loan apps, and video call extortion.
        </p>
      </div>

      {/* 1930 Callout Card */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 rounded-3xl p-6 text-white border border-rose-800/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>Golden Hour Emergency Protocol</span>
          </div>
          <span className="text-[10px] bg-rose-900 text-rose-200 px-2.5 py-0.5 rounded-full font-bold">
            2-Hour Critical Window
          </span>
        </div>

        <h2 className="text-xl font-black">
          What To Do If Money Has Been Deducted From Your Bank Account:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-rose-400">Step 1: Dial 1930</div>
            <p className="text-slate-300">
              Call the National Cyber Crime Helpline immediately. Provides automated financial freeze on the scammer's bank account.
            </p>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-rose-400">Step 2: Freeze NetBanking</div>
            <p className="text-slate-300">
              Call your bank's 24x7 fraud cell to block ATM cards, disable UPI mandates, and freeze internet banking.
            </p>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-rose-400">Step 3: Lodge Online FIR</div>
            <p className="text-slate-300">
              Lodge a complaint on <code className="text-cyan-400">cybercrime.gov.in</code> with UTR transaction receipts.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Crucial Scam Defenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            ⚡
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            Electricity Disconnection Scam (JVVNL / AVVNL)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Scammers send SMS warning your power will be cut tonight at 9:30 PM. <strong>Rajasthan Discoms NEVER send personal 10-digit mobile numbers for bill payments.</strong> Always check bills on <code className="text-cyan-700">energy.rajasthan.gov.in</code>.
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            🎥
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            Video Call Extortion & 'Digital Arrest' Hoax
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>There is NO provision for 'Digital Arrest' under Indian Law.</strong> Neither Rajasthan Police nor CBI ever conducts interrogations or demands bail money on Skype/WhatsApp video calls. Never pay extortion money.
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            📱
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            Predatory Instant Loan Apps (Spyware)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Never install unknown loan APKs sent on WhatsApp. They demand contact and gallery permissions to blackmail your friends and family. Only take loans from RBI-registered banks and NBFCs.
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            💼
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            Part-Time 'Like YouTube Videos' Job Scam
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Legitimate companies never pay ₹3,000 daily for liking videos or writing reviews. When scammers ask you to deposit money into a 'prepaid task wallet' to unlock earnings, it is a guaranteed Ponzi fraud trap.
          </p>
        </div>
      </div>
    </div>
  );
}
