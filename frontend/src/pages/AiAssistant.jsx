import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  ShieldAlert,
  Sparkles,
  Database,
  ArrowRight,
  Terminal,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SUGGESTIONS = [
  'threat cam what to do',
  'Which phone number appears in multiple cases?',
  'How to freeze mule accounts under Section 102 CrPC?',
  'Explain electricity bill cutoff scam modus operandi',
  'Which UPI IDs are associated with this investigation?',
  'Show all cases connected to jvvnl-bijli-update.online'
];

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Greetings Officer. I am the LinkedShield AI Forensic Assistant. I can analyze persistent case records, trace repeated phone numbers or UPI endpoints across FIRs, provide legal SOPs (Sec 91 CrPC & Sec 102 Lien directives), and explain technical risk scores. How may I assist your investigation today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg = { role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Assistant error');

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer,
          references: data.references,
          confidence: data.confidence
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Error processing inquiry: ' + err.message
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-7.5rem)] flex flex-col font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <Bot className="w-4 h-4" />
          <span>Interactive Forensic Case Intelligence</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">AI Investigation Assistant</h1>
        <p className="text-xs text-slate-500">
          Queries actual case records, cross-references shared identifiers, and explains forensic evidence without hallucinations.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs ${
                  m.role === 'user'
                    ? 'bg-cyan-600 text-white shadow-xs font-medium'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                {m.references && m.references.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="font-bold text-slate-500 uppercase">Citations:</span>
                    {m.references.map((r, i) => (
                      <Link
                        key={i}
                        to={`/cases?q=${r}`}
                        className="px-2 py-0.5 bg-white border border-slate-200 text-cyan-700 font-mono font-bold rounded hover:border-cyan-400 transition"
                      >
                        {r}
                      </Link>
                    ))}
                    {m.confidence && (
                      <span className="ml-auto text-[10px] font-bold text-emerald-600 uppercase">
                        {m.confidence}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                <span>Interrogating evidence database & legal SOPs...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Suggestions:</span>
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs shrink-0 transition"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a phone number, UPI ID, domain, legal notice, or Case ID..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
