import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Button, Card } from '../../../design-system';

export interface SettingsSummaryStat {
  label: string;
  value: string | number;
}

export interface SettingsSummaryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  stats: SettingsSummaryStat[];
  linkLabel: string;
  onOpen: () => void;
  'data-testid'?: string;
}

/**
 * Shared read-only "configure this via its own page" card, reused by every
 * Settings tab that fronts an already-built feature (Smart Home, AI Apps,
 * Memory, Agents, Automations) — per docs/CORE_SETTINGS_CONTRACT_REQUIRED.md,
 * Settings never duplicates another feature's catalog or controls, it only
 * summarizes real data from that feature's own service and links to the
 * real page.
 */
export function SettingsSummaryCard({
  icon: Icon,
  title,
  description,
  stats,
  linkLabel,
  onOpen,
  'data-testid': testId,
}: SettingsSummaryCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-5" data-testid={testId}>
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-inset text-content-secondary">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-body font-semibold text-content">{title}</span>
          <span className="text-body-sm text-content-secondary">{description}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5 rounded-lg bg-surface-inset px-3 py-2">
            <span className="font-display text-h3 tabular-nums text-content">{stat.value}</span>
            <span className="text-caption text-content-tertiary">{stat.label}</span>
          </div>
        ))}
      </div>

      <Button variant="secondary" size="sm" className="self-start" onClick={onOpen} rightIcon={<ArrowRight className="size-4" />}>
        {linkLabel}
      </Button>
    </Card>
  );
}
