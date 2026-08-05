import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './app/AppLayout';
import { modules } from './app/modules';
import { Home } from './pages/Home';
import { ChatPage } from './features/chat/ChatPage';
import { DesignShowcase } from './pages/DesignShowcase';
import { ModulePlaceholder } from './pages/ModulePlaceholder';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/design" element={<DesignShowcase />} />
        {modules
          .filter((m) => !['/', '/chat', '/design'].includes(m.path))
          .map((m) => (
            <Route key={m.path} path={m.path} element={<ModulePlaceholder />} />
          ))}
      </Route>
    </Routes>
  );
}
