import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SUGGESTED_DOUBTS = [
  {
    label: '⚖️ Digital Arrest Hoax',
    query: 'Someone is calling me on Skype claiming to be police or CBI saying I am under digital arrest, what should I do?'
  },
  {
    label: '⚡ Electricity Bill Disconnection',
    query: 'I received an SMS that electricity connection will be cut off tonight at 9:30 PM due to unpaid bill. Is this real?'
  },
  {
    label: '🚨 I Lost Money / Shared OTP',
    query: 'Money was just debited from my account or I shared an OTP. How can I stop the fraud in the Golden Hour?'
  },
  {
    label: '💼 YouTube Like Job Offer',
    query: 'Someone contacted me on WhatsApp offering Rs 3,000 daily for liking YouTube videos. Is this a scam?'
  },
  {
    label: '📱 Instant Loan App Risks',
    query: 'An instant loan app is demanding access to my phone contacts and photo gallery. Is it safe to install?'
  },
  {
    label: '🚗 Traffic e-Challan APK',
    query: 'I got a WhatsApp message saying I have an unpaid traffic challan and to install an APK file. Is this safe?'
  },
  {
    label: '🎰 Color Prediction Games',
    query: 'Are color prediction games like Daman Games or BDG Win legal and can I withdraw my money?'
  }
];

export default function CitizenAiAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "### Namaste! I am your AI Cyber Saathi 🛡️\n\nI am Rajasthan Police's citizen safety assistant, here to answer your questions and clarify any doubts about suspicious messages, fake calls, online scams, or lost money.\n\nAsk me anything in plain English or Hindi, or choose one of the common doubts below!",
      topic: 'Welcome & Guidance',
      helpful_links: [
        { title: 'Emergency: Call 1930 Helpline', url: 'tel:1930' },
        { title: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in' }
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryToSend) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    // Add user message
    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    const token = localStorage.getItem('ls_token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    try {
      const res = await fetch('/api/citizen/assistant', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: q })
      });
      if (res.ok) {
        const data = await res.json();
        const aiMsg = {
          sender: 'ai',
          text: data.answer,
          topic: data.topic,
          risk_verdict: data.risk_verdict,
          emergency_action: data.emergency_action,
          helpful_links: data.helpful_links || []
        };
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }
    } catch (fetchErr) {
      // Continue to offline knowledge base fallback
    }

    // Comprehensive Offline Rajasthan Cyber Advisory Fallback
    const qLower = q.toLowerCase();
    let topic = 'Cyber Safety Advisory';
    let risk_verdict = 'HIGH RISK';
    let emergency_action = 'Dial national cyber crime helpline 1930 immediately.';
    let answer = '';

    if (qLower.includes('electricity') || qLower.includes('9:30') || qLower.includes('power') || qLower.includes('bijli')) {
      topic = 'Electricity Bill Disconnection Scam (JVVNL/AVVNL)';
      risk_verdict = 'CONFIRMED FRAUD';
      emergency_action = 'DO NOT call the 10-digit number. Verify bills only on https://energy.rajasthan.gov.in.';
      answer = `⚡ **THIS IS A CONFIRMED SCAM! DO NOT PANIC.**\n\n**Modus Operandi:**\nFraud syndicates broadcast bulk SMS messages claiming your power will be disconnected tonight at 9:30 PM due to an unpaid bill.\n\n**Official Rajasthan Discom Facts:**\n1. Genuine state power companies (JVVNL, AVVNL, JdVVNL) NEVER send disconnection notices from personal 10-digit mobile numbers.\n2. Official government discom SMS headers always show registered sender IDs like **JVVNL-GOV** or **RAJGOV**.\n3. Disconnections never occur at 9:30 PM without statutory 15-day prior written notice.\n\n**What you must do:**\n• Do NOT click any links like \`.online\` or \`.cc\`.\n• Do NOT install any APK file (like QuickSupport or AnyDesk).\n• Check your actual bill on the official Rajasthan Energy Portal.`;
    } else if (qLower.includes('digital arrest') || qLower.includes('cbi') || qLower.includes('police') || qLower.includes('skype')) {
      topic = 'Digital Arrest Hoax & Video Call Extortion';
      risk_verdict = 'CRITICAL FRAUD';
      emergency_action = 'Immediately disconnect the call. Indian law does NOT recognize digital arrest.';
      answer = `⚖️ **IMPORTANT: 'DIGITAL ARREST' DOES NOT EXIST IN INDIAN LAW!**\n\n**Modus Operandi:**\nFraudsters pose as CBI officers, Mumbai Police, or Supreme Court judges on WhatsApp/Skype video calls, showing fake police badges, uniforms, or legal warrants to threaten arrest for illegal parcels.\n\n**Legal Facts:**\n1. No police or law enforcement agency in India conducts arrests, interrogations, or court proceedings via Skype or WhatsApp video call.\n2. Law enforcement will NEVER demand money or 'security deposits' to verify your bank account.\n\n**What you must do:**\n• Disconnect the video call immediately.\n• Block and report the scammer's phone number.\n• Report to national helpline 1930 or your local police station.`;
    } else if (qLower.includes('debited') || qLower.includes('lost money') || qLower.includes('otp') || qLower.includes('golden hour')) {
      topic = 'Golden Hour Financial Recovery Protocol';
      risk_verdict = 'EMERGENCY ACTION';
      emergency_action = 'Dial 1930 within 2 hours to freeze recipient mule accounts.';
      answer = `🚨 **URGENT GOLDEN HOUR STEPS (CALL 1930 IMMEDIATELY):**\n\nIf money was unauthorizedly debited or you shared an OTP, act immediately:\n\n1. **Dial 1930 (National Cyber Financial Helpline)**: Rajasthan Police cyber officers can trigger a lien notice directly via NPCI to freeze the recipient mule account before funds are withdrawn at ATMs.\n2. **Block Bank Card / NetBanking**: Use your official banking mobile app to temporarily freeze cards and UPI access.\n3. **Preserve Transaction Reference**: Note down the 12-digit UPI UTR number or bank SMS timestamp.\n4. **Report Evidence**: Upload screenshots of the payment slip on LinkShield AI's evidence vault.`;
    } else {
      topic = 'Citizen Scam Protection Advisory';
      risk_verdict = 'SUSPICIOUS ACTIVITY';
      emergency_action = 'Do not transfer money or share personal OTPs.';
      answer = `🛡️ **Rajasthan Police Cyber Safety Advisory:**\n\nBased on your query, remember the core principles of cyber protection:\n\n1. **Never share OTPs, PINs, or UPI Passcodes**: Legitimate banks and government officials never ask for OTPs or screen sharing.\n2. **Beware of High-Yield Investment Offers**: Anyone promising 30%+ guaranteed returns or money doubling in color prediction games is operating an illegal Ponzi or betting racket.\n3. **Verify Links**: Official Rajasthan Government websites strictly end with \`.rajasthan.gov.in\` or \`.gov.in\`.\n\nIf you have lost funds or feel threatened, contact toll-free helpline **1930** immediately.`;
    }

    setMessages((prev) => [
      ...prev,
      {
        sender: 'ai',
        text: answer,
        topic,
        risk_verdict,
        emergency_action,
        helpful_links: [
          { title: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in' },
          { title: 'Call 1930 Helpline', url: 'tel:1930' }
        ]
      }
    ]);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <Bot className="w-4 h-4" />
          <span>Rajasthan Police • Citizen Cyber Helpline & Doubt Clarifier</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">
          AI Cyber Saathi — Citizen Safety Assistant
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Confused by a suspicious call, deceptive message, or unexpected threat? Ask your questions directly. Our AI clarifies doubts, debunks scam tactics, and guides immediate protection.
        </p>
      </div>

      {/* Suggested Quick Doubt Chips */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Click a common doubt to get instant answers:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_DOUBTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(item.query)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[500px]">
        {/* Messages Stream */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[600px]">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                  }`}
                >
                  {isUser ? <HelpCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Body */}
                <div
                  className={`p-4 rounded-2xl text-xs max-w-2xl leading-relaxed space-y-3 ${
                    isUser
                      ? 'bg-cyan-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Topic badge if AI */}
                  {!isUser && msg.topic && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                        {msg.topic}
                      </span>
                      {msg.risk_verdict && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                          {msg.risk_verdict}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Text formatted */}
                  <div className="whitespace-pre-line text-xs font-sans">
                    {msg.text}
                  </div>

                  {/* Helpful Links */}
                  {!isUser && msg.helpful_links && msg.helpful_links.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-2">
                      {msg.helpful_links.map((link, lIdx) => (
                        <a
                          key={lIdx}
                          href={link.url}
                          target={link.url.startsWith('http') ? '_blank' : '_self'}
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-cyan-700 font-bold hover:bg-slate-50 transition text-[11px]"
                        >
                          <span>{link.title}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-3 text-xs text-slate-400 py-2">
              <Bot className="w-6 h-6 text-cyan-600 animate-spin" />
              <span>AI Cyber Saathi is analyzing your doubt...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question or describe what happened (e.g. 'Someone sent a parcel delivery link asking for Rs 25...')"
              disabled={loading}
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 shadow-xs transition"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 transition shadow-md shadow-cyan-600/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Powered by Rajasthan Police Cyber Knowledge Engine</span>
            <span className="text-rose-600 font-bold">Emergency? Call 1930</span>
          </div>
        </div>
      </div>
    </div>
  );
}
