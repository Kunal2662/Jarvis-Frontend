import { AlertTriangle, ArrowRight, Info, Lightbulb } from 'lucide-react';
import { Badge, Button, Card } from '../../design-system';
import type { Insight, InsightTone } from './intelligenceService';
import { CATEGORY_LABEL, TONE_BADGE_VARIANT, TONE_LABEL, formatDateTime } from './intelligenceFormat';

const TONE_ICON: Record<InsightTone, React.ReactNode> = {
  info: <Info />,
  suggestion: <Lightbulb />,
  warning: <AlertTriangle />,
};

export interface InsightCardProps {
  insight: Insight;
  onNavigate: (path: string) => void;
}

/** A single read-only, Core-surfaced insight. No dismiss/edit/create actions —
 *  Intelligence is a display/consume surface only. Tone is always paired with
 *  an icon + text label, never color alone. */
export function InsightCard({ insight, onNavigate }: InsightCardProps) {
  return (
    <Card variant="raised" className="flex flex-col gap-3 p-4" data-testid={`insight-card-${insight.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-body font-semibold text-content">{insight.title}</span>
          <span className="text-body-sm text-content-secondary">{insight.description}</span>
        </div>
        <span className="shrink-0 text-content-tertiary [&_svg]:size-5">{TONE_ICON[insight.tone]}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={TONE_BADGE_VARIANT[insight.tone]} size="sm">
          {TONE_ICON[insight.tone]}
          {TONE_LABEL[insight.tone]}
        </Badge>
        <Badge variant="outline" size="sm">{CATEGORY_LABEL[insight.category]}</Badge>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle pt-3 text-caption text-content-tertiary">
        <span>{formatDateTime(insight.generatedAt)}</span>
        {insight.relatedPath && (
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="size-3.5" />}
            onClick={() => onNavigate(insight.relatedPath!)}
            data-testid={`insight-navigate-${insight.id}`}
          >
            {insight.relatedLabel ?? 'View'}
          </Button>
        )}
      </div>
    </Card>
  );
}
