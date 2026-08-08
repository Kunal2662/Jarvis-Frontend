import { Building2, Calendar, FolderOpen, Mail, Plug, Search, Terminal, Workflow, type LucideIcon } from 'lucide-react';
import { Card, Switch } from '../../design-system';
import type { AiApp } from './aiAppsService';
import { AiAppCategoryBadge } from './AiAppCategoryBadge';
import { AiAppStatusBadge } from './AiAppStatusBadge';

/** Per-app icon for the seeded catalog entries; falls back to a generic
 *  category icon for any future app id this map doesn't yet cover. */
const APP_ICON: Record<string, LucideIcon> = {
  'web-search': Search,
  'file-access': FolderOpen,
  'automations-tool': Workflow,
  'code-sandbox': Terminal,
  gmail: Mail,
  'google-calendar': Calendar,
  'microsoft-365': Building2,
};

function appIcon(app: AiApp): LucideIcon {
  return APP_ICON[app.id] ?? Plug;
}

export interface AiAppCardProps {
  app: AiApp;
  onOpen: (id: string) => void;
  onToggle: (id: string, connected: boolean) => void;
  toggling?: boolean;
}

export function AiAppCard({ app, onOpen, onToggle, toggling }: AiAppCardProps) {
  const Icon = appIcon(app);
  const unavailable = app.connectionStatus === 'unavailable';

  return (
    <Card
      variant="raised"
      interactive
      role="button"
      tabIndex={0}
      onClick={() => onOpen(app.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(app.id);
        }
      }}
      className="flex flex-col gap-3 p-4"
      data-testid={`ai-app-card-${app.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 shrink-0 text-content-tertiary [&_svg]:size-5">
            <Icon aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-body font-semibold text-content">{app.name}</span>
            <span className="text-caption text-content-tertiary">{app.provider}</span>
          </div>
        </div>
        <Switch
          checked={app.connectionStatus === 'connected'}
          disabled={toggling || unavailable}
          aria-label={app.connectionStatus === 'connected' ? `Disconnect ${app.name}` : `Connect ${app.name}`}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(checked) => onToggle(app.id, checked)}
          data-testid={`ai-app-toggle-${app.id}`}
        />
      </div>

      <span className="line-clamp-2 text-body-sm text-content-secondary">{app.description}</span>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line-subtle pt-3">
        <AiAppCategoryBadge category={app.category} />
        <AiAppStatusBadge status={app.connectionStatus} />
      </div>
    </Card>
  );
}
