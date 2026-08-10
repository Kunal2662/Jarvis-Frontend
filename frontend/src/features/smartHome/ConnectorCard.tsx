import { Badge, Card } from '../../design-system';
import type { ConnectorState, ConnectorType } from './smartHomeIntegrationService';
import {
  CONNECTOR_STATUS_BADGE_VARIANT,
  CONNECTOR_STATUS_ICON,
  CONNECTOR_STATUS_LABEL,
  CONNECTOR_TYPE_ICON,
  CONNECTOR_TYPE_LABEL,
  formatLastSynced,
} from './smartHomeIntegrationFormat';

export interface ConnectorCardProps {
  type: ConnectorType;
  /** `null` means this connector's backend isn't ready yet (Core contract
   *  pending) — shown as a distinct, honest "not connected yet" card rather
   *  than fabricating a status. */
  state: ConnectorState | null;
  onOpen: (type: ConnectorType) => void;
}

export function ConnectorCard({ type, state, onOpen }: ConnectorCardProps) {
  const TypeIcon = CONNECTOR_TYPE_ICON[type];
  const StatusIcon = state ? CONNECTOR_STATUS_ICON[state.status] : CONNECTOR_STATUS_ICON.disconnected;

  return (
    <Card
      interactive
      className="flex flex-col gap-3 p-4"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(type)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(type);
        }
      }}
      data-testid={`connector-card-${type}`}
      aria-label={`Manage ${CONNECTOR_TYPE_LABEL[type]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <TypeIcon className="size-5 shrink-0 text-content-secondary" aria-hidden="true" />
          <span className="text-body font-semibold text-content">{CONNECTOR_TYPE_LABEL[type]}</span>
        </div>
        {state ? (
          <Badge variant={CONNECTOR_STATUS_BADGE_VARIANT[state.status]} size="sm" data-testid={`connector-status-${type}`}>
            <StatusIcon className={`size-3.5 ${state.status === 'connecting' ? 'animate-spin' : ''}`} aria-hidden="true" />
            {CONNECTOR_STATUS_LABEL[state.status]}
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm" data-testid={`connector-status-${type}`}>
            Not connected yet
          </Badge>
        )}
      </div>

      {state ? (
        <div className="flex flex-col gap-1 text-caption text-content-tertiary">
          <span>{state.instance?.label ?? 'No instance configured'}</span>
          <span>
            {state.discoveredEntities.length} {state.discoveredEntities.length === 1 ? 'entity' : 'entities'} discovered
            · {formatLastSynced(state.lastSyncedAt)}
          </span>
        </div>
      ) : (
        <p className="text-caption text-content-tertiary">JARVIS Core contract for this connector is not available yet.</p>
      )}
    </Card>
  );
}
