export type FilterType = 'all' | 'free' | 'premium' | 'vision' | 'coding' | 'reasoning';

interface ModelsFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTERS: Array<{
  type: FilterType;
  label: string;
  icon: string;
}> = [
  { type: 'all', label: 'All Models', icon: 'Grid' },
  { type: 'free', label: 'Free Models', icon: 'Zap' },
  { type: 'premium', label: 'Premium Models', icon: 'Sparkles' },
  { type: 'vision', label: 'Vision Models', icon: 'Eye' },
  { type: 'coding', label: 'Coding Models', icon: 'Code' },
  { type: 'reasoning', label: 'Reasoning Models', icon: 'Brain' }
];

export function ModelsFilter({ activeFilter, onFilterChange }: ModelsFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(filter => (
        <button
          key={filter.type}
          onClick={() => onFilterChange(filter.type)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${activeFilter === filter.type
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
            }
          `}
        >
          {filter.label}
          {activeFilter === filter.type && (
            <span className="ml-2 inline-flex items-center gap-1">
              <span className="font-semibold">
                {(FILTERS.find(f => f.type === activeFilter)?.label || 'Unknown')}
              </span>
              <span className="text-xs opacity-75">
                ({FILTERS.find(f => f.type !== activeFilter)?.label || 'Other'})
              </span>
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
