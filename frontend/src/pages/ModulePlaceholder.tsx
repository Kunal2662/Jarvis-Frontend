import { useLocation, useNavigate } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { Button, EmptyState, PageHeader, WorkspaceContainer } from '../design-system';
import { moduleByPath } from '../app/modules';

/** Placeholder for modules not yet built (Phase 3+ deferred). */
export function ModulePlaceholder() {
  const location = useLocation();
  const navigate = useNavigate();
  const mod = moduleByPath(location.pathname);

  return (
    <WorkspaceContainer header={<PageHeader title={mod?.label ?? 'Module'} description="This module is planned for an upcoming phase." />}>
      <EmptyState
        icon={<Construction />}
        title={`${mod?.label ?? 'This module'} is coming soon`}
        description="The design foundation is ready. Ask Jarvis to help scope this module, or explore the Command Center."
        action={<Button onClick={() => navigate('/chat')}>Ask Jarvis to plan it</Button>}
        secondaryAction={<Button variant="ghost" onClick={() => navigate('/')}>Back to Command Center</Button>}
      />
    </WorkspaceContainer>
  );
}
