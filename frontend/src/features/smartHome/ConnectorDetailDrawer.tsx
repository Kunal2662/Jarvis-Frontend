import { useState } from 'react';
import { RefreshCw, RotateCcw, Unplug } from 'lucide-react';
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  FormField,
  Input,
  Spinner,
} from '../../design-system';
import type { ConnectorSettingsInput, ConnectorState, ConnectorType } from './smartHomeIntegrationService';
import {
  CONNECTOR_STATUS_BADGE_VARIANT,
  CONNECTOR_STATUS_LABEL,
  CONNECTOR_TYPE_ICON,
  CONNECTOR_TYPE_LABEL,
  CREDENTIAL_STATE_ICON,
  CREDENTIAL_STATE_LABEL,
  formatDiagnosticTimestamp,
  formatLastSynced,
} from './smartHomeIntegrationFormat';

export interface ConnectorDetailDrawerProps {
  type: ConnectorType | null;
  /** `null` while loading, or when the backend for this connector isn't
   *  ready yet (Core contract pending). */
  state: ConnectorState | null;
  notReady: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (input: ConnectorSettingsInput) => void | Promise<void>;
  onDisconnect: () => void | Promise<void>;
  onReconnect: () => void | Promise<void>;
  onSync: () => void | Promise<void>;
  busy: 'connect' | 'disconnect' | 'reconnect' | 'sync' | null;
}

/**
 * Connector status/configuration/diagnostics drawer (roadmap item 15) — this
 * is deliberately NOT a device control surface. It never sends a device
 * command, and it never displays a raw credential value: the "secret" field
 * below is write-only (typed, submitted, and immediately forgotten by this
 * component too — never read back after `onConnect` resolves).
 */
export function ConnectorDetailDrawer({
  type,
  state,
  notReady,
  open,
  onOpenChange,
  onConnect,
  onDisconnect,
  onReconnect,
  onSync,
  busy,
}: ConnectorDetailDrawerProps) {
  const [endpoint, setEndpoint] = useState('');
  const [secret, setSecret] = useState('');
  const [formError, setFormError] = useState<string | undefined>();

  if (!type) return null;
  const TypeIcon = CONNECTOR_TYPE_ICON[type];
  const typeLabel = CONNECTOR_TYPE_LABEL[type];
  const endpointLabel = type === 'home_assistant' ? 'Instance URL' : 'Broker host';
  const secretLabel = type === 'home_assistant' ? 'Long-lived access token' : 'Broker password';

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!endpoint.trim() || !secret.trim()) {
      setFormError('Both fields are required.');
      return;
    }
    setFormError(undefined);
    void onConnect({ endpoint: endpoint.trim(), secret });
    // The secret never lingers in this component's own state either.
    setSecret('');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-lg overflow-y-auto" data-testid="connector-detail-drawer">
        <DrawerHeader>
          <div className="flex flex-wrap items-center gap-2">
            <TypeIcon className="size-5 shrink-0 text-content-secondary" aria-hidden="true" />
            <DrawerTitle>{typeLabel}</DrawerTitle>
            {state && (
              <Badge variant={CONNECTOR_STATUS_BADGE_VARIANT[state.status]} size="sm">
                {CONNECTOR_STATUS_LABEL[state.status]}
              </Badge>
            )}
          </div>
          <DrawerDescription>
            Connector status, configuration, and diagnostics only — device control stays on the Smart Home Command
            Center.
          </DrawerDescription>
        </DrawerHeader>

        {notReady || !state ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
            {!state && !notReady ? (
              <Spinner size="lg" />
            ) : (
              <p className="max-w-xs text-body-sm text-content-tertiary">
                JARVIS Core's {typeLabel} contract is not available yet — this connector cannot be configured until
                then. See docs/CORE_HOME_ASSISTANT_MQTT_CONTRACT_REQUIRED.md.
              </p>
            )}
          </div>
        ) : (
          <>
            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Credential</h3>
              <div className="flex items-center gap-2 rounded-lg border border-line-subtle p-2.5 text-body-sm">
                {(() => {
                  const CredIcon = CREDENTIAL_STATE_ICON[state.credentialState];
                  return <CredIcon className="size-4 shrink-0 text-content-tertiary" aria-hidden="true" />;
                })()}
                <span className="text-content">{CREDENTIAL_STATE_LABEL[state.credentialState]}</span>
              </div>
            </section>

            {(state.status === 'not_configured' || state.status === 'disconnected' || state.status === 'error') && (
              <section className="flex flex-col gap-3 rounded-lg border border-line-subtle p-3">
                <h3 className="text-body-sm font-semibold text-content">
                  {state.status === 'not_configured' ? 'Connect' : 'Reconfigure'}
                </h3>
                <p className="text-caption text-content-tertiary">
                  Simulated only — no real {typeLabel} handshake happens here. The {secretLabel.toLowerCase()} is never
                  stored or displayed after connecting.
                </p>
                <form onSubmit={handleConnectSubmit} className="flex flex-col gap-3">
                  <FormField label={endpointLabel} required>
                    {(p) => (
                      <Input
                        {...p}
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        placeholder={type === 'home_assistant' ? 'http://homeassistant.local:8123' : 'mqtt.local:1883'}
                        disabled={busy === 'connect'}
                        data-testid={`connector-endpoint-input-${type}`}
                      />
                    )}
                  </FormField>
                  <FormField label={secretLabel} required>
                    {(p) => (
                      <Input
                        {...p}
                        type="password"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        disabled={busy === 'connect'}
                        data-testid={`connector-secret-input-${type}`}
                      />
                    )}
                  </FormField>
                  {formError && (
                    <p role="alert" className="text-caption text-danger">
                      {formError}
                    </p>
                  )}
                  <Button type="submit" loading={busy === 'connect'} data-testid={`connector-connect-submit-${type}`}>
                    {state.status === 'error' || state.status === 'disconnected' ? 'Reconnect' : 'Connect'}
                  </Button>
                </form>
              </section>
            )}

            {state.status === 'connected' && (
              <section className="flex flex-col gap-3 rounded-lg border border-line-subtle p-3">
                <h3 className="text-body-sm font-semibold text-content">Instance</h3>
                <p className="text-body-sm text-content-secondary">{state.instance?.label ?? 'Unknown'}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    leftIcon={<RefreshCw className="size-4" />}
                    loading={busy === 'sync'}
                    onClick={() => void onSync()}
                    data-testid={`connector-sync-${type}`}
                  >
                    Sync entities
                  </Button>
                  <Button
                    variant="ghost"
                    leftIcon={<Unplug className="size-4" />}
                    loading={busy === 'disconnect'}
                    onClick={() => void onDisconnect()}
                    data-testid={`connector-disconnect-${type}`}
                  >
                    Disconnect
                  </Button>
                </div>
              </section>
            )}

            {(state.status === 'disconnected' || state.status === 'error') && (
              <Button
                variant="secondary"
                leftIcon={<RotateCcw className="size-4" />}
                loading={busy === 'reconnect'}
                onClick={() => void onReconnect()}
                data-testid={`connector-reconnect-${type}`}
              >
                Reconnect
              </Button>
            )}

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">
                Discovered entities <span className="text-content-tertiary">(preview, not yet added)</span>
              </h3>
              <p className="text-caption text-content-tertiary">
                Last synced: {formatLastSynced(state.lastSyncedAt)}. Syncing never adds these to the Smart Home Command
                Center automatically.
              </p>
              {state.discoveredEntities.length === 0 ? (
                <p className="text-caption text-content-tertiary">No entities discovered yet.</p>
              ) : (
                <ul className="flex flex-col gap-1.5" data-testid={`connector-entities-${type}`}>
                  {state.discoveredEntities.map((entity) => (
                    <li
                      key={entity.id}
                      className="flex items-center justify-between rounded-lg border border-line-subtle p-2.5 text-body-sm"
                    >
                      <span className="text-content">{entity.name}</span>
                      <span className="text-caption text-content-tertiary">
                        {entity.roomName ? `${entity.roomName} · ` : ''}
                        {entity.type}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Diagnostics</h3>
              {state.diagnostics.length === 0 ? (
                <p className="text-caption text-content-tertiary">No activity yet.</p>
              ) : (
                <ul className="flex flex-col gap-1" data-testid={`connector-diagnostics-${type}`}>
                  {state.diagnostics.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-2 text-caption">
                      <span
                        className={
                          entry.level === 'error'
                            ? 'text-danger'
                            : entry.level === 'warning'
                              ? 'text-warning'
                              : 'text-content-tertiary'
                        }
                      >
                        {formatDiagnosticTimestamp(entry.timestamp)}
                      </span>
                      <span className="text-content-secondary">{entry.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
