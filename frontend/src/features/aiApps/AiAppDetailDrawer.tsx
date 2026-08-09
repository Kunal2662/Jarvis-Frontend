import { Info } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Spinner,
  Switch,
} from '../../design-system';
import type { AiApp } from './aiAppsService';
import { AiAppCategoryBadge } from './AiAppCategoryBadge';
import { AiAppStatusBadge } from './AiAppStatusBadge';
import { formatDateTime } from './aiAppsFormat';

export interface AiAppDetailDrawerProps {
  app: AiApp | null;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (id: string, connected: boolean) => void;
  busy?: boolean;
}

/** Detail view for a single AI App / connector catalog entry — full
 *  description, capabilities/permissions summary, and the same
 *  connect/disconnect control the catalog card exposes. */
export function AiAppDetailDrawer({ app, loading, open, onOpenChange, onToggle, busy }: AiAppDetailDrawerProps) {
  const unavailable = app?.connectionStatus === 'unavailable';

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-lg overflow-y-auto" data-testid="ai-app-detail-drawer">
        {loading || !app ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DrawerHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DrawerTitle>{app.name}</DrawerTitle>
                <AiAppCategoryBadge category={app.category} />
                <AiAppStatusBadge status={app.connectionStatus} />
              </div>
              <DrawerDescription>{app.description}</DrawerDescription>
            </DrawerHeader>

            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div className="rounded-lg border border-line-subtle p-3">
                <div className="text-caption text-content-tertiary">Provider</div>
                <div className="text-content">{app.provider}</div>
              </div>
              <div className="rounded-lg border border-line-subtle p-3">
                <div className="text-caption text-content-tertiary">Last changed</div>
                <div className="text-content">{formatDateTime(app.updatedAt)}</div>
              </div>
            </div>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Capabilities &amp; permissions</h3>
              <ul className="flex flex-col gap-1.5">
                {app.capabilities.map((c) => (
                  <li key={c} className="rounded-lg border border-line-subtle p-2.5 text-body-sm text-content-secondary">
                    {c}
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex items-start gap-2 rounded-lg border border-line-subtle bg-surface-raised p-3 text-caption text-content-tertiary">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Connections shown here are local to this frontend session — this toggle does not start a real
                sign-in or OAuth flow, and no third-party account is ever actually linked.
              </span>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-subtle pt-4">
              <div className="flex flex-col">
                <span className="text-body-sm font-medium text-content">
                  {unavailable
                    ? `${app.name} isn't available to connect in this build yet.`
                    : app.connectionStatus === 'connected'
                      ? 'Connected (local/mock)'
                      : 'Not connected'}
                </span>
              </div>
              <Switch
                checked={app.connectionStatus === 'connected'}
                disabled={busy || unavailable}
                aria-label={app.connectionStatus === 'connected' ? `Disconnect ${app.name}` : `Connect ${app.name}`}
                onCheckedChange={(checked) => onToggle(app.id, checked)}
                data-testid="ai-app-detail-toggle"
              />
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
