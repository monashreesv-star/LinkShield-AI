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
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Assistant failed to respond');

      const aiMsg = {
        sender: 'ai',
        text: data.answer,
        topic: data.topic,
        risk_verdict: data.risk_verdict,
        emergency_action: data.emergency_action,
        helpful_links: data.helpful_links || []
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `I apologize, I encountered a temporary connection issue. For immediate assistance, please dial **1930** or report the scammer details on our reporting pages.`
        }
      ]);
    } finally {
      setLoading(false);
    }
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
