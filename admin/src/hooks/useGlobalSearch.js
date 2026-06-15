import { useCallback, useEffect, useRef, useState } from 'react';
import { loadSearchSources, searchGlobal } from '../utils/globalSearch';

const DEBOUNCE_MS = 300;

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const sourcesRef = useRef(null);
  const timerRef = useRef(null);

  const refreshSources = useCallback(() => {
    sourcesRef.current = loadSearchSources();
  }, []);

  useEffect(() => {
    refreshSources();
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
    timerRef.current = setTimeout(() => {
      if (!sourcesRef.current) refreshSources();
      const found = searchGlobal(trimmed, sourcesRef.current);
      setResults(found);
      setLoading(false);
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
