import { useState, useCallback } from 'react';
import { apiClient, ApiError } from '@/lib/api-client';
import type {
  ProductListResponse,
  ProductQueryParams,
  MemorabiliaListResponse,
  MerchandiseListResponse,
  LeadListResponse,
  LeadQueryParams,
  ListQueryParams,
} from '@/types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: () => Promise<void>;
  reset: () => void;
}

function useApi<T>(apiCall: () => Promise<T>): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.data?.detail || error.message 
        : 'An unexpected error occurred';
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

// Specific hooks for common operations
export function useProducts(params?: ProductQueryParams) {
  return useApi(() => apiClient.listProducts(params));
}

export function useProduct(idOrSlug: string) {
  return useApi(() => apiClient.getProduct(idOrSlug));
}

export function useMemorabilia(params?: ListQueryParams) {
  return useApi(() => apiClient.listMemorabilia(params));
}

export function useMemorabiliaDetail(idOrSlug: string) {
  return useApi(() => apiClient.getMemorabilia(idOrSlug));
}

export function useMerchandise(params?: ListQueryParams) {
  return useApi(() => apiClient.listMerchandise(params));
}

export function useMerchandiseDetail(idOrSlug: string) {
  return useApi(() => apiClient.getMerchandise(idOrSlug));
}

export function useLeads(params?: LeadQueryParams) {
  return useApi(() => apiClient.listLeads(params));
}

export function useLead(leadId: string) {
  return useApi(() => apiClient.getLead(leadId));
}

// Mutation hooks
export function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = useCallback(async (productData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.createProduct(productData);
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.data?.detail || error.message 
        : 'Failed to create product';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, []);

  return { createProduct, loading, error };
}

export function useUpdateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProduct = useCallback(async (productId: string, updates: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.updateProduct(productId, updates);
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.data?.detail || error.message 
        : 'Failed to update product';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, []);

  return { updateProduct, loading, error };
}

export function useDeleteProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProduct = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.deleteProduct(productId);
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.data?.detail || error.message 
        : 'Failed to delete product';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, []);

  return { deleteProduct, loading, error };
}

export function useUploadFile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.uploadFile(file);
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.data?.detail || error.message 
        : 'Failed to upload file';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, []);

  return { uploadFile, loading, error };
}

export { useApi };
