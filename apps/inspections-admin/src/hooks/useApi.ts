import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      const message = error instanceof ApiError 
        ? `${error.message} (${error.status})`
        : error instanceof Error 
        ? error.message 
        : 'An unknown error occurred';
      setState({ data: null, loading: false, error: message });
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
  };
}

// Specific hooks for common API calls
export const useUsers = () => useApi(() => api.users.list());
export const useWorkOrders = () => useApi(() => api.workOrders.list());
export const useInspections = () => useApi(() => api.inspections.list());
export const useTemplates = () => useApi(() => api.templates.list());
export const useDashboardStats = () => useApi(() => api.dashboard.stats());

export const useUser = (id: string | null) => 
  useApi(() => id ? api.users.get(id) : Promise.resolve(null), [id]);

export const useWorkOrder = (id: string | null) => 
  useApi(() => id ? api.workOrders.get(id) : Promise.resolve(null), [id]);

export const useTemplate = (id: string | null) => 
  useApi(() => id ? api.templates.get(id) : Promise.resolve(null), [id]);
