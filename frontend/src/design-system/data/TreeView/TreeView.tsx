import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
}

export interface TreeViewProps {
  nodes: TreeNode[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  defaultExpanded?: string[];
  className?: string;
}

export function TreeView({ nodes, selectedId, onSelect, defaultExpanded = [], className }: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ul role="tree" className={cn('flex flex-col', className)}>
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          toggle={toggle}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

function TreeItem({
  node,
  depth,
  expanded,
  toggle,
  selectedId,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  toggle: (id: string) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const hasChildren = !!node.children?.length;
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isOpen : undefined} aria-selected={isSelected}>
      <div
        onClick={() => {
          onSelect?.(node.id);
          if (hasChildren) toggle(node.id);
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(node.id);
            if (hasChildren) toggle(node.id);
          }
        }}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        className={cn(
          'flex cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-2 text-body-sm outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-ring',
          isSelected ? 'bg-surface-selected text-content' : 'text-content-secondary',
        )}
      >
        <ChevronRight
          className={cn(
            'size-4 shrink-0 text-content-tertiary transition-transform duration-fast',
            hasChildren ? (isOpen ? 'rotate-90' : '') : 'opacity-0',
          )}
        />
        {node.icon && <span className="shrink-0 [&_svg]:size-4">{node.icon}</span>}
        <span className="truncate">{node.label}</span>
      </div>
      {hasChildren && isOpen && (
        <ul role="group">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
