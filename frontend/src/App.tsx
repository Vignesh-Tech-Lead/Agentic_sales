import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './lib/store';
import { Layout } from './components/Layout';
import { ResourcePage } from './components/ResourcePage';
import { RecordFormPage } from './components/RecordFormPage';
import { DashboardPage } from './pages/DashboardPage';
import { FunnelPage } from './pages/FunnelPage';
import { InboxPage } from './pages/InboxPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { AgentsPage } from './pages/AgentsPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { CalendarPage } from './pages/CalendarPage';
import { IdentityPage } from './pages/IdentityPage';
import { AdminPage } from './pages/AdminPage';
import { ReportsPage } from './pages/ReportsPage';

const standardModules = [
  'leads', 'companies', 'forms', 'email', 'campaigns', 'willingness', 'tasks',
  'proposals', 'predictive', 'forecasting', 'recovery', 'whatsapp',
  'meeting-intel', 'referrals', 'multilingual',
];

function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-5xl font-black text-slate-200">404</p>
        <p className="mt-3 text-sm font-semibold text-slate-700">This module does not exist</p>
        <a href="/dashboard" className="btn-primary mt-5 inline-flex">Return to dashboard</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/funnel" element={<FunnelPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/identity" element={<IdentityPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/:module/new" element={<RecordFormPage />} />
            <Route path="/:module/:id/edit" element={<RecordFormPage />} />
            {standardModules.map((key) => <Route key={key} path={`/${key}`} element={<ResourcePage configKey={key} />} />)}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
