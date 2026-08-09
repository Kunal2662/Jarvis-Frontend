import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Brain, Home as HomeIcon, MessageSquare, Network, Workflow, type LucideIcon } from 'lucide-react';
import { Badge, Card, CardHeader, CardTitle, useReducedMotion } from '../../design-system';
import type { ActivityEntry, ActivityKind } from './homeService';

const meta: Record<ActivityKind, { icon: LucideIcon; tone: string }> = {
  conversation: { icon: MessageSquare, tone: 'text-info' },
  memory: { icon: Brain, tone: 'text-ai-aura' },
  automation: { icon: Workflow, tone: 'text-success' },
  agent: { icon: Bot, tone: 'text-accent-text' },
  knowledge: { icon: Network, tone: 'text-warning' },
  'smart-home': { icon: HomeIcon, tone: 'text-info' },
};

/** Recent-activity feed. Presentation only — data is supplied by the Home service. */
export function ActivityTimeline({ items }: { items: ActivityEntry[] }) {
  const reduced = useReducedMotion();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-body-lg">AI Timeline</CardTitle>
        <Badge variant="success" dot size="sm">live</Badge>
      </CardHeader>
      <div className="flex flex-col px-2 pb-3" data-testid="activity-timeline">
        <AnimatePresence initial={false}>
          {items.map((a, i) => {
            const m = meta[a.kind];
            const Icon = m.icon;
            return (
              <motion.div
                key={a.id}
                initial={reduced ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : i * 0.04, type: 'spring', stiffness: 420, damping: 34 }}
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
