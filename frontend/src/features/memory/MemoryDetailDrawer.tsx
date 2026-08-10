import { Trash2 } from 'lucide-react';
import { Badge, Button, Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, Spinner } from '../../design-system';
import type { Memory } from './memoryService';
import {
  formatMemoryDateTime,
  MEMORY_IMPORTANCE_BADGE_VARIANT,
  MEMORY_IMPORTANCE_LABEL,
  MEMORY_SOURCE_ICON,
  MEMORY_SOURCE_LABEL,
  MEMORY_TYPE_LABEL,
} from './memoryFormat';

export interface MemoryDetailDrawerProps {
  memory: Memory | null;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onForget: (memory: Memory) => void;
}

/** Read-only detail view for a single memory — no edit action (a memory
 *  represents something JARVIS itself formed; this frontend never lets a
 *  user hand-rewrite its content, see memoryService.ts's module doc). The
 *  only write action is Forget (delete), which opens a confirm dialog. */
export function MemoryDetailDrawer({ memory, loading, open, onOpenChange, onForget }: MemoryDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-lg overflow-y-auto" data-testid="memory-detail-drawer">
        {loading || !memory ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DrawerHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DrawerTitle>{MEMORY_TYPE_LABEL[memory.type]}</DrawerTitle>
                <Badge variant={MEMORY_IMPORTANCE_BADGE_VARIANT[memory.importance]} size="sm">
                  {MEMORY_IMPORTANCE_LABEL[memory.importance]} importance
                </Badge>
              </div>
              <DrawerDescription>{memory.content}</DrawerDescription>
            </DrawerHeader>

            <section className="grid grid-cols-2 gap-3 text-body-sm">
              <div className="rounded-lg border border-line-subtle p-3">
                <div className="flex items-center gap-1.5 text-caption text-content-tertiary">
                  {(() => {
                    const SourceIcon = MEMORY_SOURCE_ICON[memory.source];
                    return <SourceIcon className="size-3.5" aria-hidden="true" />;
                  })()}
                  Formed from
                </div>
                <div className="text-content">{MEMORY_SOURCE_LABEL[memory.source]}</div>
              </div>
              <div className="rounded-lg border border-line-subtle p-3">
                <div className="text-caption text-content-tertiary">Remembered</div>
                <div className="text-content">{formatMemoryDateTime(memory.createdAt)}</div>
              </div>
            </section>

            <p className="text-caption text-content-tertiary">
              Local development memory — simulated, not a real Core-formed memory.
            </p>

            <div className="mt-auto flex items-center border-t border-line-subtle pt-4">
              <Button
                variant="danger"
                leftIcon={<Trash2 className="size-4" />}
                onClick={() => onForget(memory)}
                data-testid="memory-forget-trigger"
              >
                Forget this memory
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
