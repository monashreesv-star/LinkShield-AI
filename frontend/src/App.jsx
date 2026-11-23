import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Officer Layout Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Citizen Layout Components
import CitizenSidebar from './components/CitizenSidebar';
import CitizenHeader from './components/CitizenHeader';

// Auth Page
import Login from './pages/Login';

// Officer Pages
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
import OfficerCitizenSubmissions from './pages/OfficerCitizenSubmissions';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import CitizenReportMessage from './pages/citizen/CitizenReportMessage';
import CitizenReportUrl from './pages/citizen/CitizenReportUrl';
import CitizenReportWebsite from './pages/citizen/CitizenReportWebsite';
import CitizenUploadEvidence from './pages/citizen/CitizenUploadEvidence';
import CitizenAiAssistant from './pages/citizen/CitizenAiAssistant';
import CitizenThreatChecker from './pages/citizen/CitizenThreatChecker';
import CitizenMyReports from './pages/citizen/CitizenMyReports';
import CitizenSafetyGuide from './pages/citizen/CitizenSafetyGuide';

function ProtectedLayout() {
  const isAuth = localStorage.getItem('ls_auth') === 'true';
  const role = localStorage.getItem('ls_role') || 'officer';

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // ==========================================
  // CITIZEN WORKSPACE LAYOUT
  // ==========================================
  if (role === 'citizen') {
    return (
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <CitizenSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <CitizenHeader />
          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/citizen" element={<CitizenDashboard />} />
              <Route path="/citizen/assistant" element={<CitizenAiAssistant />} />
              <Route path="/citizen/check-threat" element={<CitizenThreatChecker />} />
              <Route path="/citizen/report-message" element={<CitizenReportMessage />} />
              <Route path="/citizen/report-url" element={<CitizenReportUrl />} />
              <Route path="/citizen/report-website" element={<CitizenReportWebsite />} />
              <Route path="/citizen/upload-evidence" element={<CitizenUploadEvidence />} />
              <Route path="/citizen/my-reports" element={<CitizenMyReports />} />
              <Route path="/citizen/safety-guide" element={<CitizenSafetyGuide />} />
              <Route path="*" element={<Navigate to="/citizen" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHORISED POLICE OFFICER WORKSPACE LAYOUT
  // ==========================================
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
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
            <Route path="/citizen-submissions" element={<OfficerCitizenSubmissions />} />
            <Route path="/heat-list" element={<ThreatHeatList />} />
            <Route path="/reports" element={<InvestigationReports />} />
            <Route path="/assistant" element={<AiAssistant />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
