import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Cpu,
  Lightbulb,
  Lock,
  Speaker,
  Thermometer,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Button, Checkbox, Widget } from '../../design-system';
import { ListChecks } from 'lucide-react';
import type {
  AutomationSummary,
  CalendarEvent,
  SmartHomeDevice,
  SystemVitals,
  TaskItem,
} from './homeService';

const goAll = (navigate: ReturnType<typeof useNavigate>, path: string) => (
  <Button
    variant="ghost"
    size="sm"
    rightIcon={<ArrowRight className="size-3.5" />}
    onClick={() => navigate(path)}
    data-testid={`widget-go-${path.replace(/\W+/g, '')}`}
  >
    All
  </Button>
);

export function TasksWidget({ tasks }: { tasks: TaskItem[] }) {
  const navigate = useNavigate();
  return (
    <Widget title="Tasks" icon={<ListChecks />} action={goAll(navigate, '/tasks')}>
      <div className="flex flex-col gap-0.5" data-testid="home-tasks">
        {tasks.slice(0, 4).map((t) => (
          <label key={t.id} className="flex items-center gap-3 rounded-md px-1 py-1.5 hover:bg-surface-hover">
            <Checkbox checked={t.done} disabled />
            <span className={`flex-1 text-body-sm ${t.done ? 'text-content-tertiary line-through' : 'text-content'}`}>{t.label}</span>
            <span className="text-caption text-content-tertiary">{t.due}</span>
          </label>
        ))}
      </div>
    </Widget>
  );
}

const eventTone: Record<CalendarEvent['tone'], string> = {
  accent: 'var(--accent-solid)',
  success: 'var(--status-success)',
  warning: 'var(--status-warning)',
};

export function ScheduleWidget({ events }: { events: CalendarEvent[] }) {
  const navigate = useNavigate();
  return (
    <Widget title="Today's Schedule" action={goAll(navigate, '/calendar')}>
      <div className="flex flex-col gap-2.5" data-testid="home-schedule">
        {events.map((e) => (
          <div key={e.id} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-caption tabular-nums text-content-tertiary">{e.time}</span>
            <span className="size-2 shrink-0 rounded-full" style={{ background: eventTone[e.tone] }} />
            <span className="flex-1 truncate text-body-sm text-content">{e.label}</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

const autoTone: Record<AutomationSummary['status'], 'success' | 'neutral' | 'danger'> = {
  active: 'success',
  paused: 'neutral',
  error: 'danger',
};

export function AutomationsWidget({ automations }: { automations: AutomationSummary[] }) {
  const navigate = useNavigate();
  return (
    <Widget title="Automations" action={goAll(navigate, '/automations')}>
      <div className="flex flex-col gap-2" data-testid="home-automations">
        {automations.map((a) => (
          <div key={a.id} className="flex items-center gap-3">
            <span className="flex-1 truncate text-body-sm text-content">{a.name}</span>
            <span className="text-caption text-content-tertiary">{a.lastRun}</span>
            <Badge variant={autoTone[a.status]} size="sm" dot>{a.status}</Badge>
          </div>
        ))}
      </div>
    </Widget>
  );
}

const deviceIcon: Record<SmartHomeDevice['kind'], LucideIcon> = {
  light: Lightbulb,
  thermostat: Thermometer,
  lock: Lock,
  media: Speaker,
};

export function SmartHomeWidget({ devices }: { devices: SmartHomeDevice[] }) {
  const onCount = devices.filter((d) => d.on).length;
  return (
    <Widget
      title="Smart Home"
      action={<Badge variant="neutral" size="sm">{onCount} active</Badge>}
    >
      <div className="grid grid-cols-2 gap-2" data-testid="home-smarthome">
        {devices.map((d) => {
          const Icon = deviceIcon[d.kind];
          return (
            <div
              key={d.id}
              className={`flex items-center gap-2 rounded-lg border p-2.5 ${d.on ? 'border-accent-ring/40 bg-accent-soft/40' : 'border-line-subtle bg-surface-subtle'}`}
            >
              <Icon className={`size-4 shrink-0 ${d.on ? 'text-ai-aura' : 'text-content-tertiary'}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-caption font-medium text-content">{d.name}</span>
                <span className="block truncate text-[10px] text-content-tertiary">{d.value ?? d.room}</span>
              </span>
            </div>
          );
        })}
      </div>
    </Widget>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-caption text-content-secondary">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-subtle">
        <div className="h-full rounded-full bg-ai-aura" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function SystemWidget({ system }: { system: SystemVitals }) {
  return (
    <Widget title="System Status" icon={<Cpu />} action={<Badge variant="success" size="sm" dot>nominal</Badge>}>
      <div className="flex flex-col gap-3" data-testid="home-system">
        <Meter label="CPU" value={system.cpu} />
        <Meter label="Memory" value={system.memory} />
        <div className="flex justify-between text-caption text-content-secondary">
          <span>Active agents</span>
          <span className="tabular-nums text-content">{system.activeAgents}</span>
        </div>
        <div className="flex justify-between text-caption text-content-secondary">
          <span>Health</span>
          <span className="tabular-nums text-success">{system.health}</span>
        </div>
      </div>
    </Widget>
  );
}
