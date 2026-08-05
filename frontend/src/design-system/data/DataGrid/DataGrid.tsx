import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table/Table';
import { cn } from '../../lib/cn';

export interface Column<T> {
  key: keyof T & string;
  header: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataGridProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedId?: string;
  className?: string;
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null;

const alignClass = { left: 'text-left', right: 'text-right tabular-nums', center: 'text-center' };

export function DataGrid<T extends Record<string, unknown>>({
  columns,
  data,
  getRowId,
  onRowClick,
  selectedId,
  className,
}: DataGridProps<T>) {
  const [sort, setSort] = useState<SortState>(null);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const av = a[col.key];
      const bv = b[col.key];
      if (av === bv) return 0;
      const res = (av as number | string) > (bv as number | string) ? 1 : -1;
      return sort.dir === 'asc' ? res : -res;
    });
  }, [data, sort, columns]);

  const toggleSort = (key: string) =>
    setSort((prev) =>
      prev?.key === key
        ? prev.dir === 'asc'
          ? { key, dir: 'desc' }
          : null
        : { key, dir: 'asc' },
    );

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col) => (
            <TableHead key={col.key} className={cn(alignClass[col.align ?? 'left'])} style={{ width: col.width }}>
              {col.sortable ? (
                <button
                  onClick={() => toggleSort(col.key)}
                  className="inline-flex items-center gap-1 text-overline uppercase text-content-tertiary transition-colors hover:text-content"
                >
                  {col.header}
                  {sort?.key === col.key ? (
                    sort.dir === 'asc' ? (
                      <ArrowUp className="size-3" />
                    ) : (
                      <ArrowDown className="size-3" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-3 opacity-50" />
                  )}
                </button>
              ) : (
                col.header
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row) => {
          const id = getRowId(row);
          return (
            <TableRow
              key={id}
              data-selected={id === selectedId}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer' : undefined}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={cn(alignClass[col.align ?? 'left'])}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
