import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
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
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages';
import { AuthProvider, useAuth, type AppRole } from './lib/auth';
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

const allRoles: AppRole[] = ['Super Admin','Organization Admin','Sales Manager','Sales Executive','Marketing Manager','Marketing Executive','Knowledge Manager','Analyst/Auditor'];
const routeRoles: Record<string, AppRole[]> = {
  '/dashboard': allRoles,
  '/identity': ['Super Admin','Organization Admin'], '/admin': ['Super Admin','Organization Admin'],
  '/knowledge': ['Super Admin','Organization Admin','Knowledge Manager','Analyst/Auditor'],
  '/agents': ['Super Admin','Organization Admin','Knowledge Manager','Analyst/Auditor'],
  '/meeting-intel': ['Super Admin','Organization Admin','Knowledge Manager','Analyst/Auditor'],
  '/multilingual': ['Super Admin','Organization Admin','Knowledge Manager','Analyst/Auditor'],
  '/reports': ['Super Admin','Organization Admin','Sales Manager','Marketing Manager','Analyst/Auditor'],
  '/campaigns': ['Super Admin','Organization Admin','Marketing Manager','Marketing Executive','Analyst/Auditor'],
  '/forms': ['Super Admin','Organization Admin','Sales Manager','Sales Executive','Marketing Manager','Marketing Executive','Analyst/Auditor'],
  '/email': ['Super Admin','Organization Admin','Marketing Manager','Marketing Executive','Sales Manager','Analyst/Auditor'],
  '/whatsapp': ['Super Admin','Organization Admin','Marketing Manager','Marketing Executive','Sales Manager','Analyst/Auditor'],
  '/referrals': ['Super Admin','Organization Admin','Sales Manager','Marketing Manager','Analyst/Auditor'],
};
const salesRoles: AppRole[] = ['Super Admin','Organization Admin','Sales Manager','Sales Executive','Analyst/Auditor'];
function ProtectedRoute({ children, roles = allRoles }: { children: React.ReactNode; roles?: AppRole[] }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Checking workspace access…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
function ProtectedLayout() { return <ProtectedRoute><Layout /></ProtectedRoute>; }
function RoleRoute({ children, roles = salesRoles }: { children: React.ReactNode; roles?: AppRole[] }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}
function ModuleRoleRoute({ children }: { children: React.ReactNode }) {
  const { module = '' } = useParams();
  return <RoleRoute roles={routeRoles[`/${module}`] ?? salesRoles}>{children}</RoleRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<RoleRoute roles={allRoles}><DashboardPage /></RoleRoute>} />
            <Route path="/funnel" element={<RoleRoute><FunnelPage /></RoleRoute>} />
            <Route path="/inbox" element={<RoleRoute><InboxPage /></RoleRoute>} />
            <Route path="/knowledge" element={<RoleRoute roles={routeRoles['/knowledge']}><KnowledgePage /></RoleRoute>} />
            <Route path="/agents" element={<RoleRoute roles={routeRoles['/agents']}><AgentsPage /></RoleRoute>} />
            <Route path="/workflows" element={<RoleRoute><WorkflowsPage /></RoleRoute>} />
            <Route path="/calendar" element={<RoleRoute><CalendarPage /></RoleRoute>} />
            <Route path="/identity" element={<RoleRoute roles={routeRoles['/identity']}><IdentityPage /></RoleRoute>} />
            <Route path="/admin" element={<RoleRoute roles={routeRoles['/admin']}><AdminPage /></RoleRoute>} />
            <Route path="/reports" element={<RoleRoute roles={routeRoles['/reports']}><ReportsPage /></RoleRoute>} />
            <Route path="/:module/new" element={<ModuleRoleRoute><RecordFormPage /></ModuleRoleRoute>} />
            <Route path="/:module/:id/edit" element={<ModuleRoleRoute><RecordFormPage /></ModuleRoleRoute>} />
            {standardModules.map((key) => <Route key={key} path={`/${key}`} element={<RoleRoute roles={routeRoles[`/${key}`] ?? salesRoles}><ResourcePage configKey={key} /></RoleRoute>} />)}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </AppProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
