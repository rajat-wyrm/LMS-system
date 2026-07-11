import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdSearch,
  MdPeople,
  MdSchool,
  MdLibraryBooks,
  MdAttachMoney,
  MdPersonAdd,
} from 'react-icons/md';
import { useGlobalSearch } from '../../../hooks/useGlobalSearch';
import { groupResultsByCategory, SEARCH_CATEGORIES } from '../../../utils/globalSearch';

const CATEGORY_ICONS = {
  Students: MdPeople,
  Teachers: MdSchool,
  Courses: MdLibraryBooks,
  Payments: MdAttachMoney,
};

const TYPE_ICONS = {
  student: MdPeople,
  teacher: MdSchool,
  course: MdLibraryBooks,
  enrollment: MdPersonAdd,
  certificate: MdLibraryBooks,
  payment: MdAttachMoney,
};

const GlobalSearch = () => {
  const listboxId = useId();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { query, setQuery, results, loading } = useGlobalSearch();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const grouped = groupResultsByCategory(results);
  const flatForKeyboard = results;

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const selectResult = useCallback(
    (item) => {
      if (!item) return;
      close();
      setQuery('');
      navigate(item.path);
    },
    [close, navigate, setQuery]
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [close]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      inputRef.current?.blur();
      return;
    }
    if (!open || flatForKeyboard.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatForKeyboard.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? flatForKeyboard.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectResult(flatForKeyboard[activeIndex]);
    }
  };

  let runningIndex = -1;

  return (
    <div ref={containerRef} className="relative w-80 group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MdSearch
          className="text-[var(--admin-text-muted)] group-focus-within:text-[#7C3AED] transition-colors"
          size={18}
        />
      </div>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-label="Global search"
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        className="block w-full pl-9 pr-16 py-2 border rounded-lg text-sm transition-all bg-[var(--admin-input-bg)] border-[var(--admin-input-border)] text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2"
        placeholder="Search for students, courses, teachers..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => query.trim() && setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-[10px] text-[var(--admin-text-muted)] border border-[var(--admin-input-border)] rounded px-1.5 py-0.5 font-mono">
          ⌘K
        </span>
      </div>

      {open && query.trim() && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full mt-2 max-h-[min(24rem,70vh)] overflow-y-auto rounded-xl border shadow-2xl z-50 bg-[var(--admin-surface-raised)] border-[var(--admin-border)] backdrop-blur-xl"
        >
          {loading && (
            <p className="px-4 py-3 text-xs text-[var(--admin-text-muted)]" role="status">
              Searching…
            </p>
          )}

          {!loading && results.length === 0 && (
            <p className="px-4 py-6 text-sm text-center text-[var(--admin-text-muted)]">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {!loading &&
            results.length > 0 &&
            SEARCH_CATEGORIES.map((category) => {
              const items = grouped[category];
              if (!items?.length) return null;
              const CatIcon = CATEGORY_ICONS[category];
              return (
                <div key={category} role="group" aria-label={category}>
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-muted)] flex items-center gap-1.5 border-b border-[var(--admin-border-subtle)]">
                    <CatIcon size={12} />
                    {category}
                  </div>
                  {items.map((item) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const Icon = TYPE_ICONS[item.type] || MdSearch;
                    const selected = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        id={`${listboxId}-option-${idx}`}
                        role="option"
                        type="button"
                        aria-selected={selected}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                          selected
                            ? 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-primary)]'
                            : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text-primary)]'
                        }`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => selectResult(item)}
                      >
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#7C3AED]/15 text-[#7C3AED]">
                          <Icon size={16} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-medium truncate">{item.title}</span>
                          {item.subtitle && (
                            <span className="block text-[11px] text-[var(--admin-text-muted)] truncate">
                              {item.subtitle}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-[var(--admin-text-muted)] shrink-0">
                          {category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
