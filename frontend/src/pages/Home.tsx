import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowUp, Bot, Brain, Check, Cpu } from 'lucide-react';
import {
  Badge,
  PageHeader,
  StatCard,
  WorkspaceContainer,
} from '../design-system';
import { HeroOrb } from '../features/home/HeroOrb';
import { ActivityTimeline } from '../features/home/ActivityTimeline';
import { HomeWidgets } from '../features/home/HomeWidgets';

const chips = [
  'Summarize my emails',
  "What's on my schedule?",
  'Draft the Mark III plan',
  'Show my tasks',
];

export function Home() {
  const navigate = useNavigate();
  const { openVoice } = useOutletContext<{ openVoice: () => void }>();
  const [prompt, setPrompt] = useState('');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

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
          actions={<Badge variant="success" dot>All systems nominal</Badge>}
        />
      }
    >
      <div className="grid grid-cols-1 gap-6 pb-24 xl:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-6">
          <HeroOrb onActivate={openVoice} />

          {/* Ask bar */}
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

          {/* Vitals */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active agents" value={12} icon={<Bot />} delta={{ value: '+3', direction: 'up' }} />
            <StatCard label="Tasks due" value={7} icon={<Check />} delta={{ value: '-2', direction: 'down' }} />
            <StatCard label="Memory items" value="1.2k" icon={<Brain />} delta={{ value: '+128', direction: 'up' }} />
            <StatCard label="System health" value="99.9%" icon={<Cpu />} delta={{ value: '+0.1', direction: 'up' }} />
          </div>

          <ActivityTimeline />
        </div>

        {/* Right panel */}
        <div className="min-w-0">
          <HomeWidgets />
        </div>
      </div>
    </WorkspaceContainer>
  );
}
