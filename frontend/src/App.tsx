import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './app/AppLayout';
import { modules } from './app/modules';
import { Home } from './pages/Home';
import { ChatPage } from './features/chat/ChatPage';
import { AutomationsPage } from './features/automations/AutomationsPage';
import { KnowledgePage } from './features/knowledge/KnowledgePage';
import { IntelligencePage } from './features/intelligence/IntelligencePage';
import { DesignShowcase } from './pages/DesignShowcase';
import { ModulePlaceholder } from './pages/ModulePlaceholder';

const PAGES = ['/', '/chat', '/automations', '/knowledge', '/intelligence', '/design'];

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/automations" element={<AutomationsPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
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
