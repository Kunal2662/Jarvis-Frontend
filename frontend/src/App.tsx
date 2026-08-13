import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './app/AppLayout';
import { modules } from './app/modules';
import { Home } from './pages/Home';
import { ChatPage } from './features/chat/ChatPage';
import { AutomationsPage } from './features/automations/AutomationsPage';
import { ModulePlaceholder } from './pages/ModulePlaceholder';
import { RouteFallback } from './app/RouteFallback';

// Everything below is a secondary surface (not part of the Home/Chat/Voice/
// Automations primary strip) — lazy so its code only downloads when someone
// actually navigates there, instead of shipping in the eagerly-loaded main
// bundle every session pays for on first load. See docs/FRONTEND_PROGRESS.md
// Step 25 for the measured before/after.
const KnowledgePage = lazy(() => import('./features/knowledge/KnowledgePage').then((m) => ({ default: m.KnowledgePage })));
const IntelligencePage = lazy(() => import('./features/intelligence/IntelligencePage').then((m) => ({ default: m.IntelligencePage })));
const AiAppsPage = lazy(() => import('./features/aiApps/AiAppsPage').then((m) => ({ default: m.AiAppsPage })));
const NotesPage = lazy(() => import('./features/notes/NotesPage').then((m) => ({ default: m.NotesPage })));
const TasksPage = lazy(() => import('./features/tasks/TasksPage').then((m) => ({ default: m.TasksPage })));
const CalendarPage = lazy(() => import('./features/calendar/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const FilesPage = lazy(() => import('./features/files/FilesPage').then((m) => ({ default: m.FilesPage })));
const SmartHomePage = lazy(() => import('./features/smartHome/SmartHomePage').then((m) => ({ default: m.SmartHomePage })));
const DeviceManagementPage = lazy(() => import('./features/smartHome/DeviceManagementPage').then((m) => ({ default: m.DeviceManagementPage })));
const IntegrationsPage = lazy(() => import('./features/smartHome/IntegrationsPage').then((m) => ({ default: m.IntegrationsPage })));
const MemoryPage = lazy(() => import('./features/memory/MemoryPage').then((m) => ({ default: m.MemoryPage })));
const AgentsPage = lazy(() => import('./features/agents/AgentsPage').then((m) => ({ default: m.AgentsPage })));
const DiagnosticsPage = lazy(() => import('./features/diagnostics/DiagnosticsPage').then((m) => ({ default: m.DiagnosticsPage })));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const DesignShowcase = lazy(() => import('./pages/DesignShowcase').then((m) => ({ default: m.DesignShowcase })));

function lazyRoute(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

const PAGES = [
  '/',
  '/chat',
  '/automations',
  '/knowledge',
  '/intelligence',
  '/apps',
  '/notes',
  '/tasks',
  '/calendar',
  '/files',
  '/smart-home',
  '/smart-home/devices',
  '/smart-home/integrations',
  '/memory',
  '/agents',
  '/diagnostics',
  '/settings',
  '/design',
];

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/automations" element={<AutomationsPage />} />
        <Route path="/knowledge" element={lazyRoute(<KnowledgePage />)} />
        <Route path="/intelligence" element={lazyRoute(<IntelligencePage />)} />
        <Route path="/apps" element={lazyRoute(<AiAppsPage />)} />
        <Route path="/notes" element={lazyRoute(<NotesPage />)} />
        <Route path="/tasks" element={lazyRoute(<TasksPage />)} />
        <Route path="/calendar" element={lazyRoute(<CalendarPage />)} />
        <Route path="/files" element={lazyRoute(<FilesPage />)} />
        <Route path="/smart-home" element={lazyRoute(<SmartHomePage />)} />
        <Route path="/smart-home/devices" element={lazyRoute(<DeviceManagementPage />)} />
        <Route path="/smart-home/integrations" element={lazyRoute(<IntegrationsPage />)} />
        <Route path="/memory" element={lazyRoute(<MemoryPage />)} />
        <Route path="/agents" element={lazyRoute(<AgentsPage />)} />
        <Route path="/diagnostics" element={lazyRoute(<DiagnosticsPage />)} />
        <Route path="/settings" element={lazyRoute(<SettingsPage />)} />
        <Route path="/design" element={lazyRoute(<DesignShowcase />)} />

        {/* Placeholder surfaces (Home/Chat/Voice widgets ship in later phases). */}
        {modules
          .filter((m) => !PAGES.includes(m.path))
          .map((m) => (
            <Route key={m.path} path={m.path} element={<ModulePlaceholder />} />
          ))}

        {/* Every renamed/demoted v1 route redirects — nothing 404s. */}
        {modules.flatMap((m) =>
          (m.redirectFrom ?? []).map((from) => (
            <Route key={from} path={from} element={<Navigate to={m.path} replace />} />
          )),
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
