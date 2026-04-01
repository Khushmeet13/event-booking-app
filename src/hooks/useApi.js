import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic data-fetching hook with loading, error, and refetch support
 */
export function useAsync(asyncFn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: null, loading: immediate, error: null });
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await asyncFn(...args);
      if (isMounted.current) setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      if (isMounted.current) setState({ data: null, loading: false, error: err.message });
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) execute();
  }, [execute]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, refetch: execute };
}

/**
 * Paginated search hook
 */
export function usePaginatedSearch(searchFn, initialParams = {}) {
  const [params, setParams] = useState(initialParams);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const search = useCallback(async (newParams = params, newPage = 0) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchFn({ ...newParams, page: newPage });
      if (newPage === 0) {
        setResults(result.events || result.artists || result.venues || []);
      } else {
        setResults((prev) => [...prev, ...(result.events || result.artists || result.venues || [])]);
      }
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 0);
      setPage(newPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [searchFn]); // eslint-disable-line

  useEffect(() => {
    search(params, 0);
  }, []); // eslint-disable-line

  const updateParams = useCallback((newParams) => {
    const merged = { ...params, ...newParams };
    setParams(merged);
    setInitialLoad(true);
    search(merged, 0);
  }, [params, search]);

  const loadMore = useCallback(() => {
    if (page + 1 < totalPages && !loading) {
      search(params, page + 1);
    }
  }, [page, totalPages, loading, params, search]);

  return {
    results, total, totalPages, page,
    loading, error, initialLoad,
    search: updateParams,
    loadMore,
    hasMore: page + 1 < totalPages,
  };
}

/**
 * Debounce hook for search inputs
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
