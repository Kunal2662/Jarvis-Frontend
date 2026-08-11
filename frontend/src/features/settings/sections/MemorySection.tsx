import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { StateView, useAsync } from '../../../design-system';
import { getMemoryService, type Memory } from '../../memory/memoryService';
import { SettingsSummaryCard } from './SettingsSummaryCard';

/**
 * Memory settings — a read-only summary over the existing `MemoryService`
 * seam (Step 16). No create/edit/bulk-delete UI is built here — recall and
 * forget stay exclusively on MemoryPage; this tab only summarizes and
 * links there (see docs/CORE_SETTINGS_CONTRACT_REQUIRED.md).
 */
export function MemorySection() {
  const navigate = useNavigate();
  const service = useMemo(() => getMemoryService(), []);
  const list = useAsync<Memory[]>((signal) => service.getMemories(signal));

  return (
    <div className="flex flex-col gap-4" data-testid="settings-memory">
      <StateView status={list.status} onRetry={list.reload} compact>
        {list.data && (
          <SettingsSummaryCard
            icon={Brain}
            title="Memory"
            description="What Jarvis has formed from your conversations so far."
            stats={[{ label: 'Memories', value: list.data.length }]}
            linkLabel="Open Memory"
            onOpen={() => navigate('/memory')}
            data-testid="settings-memory-summary"
          />
        )}
      </StateView>
    </div>
  );
}
