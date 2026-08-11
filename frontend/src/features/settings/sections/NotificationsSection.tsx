import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Card, Label, Spinner, Switch, useToast } from '../../../design-system';
import { useSettings } from '../SettingsProvider';

/**
 * Notifications settings — the one real, `SettingsService`-backed
 * preference this page owns. Toggling it genuinely gates AppLayout's
 * NotificationCenter bell + unread badge (see AppLayout.tsx), verified in
 * the browser, not a fake toggle. No per-category toggles ("automation
 * alerts", "device alerts", etc.) are offered because no per-category
 * notification data model exists anywhere in this checkpoint — see
 * docs/CORE_SETTINGS_CONTRACT_REQUIRED.md.
 */
export function NotificationsSection() {
  const { settings, loading, update } = useSettings();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (enabled: boolean) => {
    setSaving(true);
    try {
      await update({ notificationsEnabled: enabled });
      toast({
        title: enabled ? 'Notifications enabled' : 'Notifications disabled',
        description: enabled
          ? "You'll see new alerts in the bell menu again."
          : 'The bell menu will stay empty until you turn this back on.',
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Could not update notification preference',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4" data-testid="settings-notifications">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 size-5 shrink-0 text-content-secondary" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="settings-notifications-enabled">Enable notifications</Label>
              <span className="text-body-sm text-content-secondary">
                Controls the notification bell in the top bar, including its unread badge. Turning this off
                does not change what Jarvis does — only what you're shown.
              </span>
            </div>
          </div>
          {loading || saving ? (
            <span data-testid="settings-notifications-spinner">
              <Spinner size="sm" />
            </span>
          ) : (
            <Switch
              id="settings-notifications-enabled"
              checked={settings.notificationsEnabled}
              onCheckedChange={handleToggle}
              disabled={saving}
              data-testid="settings-notifications-toggle"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
