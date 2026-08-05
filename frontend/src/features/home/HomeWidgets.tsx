import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Bot, Calendar, Clock, Plus, Sparkles, X } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Divider,
} from '../../design-system';

const schedule = [
  { time: '10:00', label: 'Project Meeting', tone: 'var(--accent-solid)' },
  { time: '13:00', label: 'Lunch with Sarah', tone: 'var(--status-success)' },
  { time: '16:00', label: 'Gym Session', tone: 'var(--status-warning)' },
];

const tasks = [
  { id: 1, label: 'Complete report', due: 'Today', done: false },
  { id: 2, label: 'Reply to emails', due: 'Today', done: false },
  { id: 3, label: 'Workout', due: 'Tomorrow', done: false },
];

const agents = [
  { id: 1, name: 'Research Agent', status: 'running' },
  { id: 2, name: 'Scheduler', status: 'idle' },
  { id: 3, name: 'File Indexer', status: 'running' },
];

function Widget({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-body-lg">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export function HomeWidgets() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4">
      <Widget
        title="Today's Schedule"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>
            Calendar
          </Button>
        }
      >
        <div className="flex flex-col gap-2.5">
          {schedule.map((s) => (
            <div key={s.time} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-caption tabular-nums text-content-tertiary">{s.time}</span>
              <span className="size-2 shrink-0 rounded-full" style={{ background: s.tone }} />
              <span className="flex-1 text-body-sm text-content">{s.label}</span>
            </div>
          ))}
          <Button variant="ghost" size="sm" leftIcon={<Plus className="size-3.5" />} className="mt-1 self-start">
            Add event
          </Button>
        </div>
      </Widget>

      <Widget
        title="Tasks"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')} rightIcon={<ArrowRight className="size-3.5" />}>
            All
          </Button>
        }
      >
        <div className="flex flex-col gap-1">
          {tasks.map((t) => (
            <label key={t.id} className="flex items-center gap-3 rounded-md px-1 py-1.5 hover:bg-surface-hover">
              <Checkbox />
              <span className="flex-1 text-body-sm text-content">{t.label}</span>
              <span className="text-caption text-content-tertiary">{t.due}</span>
            </label>
          ))}
        </div>
      </Widget>

      <Widget title="AI Suggestions">
        <div className="flex flex-col gap-2">
          <div className="rounded-lg border border-line-subtle bg-surface-subtle p-3">
            <p className="mb-2 flex items-start gap-2 text-body-sm text-content-secondary">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-ai-aura" />
              You have a 2-hour focus gap at 13:00 — block it for Mark III?
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => navigate('/chat')}>Block time</Button>
              <Button size="sm" variant="ghost" leftIcon={<X className="size-3.5" />}>Dismiss</Button>
            </div>
          </div>
        </div>
      </Widget>

      <Widget title="Recent Notifications">
        <div className="flex flex-col gap-1">
          {[
            { icon: <Bot className="size-4" />, text: 'Research Agent finished', time: '2m' },
            { icon: <Bell className="size-4" />, text: 'Memory synced (1.2k items)', time: '1h' },
            { icon: <Calendar className="size-4" />, text: 'Calendar updated', time: '3h' },
          ].map((n, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md px-1 py-1.5">
              <span className="text-content-tertiary">{n.icon}</span>
              <span className="flex-1 text-body-sm text-content">{n.text}</span>
              <span className="flex items-center gap-1 text-caption text-content-tertiary">
                <Clock className="size-3" />
                {n.time}
              </span>
            </div>
          ))}
        </div>
      </Widget>

      <Widget title="Active Agents">
        <div className="flex flex-col gap-2">
          {agents.map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <Avatar size="xs" fallback={a.name[0]} />
              <span className="flex-1 text-body-sm text-content">{a.name}</span>
              <Badge variant={a.status === 'running' ? 'success' : 'neutral'} size="sm" dot>
                {a.status}
              </Badge>
            </div>
          ))}
          <Divider className="my-1" />
          <Button variant="ghost" size="sm" onClick={() => navigate('/agents')} className="self-start">
            Manage agents
          </Button>
        </div>
      </Widget>
    </div>
  );
}
