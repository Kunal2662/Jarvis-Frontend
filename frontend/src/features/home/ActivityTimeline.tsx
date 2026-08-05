import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Brain, MessageSquare, Network, Workflow, type LucideIcon } from 'lucide-react';
import { Badge, Card, CardHeader, CardTitle, useReducedMotion } from '../../design-system';

type Kind = 'conversation' | 'memory' | 'automation' | 'agent' | 'knowledge';

interface Activity {
  id: string;
  kind: Kind;
  text: string;
  time: string;
}

const meta: Record<Kind, { icon: LucideIcon; label: string; tone: string }> = {
  conversation: { icon: MessageSquare, label: 'Chat', tone: 'text-info' },
  memory: { icon: Brain, label: 'Memory', tone: 'text-ai-aura' },
  automation: { icon: Workflow, label: 'Automation', tone: 'text-success' },
  agent: { icon: Bot, label: 'Agent', tone: 'text-accent-text' },
  knowledge: { icon: Network, label: 'Knowledge', tone: 'text-warning' },
};

const pool: Omit<Activity, 'id' | 'time'>[] = [
  { kind: 'agent', text: 'Research Agent completed a market brief' },
  { kind: 'memory', text: 'Saved 12 highlights from “Mark III specs.pdf”' },
  { kind: 'automation', text: 'Morning digest automation ran successfully' },
  { kind: 'conversation', text: 'You asked Jarvis to summarize your inbox' },
  { kind: 'knowledge', text: 'Linked “Pepper Potts” to 3 new projects' },
  { kind: 'agent', text: 'Scheduler proposed 2 focus blocks for today' },
  { kind: 'memory', text: 'Consolidated 48 notes into long-term memory' },
  { kind: 'knowledge', text: 'Indexed 1,204 items into the knowledge graph' },
];

let seq = 0;
const now = () =>
  new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

export function ActivityTimeline() {
  const reduced = useReducedMotion();
  const initial = useMemo<Activity[]>(
    () => pool.slice(0, 5).map((p, i) => ({ ...p, id: `init-${i}`, time: now() })),
    [],
  );
  const [items, setItems] = useState<Activity[]>(initial);

  useEffect(() => {
    const t = setInterval(() => {
      const p = pool[Math.floor(Math.random() * pool.length)];
      setItems((prev) => [{ ...p, id: `a-${seq++}`, time: now() }, ...prev].slice(0, 8));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-body-lg">AI Timeline</CardTitle>
        <Badge variant="success" dot size="sm">live</Badge>
      </CardHeader>
      <div className="flex flex-col px-2 pb-3" data-testid="activity-timeline">
        <AnimatePresence initial={false}>
          {items.map((a) => {
            const m = meta[a.kind];
            const Icon = m.icon;
            return (
              <motion.div
                key={a.id}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-hover"
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-subtle ${m.tone}`}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-body-sm text-content">{a.text}</span>
                <span className="shrink-0 text-caption tabular-nums text-content-tertiary">{a.time}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
}
