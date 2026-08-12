import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, ShieldAlert, TerminalSquare } from 'lucide-react';
import { Badge, Button, Card, Label, Spinner, StateView, Switch, useAsync, useToast } from '../../../design-system';
import { useSettings } from '../SettingsProvider';
import { getDiagnosticsService, type SystemComponentStatus } from '../../diagnostics/diagnosticsService';
import { SettingsSummaryCard } from './SettingsSummaryCard';

/**
 * Developer settings (roadmap item 21) — a presentation/control layer over
 * capabilities that already exist, per `docs/JARVIS_CORE_FRONTEND_MAPPING.md`'s
 * own row for Developer Mode ("Expose real diagnostics/events only"). This
 * tab does not create a second orchestration/permission/execution system,
 * does not invent a Core or MCP endpoint, and does not touch real hardware.
 * It owns exactly one real, `SettingsService`-backed preference —
 * `developerModeEnabled` — that gates whether `audience: 'developer'`
 * surfaces (currently just the Design System page) are discoverable via the
 * Command Palette (see AppLayout.tsx). The "System registry" card below
 * summarizes real data already computed by the Step 20 `DiagnosticsService`
 * seam and links to its real page, rather than re-deriving or duplicating
 * it (see docs/CORE_DIAGNOSTICS_CONTRACT_REQUIRED.md).
 */
export function DeveloperSection() {
  const { settings, loading, update } = useSettings();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const diagnosticsService = useMemo(() => getDiagnosticsService(), []);
  const registry = useAsync<SystemComponentStatus[]>((signal) => diagnosticsService.getSystemStatus(signal));
  const ready = (registry.data ?? []).filter((c) => c.ready).length;

  const handleToggle = async (enabled: boolean) => {
    setSaving(true);
    try {
      await update({ developerModeEnabled: enabled });
      toast({
        title: enabled ? 'Developer Mode enabled' : 'Developer Mode disabled',
        description: enabled
          ? 'Developer-only surfaces now appear in the Command Palette (⌘K).'
          : 'Developer-only surfaces are hidden from the Command Palette again.',
        variant: enabled ? 'ai' : 'info',
      });
    } catch (err) {
      toast({
        title: 'Could not update Developer Mode',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4" data-testid="settings-developer">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <TerminalSquare className="mt-0.5 size-5 shrink-0 text-content-secondary" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="settings-developer-mode-enabled">Developer Mode</Label>
              <span className="text-body-sm text-content-secondary">
                Reveals developer-only surfaces (currently the Design System page) in the Command Palette
                (⌘K). It never changes what JARVIS Core does, never bypasses a permission check, and never
                talks to real hardware — it only controls what's discoverable in this browser tab.
              </span>
            </div>
          </div>
          {loading || saving ? (
            <span data-testid="settings-developer-mode-spinner">
              <Spinner size="sm" />
            </span>
          ) : (
            <Switch
              id="settings-developer-mode-enabled"
              checked={settings.developerModeEnabled}
              onCheckedChange={handleToggle}
              disabled={saving}
              data-testid="settings-developer-mode-toggle"
            />
          )}
        </div>

        <div
          className="flex items-start gap-3 rounded-lg border border-line-subtle bg-surface-inset p-3"
          role="note"
        >
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-content-tertiary" aria-hidden="true" />
          <p className="text-caption text-content-tertiary">
            Every capability below reads real, already-built local frontend state — the same
            `DiagnosticsService` and design-system surfaces used elsewhere in this app. Nothing here is a
            live view into JARVIS Core, and nothing here is simulated as if it were.
          </p>
        </div>
      </Card>

      {settings.developerModeEnabled ? (
        <>
          <StateView status={registry.status} onRetry={registry.reload} compact>
            {registry.data && (
              <SettingsSummaryCard
                icon={ShieldAlert}
                title="System registry"
                description="Every feature's real backend and readiness, introspected honestly — never simulated."
                stats={[
                  { label: 'Components', value: registry.data.length },
                  { label: 'Ready', value: ready },
                ]}
                linkLabel="Open Diagnostics"
                onOpen={() => navigate('/diagnostics')}
                data-testid="settings-developer-diagnostics-summary"
              />
            )}
          </StateView>

          <Card className="flex flex-col gap-3 p-5" data-testid="settings-developer-design-system">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Code2 className="size-5 text-content-secondary" aria-hidden="true" />
                <span className="text-body font-semibold text-content">Design System</span>
              </div>
              <Badge variant="accent" size="sm">
                Now in ⌘K
              </Badge>
            </div>
            <p className="text-body-sm text-content-secondary">
              Browse every design-system primitive, pattern, and composite this frontend is built from.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={() => navigate('/design')}
              data-testid="settings-developer-open-design"
            >
              Open Design System
            </Button>
          </Card>
        </>
      ) : (
        <p className="text-body-sm text-content-tertiary" data-testid="settings-developer-disabled-hint">
          Turn on Developer Mode to reveal the Design System page in the Command Palette (⌘K) and see a
          quick link into Diagnostics' system registry.
        </p>
      )}
    </div>
  );
}
