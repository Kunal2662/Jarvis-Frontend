import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Info, Lightbulb, Sparkles } from 'lucide-react';
import { ModulePage, StatCard, useAsync } from '../../design-system';
import { getIntelligenceService, type Insight } from './intelligenceService';
import { InsightCard } from './InsightCard';

export function IntelligencePage() {
  const service = useMemo(() => getIntelligenceService(), []);
  const list = useAsync<Insight[]>((signal) => service.getInsights(signal));
  const navigate = useNavigate();

  const insights = list.data ?? [];

  const pageStatus = !service.ready
    ? 'unavailable'
    : list.status === 'ready' && insights.length === 0
      ? 'empty'
      : list.status;

  const counts = {
    total: insights.length,
    info: insights.filter((i) => i.tone === 'info').length,
    suggestion: insights.filter((i) => i.tone === 'suggestion').length,
    warning: insights.filter((i) => i.tone === 'warning').length,
  };

  return (
    <ModulePage
      title="Intelligence"
      description={
        service.ready
          ? 'Contextual insights Jarvis has surfaced. Read-only — data shown here is local to this frontend session.'
          : `${service.label} — intelligence data is not connected yet.`
      }
      status={pageStatus}
      onRetry={list.reload}
      error={list.error}
      stateProps={
        pageStatus === 'empty'
          ? {
              title: 'No insights yet',
              description: 'Jarvis has not surfaced any contextual insights yet. Check back later.',
            }
          : undefined
      }
    >
      <div className="flex flex-col gap-6 pb-16" data-testid="intelligence-page">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={counts.total} icon={<Sparkles />} />
          <StatCard label="Info" value={counts.info} icon={<Info />} />
          <StatCard label="Suggestions" value={counts.suggestion} icon={<Lightbulb />} />
          <StatCard label="Attention" value={counts.warning} icon={<AlertTriangle />} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="insight-list">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} onNavigate={navigate} />
          ))}
        </div>
      </div>
    </ModulePage>
  );
}
