import { useState, useEffect, useCallback } from 'react';
import { cacheManager } from '../services/cache';
import { clearImageCache } from '../utils/imageOptimization';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  staleWhileRevalidate?: boolean;
  skipCache?: boolean;
  fallbackData?: any;
  clearImageCache?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = { immediate: true, staleWhileRevalidate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (newParams?: any) => {
    if (state.loading) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let result: T;
      
      // Check if we're on admin pages - always skip cache
      const isAdminPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      const shouldSkipCache = options.skipCache || isAdminPage;
      
      if (options.cacheKey && !shouldSkipCache) {
        result = await cacheManager.get(
          options.cacheKey!,
          apiCall,
          {
            ttl: options.cacheTTL,
            staleWhileRevalidate: options.staleWhileRevalidate,
            skipCache: shouldSkipCache
          }
        );
      } else {
        result = await apiCall();
      }
      
      setState({ data: result, loading: false, error: null });
      
      // Clear image cache when new data is loaded to prevent stale images
      if (options.clearImageCache !== false) {
        clearImageCache();
      }
      
      return result;
    } catch (error) {
      console.error('useApi execute error:', error); // Debug log
      
      // Use fallback data if provided
      if (options.fallbackData) {
        setState({ data: options.fallbackData, loading: false, error: null });
        return options.fallbackData;
      }
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, [apiCall, state.loading, options.cacheKey, options.skipCache, options.cacheTTL, options.clearImageCache]);

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  useEffect(() => {
    if (options.immediate) {
      execute().catch((error) => {
        console.error('useApi immediate execution failed:', error);
        // Error already handled in execute function
      });
    }
    // Add empty dependency array to prevent infinite re-renders
  }, []); // Only run on mount

  return {
    ...state,
    execute,
    reset,
  };
}

export function useMutation<T, P = void>(
  apiCall: (params: P) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall(params);
      setState({ data: result, loading: false, error: null });
      
      // Invalidate related cache entries after successful mutations
      if (typeof params === 'object' && params !== null) {
        const paramObj = params as any;
        if (paramObj.invalidateCache) {
          cacheManager.invalidatePattern(paramObj.invalidateCache);
        }
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return {
    ...state,
    mutate,
    reset,
  };
}