import {
  Badge,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Spinner,
} from '../../design-system';
import type { KnowledgeItem } from './knowledgeService';
import { KnowledgeSourceBadge } from './KnowledgeSourceBadge';
import { formatDateTime } from './knowledgeFormat';

export interface KnowledgeDetailDrawerProps {
  item: KnowledgeItem | null;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Read-only detail view for a single knowledge item — no edit/delete actions
 *  (Knowledge is a browse/consume surface; Core owns ingestion). */
export function KnowledgeDetailDrawer({ item, loading, open, onOpenChange }: KnowledgeDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full max-w-lg overflow-y-auto" data-testid="knowledge-detail-drawer">
        {loading || !item ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DrawerHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DrawerTitle>{item.title}</DrawerTitle>
                <KnowledgeSourceBadge sourceType={item.sourceType} />
              </div>
              <DrawerDescription>{item.snippet}</DrawerDescription>
            </DrawerHeader>

            <div className="rounded-lg border border-line-subtle p-3 text-body-sm">
              <div className="text-caption text-content-tertiary">Last updated</div>
              <div className="text-content">{formatDateTime(item.updatedAt)}</div>
            </div>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Content</h3>
              <p className="whitespace-pre-line rounded-lg border border-line-subtle p-3 text-body-sm text-content-secondary">
                {item.content}
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-body-sm font-semibold text-content">Tags</h3>
              {item.tags.length === 0 ? (
                <p className="text-caption text-content-tertiary">No tags.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
