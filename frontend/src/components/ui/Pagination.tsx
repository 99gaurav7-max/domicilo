import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium text-gray-900 dark:text-gray-200">{startItem}</span> to <span className="font-medium text-gray-900 dark:text-gray-200">{endItem}</span> of{' '}
        <span className="font-medium text-gray-900 dark:text-gray-200">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-xl hover:bg-royal-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-500 dark:text-gray-400"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          typeof p === 'number' ? (
            <button
              key={i}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                p === page
                  ? 'bg-gradient-to-br from-royal-500 to-royal-700 text-white shadow-lg shadow-royal-500/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-royal-500/10 hover:text-royal-400'
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={i} className="px-1 text-gray-500">...</span>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-xl hover:bg-royal-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-500 dark:text-gray-400"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
