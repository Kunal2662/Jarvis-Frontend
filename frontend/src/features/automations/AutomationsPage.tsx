import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, PauseCircle, Plus, Workflow } from 'lucide-react';
import {
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModulePage,
  StatCard,
  useAsync,
  useToast,
  Widget,
  WidgetGrid,
} from '../../design-system';
import { getAutomationService, type Automation, type AutomationInput } from './automationService';
import { AutomationCard } from './AutomationCard';
import { AutomationDetailDrawer } from './AutomationDetailDrawer';
import { AutomationForm } from './AutomationForm';
import { formatDateTime } from './automationFormat';

type FormMode = { mode: 'create' } | { mode: 'edit'; automation: Automation } | null;

export function AutomationsPage() {
  const service = useMemo(() => getAutomationService(), []);
  const list = useAsync<Automation[]>((signal) => service.getAutomations(signal));
  const location = useLocation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [formState, setFormState] = useState<FormMode>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Automation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  // Local, patchable copy of the list. Mutations update this in place instead
  // of re-fetching, so a toggle/pause/delete never flashes the whole page back
  // to a full loading spinner (StateView swaps out all children on 'loading').
  const [automations, setAutomations] = useState<Automation[]>([]);
  useEffect(() => {
    if (list.data) setAutomations(list.data);
  }, [list.data]);

  // Deep-link support: Universal Search (Step 9) navigates here with
  // `state: { automationId }` when a search result is selected, so it can
  // open straight to that automation's detail drawer (mirrors ChatPage's
  // existing `location.state.prompt` consumption from the command
  // palette/voice). No-op when navigated to normally.
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    const automationId = (location.state as { automationId?: string } | null)?.automationId;
    if (!automationId || consumedDeepLink.current) return;
    if (automations.some((a) => a.id === automationId)) {
      consumedDeepLink.current = true;
      setSelectedId(automationId);
      window.history.replaceState({}, '');
    }
  }, [location.state, automations]);

  const selected = selectedId ? automations.find((a) => a.id === selectedId) ?? null : null;

  // Once the initial fetch has landed, treat "the local list is empty" (e.g.
  // after deleting the last automation) the same as the seam's own empty
  // state, without forcing a re-fetch.
  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && automations.length === 0
      ? 'empty'
      : list.status;

  const withPending = useCallback((id: string, fn: () => Promise<void>) => {
    setPendingIds((prev) => new Set(prev).add(id));
    return fn().finally(() => {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  }, []);

  const patchAutomation = (updated: Automation) =>
    setAutomations((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

  const handleToggle = (id: string, enabled: boolean) => {
    const automation = automations.find((a) => a.id === id);
    void withPending(id, async () => {
      try {
        const updated = await service.setEnabled(id, enabled);
        patchAutomation(updated);
        toast({
          title: enabled ? 'Automation enabled' : 'Automation disabled',
          description: automation?.name,
          variant: enabled ? 'success' : 'info',
        });
      } catch (err) {
        toast({
          title: 'Could not update automation',
          description: err instanceof Error ? err.message : String(err),
          variant: 'danger',
        });
      }
    });
  };

  const handlePauseResume = (automation: Automation) => {
    const action = automation.status === 'paused' ? 'resume' : 'pause';
    void withPending(automation.id, async () => {
      try {
        const updated = await service.pauseResume(automation.id, action);
        patchAutomation(updated);
        toast({
          title: action === 'resume' ? 'Automation resumed' : 'Automation paused',
          description: automation.name,
        });
      } catch (err) {
        toast({
          title: 'Could not update automation',
          description: err instanceof Error ? err.message : String(err),
          variant: 'danger',
        });
      }
    });
  };

  const handleCreate = () => setFormState({ mode: 'create' });
  const handleEdit = (automation: Automation) => setFormState({ mode: 'edit', automation });

  const handleFormSubmit = async (input: AutomationInput) => {
    setFormSubmitting(true);
    try {
      if (formState?.mode === 'edit') {
        const updated = await service.updateAutomation(formState.automation.id, input);
        patchAutomation(updated);
        toast({ title: 'Automation updated', description: input.name, variant: 'success' });
      } else {
        const created = await service.createAutomation(input);
        setAutomations((prev) => [created, ...prev]);
        toast({ title: 'Automation created', description: input.name, variant: 'success' });
      }
      setFormState(null);
    } catch (err) {
      toast({
        title: 'Could not save automation',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await service.deleteAutomation(deleteTarget.id);
      setAutomations((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast({ title: 'Automation deleted', description: deleteTarget.name });
      setDeleteTarget(null);
      if (selectedId === deleteTarget.id) setSelectedId(null);
    } catch (err) {
      toast({
        title: 'Could not delete automation',
        description: err instanceof Error ? err.message : String(err),
        variant: 'danger',
      });
    } finally {
      setDeleting(false);
    }
  };

  const counts = {
    total: automations.length,
    active: automations.filter((a) => a.status === 'active').length,
    paused: automations.filter((a) => a.status === 'paused').length,
    failed: automations.filter((a) => a.status === 'failed').length,
  };

  const upcoming = automations
    .filter((a) => a.enabled && a.nextRun)
    .sort((a, b) => new Date(a.nextRun!).getTime() - new Date(b.nextRun!).getTime())
    .slice(0, 5);

  return (
    <>
      <ModulePage
        title="Automations"
        description={
          service.ready
            ? 'Rules that trigger actions automatically. Data shown here is local to this frontend session.'
            : `${service.label} — automation data is not connected yet.`
        }
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={handleCreate} data-testid="automation-create">
            New automation
          </Button>
        }
        status={pageStatus}
        onRetry={list.reload}
        error={list.error}
        stateProps={
          pageStatus === 'empty'
            ? {
                title: 'No automations yet',
                description: 'Create your first automation to have Jarvis act on triggers automatically.',
                action: (
                  <Button
                    leftIcon={<Plus className="size-4" />}
                    onClick={handleCreate}
                    data-testid="automation-create-empty"
                  >
                    New automation
                  </Button>
                ),
              }
            : undefined
        }
      >
        <div className="flex flex-col gap-6 pb-16" data-testid="automations-page">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total" value={counts.total} icon={<Workflow />} />
            <StatCard label="Active" value={counts.active} icon={<CheckCircle2 />} />
            <StatCard label="Paused" value={counts.paused} icon={<PauseCircle />} />
            <StatCard label="Failed" value={counts.failed} icon={<AlertTriangle />} />
          </div>

          <WidgetGrid className="sm:grid-cols-1 xl:grid-cols-1">
            <Widget
              title="Upcoming executions"
              icon={<Clock />}
              status={upcoming.length === 0 ? 'empty' : 'ready'}
              emptyTitle="Nothing scheduled"
              emptyDescription="Enable an automation with a schedule trigger to see it here."
            >
              <ul className="flex flex-col divide-y divide-line-subtle">
                {upcoming.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-body-sm">
                    <button
                      onClick={() => setSelectedId(a.id)}
                      className="truncate text-left text-content hover:underline"
                    >
                      {a.name}
                    </button>
                    <span className="shrink-0 text-caption text-content-tertiary">{formatDateTime(a.nextRun)}</span>
                  </li>
                ))}
              </ul>
            </Widget>
          </WidgetGrid>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {automations.map((a) => (
              <AutomationCard
                key={a.id}
                automation={a}
                onOpen={setSelectedId}
                onToggle={handleToggle}
                toggling={pendingIds.has(a.id)}
              />
            ))}
          </div>
        </div>
      </ModulePage>

      <AutomationDetailDrawer
        automation={selected}
        open={selectedId !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onEdit={(automation) => {
          setSelectedId(null);
          handleEdit(automation);
        }}
        onDelete={(automation) => setDeleteTarget(automation)}
        onPauseResume={handlePauseResume}
        busy={selected ? pendingIds.has(selected.id) : false}
      />

      <Modal open={formState !== null} onOpenChange={(open) => !open && setFormState(null)}>
        <ModalContent size="lg" data-testid="automation-form-modal">
          <ModalHeader>
            <ModalTitle>{formState?.mode === 'edit' ? 'Edit automation' : 'New automation'}</ModalTitle>
            <ModalDescription>
              Configure the trigger, conditions and actions for this automation.
            </ModalDescription>
          </ModalHeader>
          <AutomationForm
            initial={formState?.mode === 'edit' ? formState.automation : undefined}
            submitLabel={formState?.mode === 'edit' ? 'Save changes' : 'Create automation'}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormState(null)}
            submitting={formSubmitting}
          />
        </ModalContent>
      </Modal>

      <Modal open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <ModalContent size="sm" data-testid="automation-delete-modal">
          <ModalHeader>
            <ModalTitle>Delete automation?</ModalTitle>
            <ModalDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" will be permanently deleted. This cannot be undone.`
                : ''}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete} data-testid="automation-delete-confirm">
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
