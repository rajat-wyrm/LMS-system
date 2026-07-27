import { useCallback, useEffect, useRef, useState } from 'react';
import { loadSearchSources, searchGlobal } from '../utils/globalSearch';

const DEBOUNCE_MS = 300;

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const sourcesRef = useRef(null);
  const timerRef = useRef(null);

  const refreshSources = useCallback(async () => {
    sourcesRef.current = await loadSearchSources();
    return sourcesRef.current;
  }, []);

  useEffect(() => {
    refreshSources().catch(() => {
      sourcesRef.current = { students: [], teachers: [], courses: [] };
    });
  }, [refreshSources]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const sources = sourcesRef.current || await refreshSources();
        const found = searchGlobal(trimmed, sources);
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, refreshSources]);

  return {
    query,
    setQuery,
    results,
    loading,
    refreshSources,
  };
}
