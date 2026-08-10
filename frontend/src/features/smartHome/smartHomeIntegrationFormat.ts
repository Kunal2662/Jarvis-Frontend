import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  PlugZap,
  Radio,
  Router,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ShieldX,
  type LucideIcon,
} from 'lucide-react';
import type { ConnectorStatus, ConnectorType, CredentialState } from './smartHomeIntegrationService';

/** Shared, presentation-only formatting helpers for the Home Assistant/MQTT
 *  integration UI (roadmap item 15) — mirrors smartHomeFormat.ts. Every
 *  status is always shown as icon + text, never color alone. */

export const CONNECTOR_TYPE_LABEL: Record<ConnectorType, string> = {
  home_assistant: 'Home Assistant',
  mqtt: 'MQTT',
};

/** Same mapping smartHomeFormat.ts's `connectorIcon` uses for the per-device
 *  connector badge (Step 14) — kept visually consistent with this page. */
export const CONNECTOR_TYPE_ICON: Record<ConnectorType, LucideIcon> = {
  home_assistant: Router,
  mqtt: Radio,
};

export const CONNECTOR_STATUS_LABEL: Record<ConnectorStatus, string> = {
  not_configured: 'Not configured',
  disconnected: 'Disconnected',
  connecting: 'Connecting…',
  connected: 'Connected',
  error: 'Error',
};

export const CONNECTOR_STATUS_ICON: Record<ConnectorStatus, LucideIcon> = {
  not_configured: PlugZap,
  disconnected: PlugZap,
  connecting: Loader2,
  connected: CheckCircle2,
  error: AlertTriangle,
};

export const CONNECTOR_STATUS_BADGE_VARIANT: Record<
  ConnectorStatus,
  'success' | 'warning' | 'danger' | 'neutral'
> = {
  not_configured: 'neutral',
  disconnected: 'neutral',
  connecting: 'warning',
  connected: 'success',
  error: 'danger',
};

export const CREDENTIAL_STATE_LABEL: Record<CredentialState, string> = {
  not_configured: 'Not configured',
  configured: 'Configured',
  invalid: 'Invalid',
  unavailable: 'Unavailable',
};

export const CREDENTIAL_STATE_ICON: Record<CredentialState, LucideIcon> = {
  not_configured: ShieldQuestion,
  configured: ShieldCheck,
  invalid: ShieldX,
  unavailable: ShieldAlert,
};

export function formatLastSynced(iso?: string): string {
  if (!iso) return 'Never synced';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDiagnosticTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}
