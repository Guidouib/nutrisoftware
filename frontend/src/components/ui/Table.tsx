import { type ReactNode, useState } from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T, idx: number) => ReactNode
  sortable?: boolean
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T, idx: number) => string | number
  loading?: boolean
  emptyMessage?: string
  pageSize?: number
  className?: string
}

function ChevronIcon({ dir }: { dir: 'up' | 'down' | 'none' }) {
  if (dir === 'none') {
    return (
      <span className="text-text-disabled" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 2l3 3H3L6 2zM6 10L3 7h6L6 10z" opacity=".5"/>
        </svg>
      </span>
    )
  }
  return (
    <span className="text-primary-500" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ transform: dir === 'up' ? 'rotate(180deg)' : undefined }}>
        <path d="M6 8.5L2 4.5h8L6 8.5z"/>
      </svg>
    </span>
  )
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyMessage = 'No hay datos disponibles',
  pageSize = 10,
  className = '',
}: TableProps<T>) {
  const [sortKey, setSortKey]   = useState<string | null>(null)
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc')
  const [page, setPage]         = useState(0)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

  const totalPages = Math.ceil(data.length / pageSize)
  const pageData   = data.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className={`bg-surface border border-border rounded-2xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="grid" aria-rowcount={data.length}>
          <thead>
            <tr className="border-b border-border bg-background/60">
              {columns.map(col => (
                <th
                  key={col.key}
                  scope="col"
                  style={{ width: col.width }}
                  className={[
                    'px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide',
                    col.sortable ? 'cursor-pointer select-none hover:text-text-primary transition-colors' : '',
                  ].join(' ')}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={col.sortable && sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <ChevronIcon dir={sortKey === col.key ? sortDir === 'asc' ? 'up' : 'down' : 'none'} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 bg-border rounded-lg animate-pulse" style={{ width: `${60 + (i * 13) % 30}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-text-tertiary">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-border" aria-hidden>
                      <rect x="4" y="4" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="2"/>
                      <path d="M10 16h12M16 10v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".4"/>
                    </svg>
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr
                  key={keyExtractor(row, idx)}
                  className="border-b border-border/50 last:border-0 hover:bg-background/40 transition-colors"
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3.5 text-text-primary">
                      {col.render
                        ? col.render(row, page * pageSize + idx)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-4 bg-background/40">
          <p className="text-xs text-text-tertiary">
            Mostrando {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} de {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Página anterior"
              className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-border disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                <path d="M8.5 10.5L5 7l3.5-3.5" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Página ${i + 1}`}
                aria-current={i === page ? 'page' : undefined}
                className={[
                  'w-7 h-7 rounded-lg text-xs font-medium transition-colors',
                  i === page
                    ? 'bg-primary-500 text-white'
                    : 'text-text-tertiary hover:bg-border hover:text-text-primary',
                ].join(' ')}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              aria-label="Página siguiente"
              className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-border disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                <path d="M5.5 3.5L9 7l-3.5 3.5" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
