import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './app/AppLayout';
import { modules } from './app/modules';
import { Home } from './pages/Home';
import { ChatPage } from './features/chat/ChatPage';
import { AutomationsPage } from './features/automations/AutomationsPage';
import { KnowledgePage } from './features/knowledge/KnowledgePage';
import { IntelligencePage } from './features/intelligence/IntelligencePage';
import { AiAppsPage } from './features/aiApps/AiAppsPage';
import { NotesPage } from './features/notes/NotesPage';
import { TasksPage } from './features/tasks/TasksPage';
import { CalendarPage } from './features/calendar/CalendarPage';
import { FilesPage } from './features/files/FilesPage';
import { DesignShowcase } from './pages/DesignShowcase';
import { ModulePlaceholder } from './pages/ModulePlaceholder';

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
  '/design',
];

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/automations" element={<AutomationsPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
        <Route path="/apps" element={<AiAppsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/design" element={<DesignShowcase />} />

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
