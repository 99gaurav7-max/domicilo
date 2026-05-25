import { useState, ReactNode } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface TableProps {
  children: ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass-card rounded-xl p-6 ${className}`}>{children}</div>;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      )}
    </div>
  );
}

export function TableContainer({ children, searchable, searchPlaceholder, onSearch, filters, actions, className = '' }: TableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    onSearch?.(q);
  };

  return (
    <div className={`glass-card rounded-xl overflow-hidden ${className}`}>
      {(searchable || filters || actions) && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {searchable && (
                <SearchInput value={searchQuery} onChange={handleSearch} placeholder={searchPlaceholder} />
              )}
              {filters}
            </div>
            {actions && <div className="flex items-center gap-2 w-full sm:w-auto">{actions}</div>}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          {children}
        </table>
      </div>
    </div>
  );
}

export function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
      >
        {placeholder && <option value="" className="text-gray-900 dark:text-gray-100">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-gray-900 dark:text-gray-100">{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const styles: Record<string, string> = {
    completed: 'badge-success',
    paid: 'badge-success',
    active: 'badge-success',
    vacant: 'badge-info',
    pending: 'badge-warning',
    overdue: 'badge-danger',
    failed: 'badge-danger',
    new: 'badge-info',
    contacted: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    converted: 'badge-success',
    occupied: 'badge-info',
    maintenance: 'badge-warning',
    rent: 'badge-info',
    electricity: 'badge-warning',
    water: 'badge-info',
    maintenance_type: 'badge-warning',
    other: 'badge-info',
  };

  return (
    <span className={`${styles[status.toLowerCase()] || 'badge-info'} ${className}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4 text-primary-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
