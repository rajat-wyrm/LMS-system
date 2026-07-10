import { X } from "lucide-react";

interface SidebarProps {
  sortBy: string;
  setSortBy: (v: string) => void;
  selLevels: string[];
  setSelLevels: (v: string[]) => void;
  selTopics: string[];
  setSelTopics: (v: string[]) => void;
  clearAll: () => void;
  levels: readonly string[];
  topics: string[];
  showFilters: boolean;
}

const sortOptions = ["Most Popular", "Highest Rated", "Newest"];

export const AppSidebar = ({
  sortBy,
  setSortBy,
  selLevels,
  setSelLevels,
  selTopics,
  setSelTopics,
  clearAll,
  levels,
  topics,
  showFilters,
}: SidebarProps) => {
  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  return (
    <aside
      className={`${
        showFilters ? "block" : "hidden"
      } lg:block w-full lg:w-[280px] lg:border-r lg:border-border lg:pr-6 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden custom-scrollbar`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display font-bold text-lg text-foreground tracking-wide">All Filters</h3>
        <button
          onClick={clearAll}
          className="text-xs font-medium text-secondary hover:text-primary transition-colors flex items-center gap-1 rounded focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2"
        >
          <X className="w-3 h-3" /> Clear All
        </button>
      </div>

      <FilterGroup title="Sort By">
        <div role="radiogroup" aria-label="Sort By" className="space-y-1">
          {sortOptions.map((s) => (
            <SortOption key={s} label={s} selected={sortBy === s} onSelect={() => setSortBy(s)} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Level">
        {levels.map((l) => (
          <FilterCheckbox
            key={l}
            label={l}
            checked={selLevels.includes(l)}
            onChange={() => toggle(selLevels, setSelLevels, l)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Topics">
        {topics.map((t) => (
          <FilterCheckbox
            key={t}
            label={t}
            checked={selTopics.includes(t)}
            onChange={() => toggle(selTopics, setSelTopics, t)}
          />
        ))}
      </FilterGroup>
    </aside>
  );
};

const FilterGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6 pb-6 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">
    <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80 mb-4">{title}</h4>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const SortOption = ({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className="w-full flex items-center gap-3 py-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors group text-left rounded focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2"
  >
    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selected ? "border-primary" : "border-border group-hover:border-primary/50"}`}>
      {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
    </div>
    <span className="text-sm">{label}</span>
  </button>
);

const FilterCheckbox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={onChange}
    className="w-full flex items-center gap-3 py-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors group text-left rounded focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2"
  >
    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}>
      {checked && (
        <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-primary-foreground">
          <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <span className="text-sm">{label}</span>
  </button>
);
