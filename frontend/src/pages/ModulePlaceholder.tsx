import { useLocation, useNavigate } from 'react-router-dom';
import { Button, ModulePage } from '../design-system';
import { moduleByPath } from '../app/modules';

/**
 * Placeholder for modules not yet built. Now renders through the standard
 * ModulePage + StateView infrastructure (Step 3), using the shared
 * 'coming-soon' state so every future module shares one visual language.
 */
export function ModulePlaceholder() {
  const location = useLocation();
  const navigate = useNavigate();
  const mod = moduleByPath(location.pathname);
  const label = mod?.label ?? 'This module';

  return (
    <ModulePage
      title={mod?.label ?? 'Module'}
      description="This module is planned for an upcoming phase."
      status="coming-soon"
      stateProps={{
        title: `${label} is coming soon`,
        description:
          'The design foundation is ready. Ask Jarvis to help scope this module, or explore the Command Center.',
        action: <Button onClick={() => navigate('/chat')}>Ask Jarvis to plan it</Button>,
        secondaryAction: (
          <Button variant="ghost" onClick={() => navigate('/')}>Back to Command Center</Button>
        ),
      }}
    />
  );
}
