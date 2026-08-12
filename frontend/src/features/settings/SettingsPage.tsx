import { useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import {
  Button,
  ModulePage,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from '../../design-system';
import { useSettings } from './SettingsProvider';
import { AppearanceSection } from './sections/AppearanceSection';
import { VoiceSection } from './sections/VoiceSection';
import { NotificationsSection } from './sections/NotificationsSection';
import { PrivacySection } from './sections/PrivacySection';
import { SmartHomeSection } from './sections/SmartHomeSection';
import { AiAppsSection } from './sections/AiAppsSection';
import { MemorySection } from './sections/MemorySection';
import { AgentsSection } from './sections/AgentsSection';
import { AutomationsSection } from './sections/AutomationsSection';
import { AboutSection } from './sections/AboutSection';
import { DeveloperSection } from './sections/DeveloperSection';

const TABS = [
  { value: 'appearance', label: 'Appearance' },
  { value: 'voice', label: 'Voice' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'smart-home', label: 'Smart Home' },
  { value: 'ai-apps', label: 'AI Apps' },
  { value: 'memory', label: 'Memory' },
  { value: 'agents', label: 'Agents' },
  { value: 'automations', label: 'Automations' },
  { value: 'about', label: 'About' },
  { value: 'developer', label: 'Developer' },
] as const;

/**
 * Settings (roadmap item 19, Phase 8 "System") — the user-facing
 * configuration surface for systems that already exist. It owns exactly
 * one real preference itself (`notificationsEnabled`, via
 * `SettingsService`) — everything else reads an existing feature's own
 * service directly and links to that feature's real page. See
 * docs/CORE_SETTINGS_CONTRACT_REQUIRED.md for the full scope rationale and
 * what a real Core contract would need to provide.
 */
export function SettingsPage() {
  const { service, reset } = useSettings();
  const { toast } = useToast();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await reset();
      toast({ title: 'Settings reset', description: 'Restored to their defaults.', variant: 'success' });
      setResetOpen(false);
    } catch (err) {
      toast({
        title: 'Could not reset settings',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <ModulePage
        title="Settings"
        description={
          service.ready
            ? 'Configure Jarvis. Appearance, voice, notifications, and privacy live here directly; Smart Home, AI Apps, Memory, Agents, and Automations link to their own pages.'
            : `${service.label} — settings are stored on this device only.`
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="size-4" />}
            onClick={() => setResetOpen(true)}
            data-testid="settings-reset-button"
          >
            Reset to defaults
          </Button>
        }
      >
        <div data-testid="settings-page" className="pb-16">
          <Tabs defaultValue="appearance">
            <div className="overflow-x-auto">
              <TabsList variant="line" className="flex-nowrap">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} data-testid={`settings-tab-${tab.value}`}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="appearance">
              <AppearanceSection />
            </TabsContent>
            <TabsContent value="voice">
              <VoiceSection />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationsSection />
            </TabsContent>
            <TabsContent value="privacy">
              <PrivacySection />
            </TabsContent>
            <TabsContent value="smart-home">
              <SmartHomeSection />
            </TabsContent>
            <TabsContent value="ai-apps">
              <AiAppsSection />
            </TabsContent>
            <TabsContent value="memory">
              <MemorySection />
            </TabsContent>
            <TabsContent value="agents">
              <AgentsSection />
            </TabsContent>
            <TabsContent value="automations">
              <AutomationsSection />
            </TabsContent>
            <TabsContent value="about">
              <AboutSection />
            </TabsContent>
            <TabsContent value="developer">
              <DeveloperSection />
            </TabsContent>
          </Tabs>
        </div>
      </ModulePage>

      <Modal open={resetOpen} onOpenChange={setResetOpen}>
        <ModalContent size="sm" data-testid="settings-reset-modal">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" aria-hidden="true" />
              Reset settings?
            </ModalTitle>
            <ModalDescription>
              This resets your notification preference back to its default (enabled). It does not affect
              appearance, Memory, Files, Tasks, Automations, Smart Home devices, or Agent history — those
              are managed on their own pages.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setResetOpen(false)} disabled={resetting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReset} loading={resetting} data-testid="settings-reset-confirm">
              Reset settings
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
