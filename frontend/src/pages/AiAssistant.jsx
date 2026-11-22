import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, HelpCircle, ShieldCheck, CornerDownLeft } from 'lucide-react';

const SUGGESTIONS = [
  'Which phone number appears in multiple cases?',
  'Which UPI IDs are associated with this investigation?',
  'Show all cases connected to jvvnl-bijli-update.online',
  'Summarise indicators in LS-20261122-8AFE01',
  'Why was 9876500001 flagged as suspicious?'
];

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Greetings Officer. I am the LinkedShield AI Forensic Assistant. I can analyze persistent case records, trace repeated phone numbers or UPI endpoints across FIRs, and explain technical risk scores. How may I assist your investigation today?',
      references: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (qText) => {
    const query = qText || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.answer,
          references: data.references || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Error accessing case database: ' + err.message,
          references: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Title */}
      <div className="shrink-0">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
          <Bot className="w-4 h-4" />
          <span>Module 9 • Conversational Case Intelligence</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">AI Investigation Assistant</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Queries actual case records, cross-references shared identifiers, and explains forensic evidence without hallucinations.
        </p>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-xs p-5 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'bot' && (
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-4 rounded-2xl text-xs max-w-xl whitespace-pre-wrap leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              {m.text}

              {m.references?.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Cited Cases:</span>
                  {m.references.map((ref, i) => (
                    <a
                      key={i}
                      href={`/cases?id=${ref}`}
                      className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-white text-cyan-700 border border-slate-200 hover:bg-cyan-50"
                    >
                      {ref}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-cyan-700 text-white flex items-center justify-center shrink-0 font-bold text-xs">
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
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-500">
              Querying database records and cross-referencing identifiers...
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Pills */}
      <div className="shrink-0 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold text-slate-400 mr-1">Suggestions:</span>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(s)}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition"
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
        className="shrink-0 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a phone number, UPI ID, domain, or Case ID..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-xs"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5 text-cyan-400" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
