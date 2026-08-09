import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowUp, Bot, Brain, Check, Cpu } from 'lucide-react';
import {
  Badge,
  PageHeader,
  StatCard,
  StateView,
  useAsync,
  WidgetGrid,
  WorkspaceContainer,
  type VoiceState,
} from '../design-system';
import { HeroOrb } from '../features/home/HeroOrb';
import { ActivityTimeline } from '../features/home/ActivityTimeline';
import {
  AutomationsWidget,
  ScheduleWidget,
  SmartHomeWidget,
  SystemWidget,
  TasksWidget,
} from '../features/home/HomeSections';
import { getHomeService, type HomeSnapshot } from '../features/home/homeService';

const FALLBACK_SUGGESTIONS = [
  'Summarize my unread emails',
  "What's on my schedule today?",
  'Draft the Mark III project plan',
];

const presenceToOrb: Record<HomeSnapshot['presence'], VoiceState> = {
  ready: 'idle',
  listening: 'listening',
  thinking: 'thinking',
  speaking: 'speaking',
  offline: 'offline',
};

export function Home() {
  const navigate = useNavigate();
  const ctx = useOutletContext<{ openVoice?: () => void }>() ?? {};
  const openVoice = ctx.openVoice ?? (() => {});
  const [prompt, setPrompt] = useState('');

  const home = useAsync<HomeSnapshot>((signal) => getHomeService().getSnapshot(signal));
  const snapshot = home.data;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const orbState: VoiceState =
    home.status === 'loading'
      ? 'thinking'
      : home.status === 'error'
        ? 'offline'
        : presenceToOrb[snapshot?.presence ?? 'ready'];

  const statusBadge =
    home.status === 'error' ? (
      <Badge variant="danger" dot>Offline</Badge>
    ) : home.status === 'loading' ? (
      <Badge variant="neutral" dot>Syncing…</Badge>
    ) : (
      <Badge variant="success" dot>All systems nominal</Badge>
    );

  const chips = snapshot?.suggestions ?? FALLBACK_SUGGESTIONS;

  const ask = (text: string) => {
    if (!text.trim()) return;
    navigate('/chat', { state: { prompt: text } });
  };

  return (
    <WorkspaceContainer
      header={
        <PageHeader
          title={`${greeting}, Tony`}
          description="Your AI Operating System is ready."
          actions={statusBadge}
        />
      }
    >
      <div className="flex flex-col gap-6 pb-24" data-testid="command-center">
        {/* Presence + quick entry */}
        <HeroOrb state={orbState} onActivate={openVoice} controls={false} />

        <div className="glass flex items-center gap-2 rounded-2xl p-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask(prompt)}
            placeholder="Ask Jarvis anything…"
            data-testid="home-ask-input"
            className="flex-1 bg-transparent px-3 py-2 text-body text-content placeholder:text-content-tertiary outline-none"
          />
          <button
            onClick={() => ask(prompt)}
            disabled={!prompt.trim()}
            aria-label="Ask Jarvis"
            data-testid="home-ask-send"
            className="flex size-9 items-center justify-center rounded-xl bg-accent text-content-on-accent transition-colors hover:bg-accent-hover disabled:opacity-40"
          >
            <ArrowUp className="size-[18px]" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => ask(c)}
              className="rounded-full border border-line bg-surface-base px-3.5 py-2 text-body-sm text-content-secondary transition-colors hover:border-line-strong hover:text-content"
            >
              {c}
            </button>
          ))}
        </div>

        {/* Data-backed region — loading / error handled by the shared StateView */}
        <StateView status={home.status} onRetry={home.reload} loadingLabel="Bringing systems online…">
          {snapshot && (
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Active agents" value={snapshot.system.activeAgents} icon={<Bot />} />
                <StatCard label="Tasks due" value={snapshot.system.tasksDue} icon={<Check />} />
                <StatCard label="Memory items" value={snapshot.system.memoryItems} icon={<Brain />} />
                <StatCard label="System health" value={snapshot.system.health} icon={<Cpu />} />
              </div>

              <WidgetGrid>
                <TasksWidget tasks={snapshot.tasks} />
                <ScheduleWidget events={snapshot.events} />
                <AutomationsWidget automations={snapshot.automations} />
                <SmartHomeWidget devices={snapshot.devices} />
                <SystemWidget system={snapshot.system} />
              </WidgetGrid>

              <ActivityTimeline items={snapshot.activity} />
            </div>
          )}
        </StateView>
      </div>
    </WorkspaceContainer>
  );
}
