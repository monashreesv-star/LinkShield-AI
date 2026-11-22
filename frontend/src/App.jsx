import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Dashboard from './pages/Dashboard';
import MessageAnalyzer from './pages/MessageAnalyzer';
import UrlScanner from './pages/UrlScanner';
import WebsiteAnalyzer from './pages/WebsiteAnalyzer';
import ApkAnalyzer from './pages/ApkAnalyzer';
import ScamGraph from './pages/ScamGraph';
import CaseManagement from './pages/CaseManagement';
import ThreatHeatList from './pages/ThreatHeatList';
import InvestigationReports from './pages/InvestigationReports';
import AiAssistant from './pages/AiAssistant';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/messages" element={<MessageAnalyzer />} />
              <Route path="/urls" element={<UrlScanner />} />
              <Route path="/websites" element={<WebsiteAnalyzer />} />
              <Route path="/apks" element={<ApkAnalyzer />} />
              <Route path="/graph" element={<ScamGraph />} />
              <Route path="/cases" element={<CaseManagement />} />
              <Route path="/heat-list" element={<ThreatHeatList />} />
              <Route path="/reports" element={<InvestigationReports />} />
              <Route path="/assistant" element={<AiAssistant />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
