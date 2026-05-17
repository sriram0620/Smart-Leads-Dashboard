import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import type { Lead, LeadFilters, PaginationData } from '@/types';

interface UseLeadsReturn {
  leads: Lead[];
  pagination: PaginationData | null;
  isLoading: boolean;
  error: string | null;
  filters: LeadFilters;
  setFilters: React.Dispatch<React.SetStateAction<LeadFilters>>;
  refresh: () => void;
  deleteLead: (id: string) => Promise<void>;
}

export function useLeads(initialFilters: LeadFilters = {}): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const debouncedSearch = useDebounce(filters.search || '', 300);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getLeads({
        ...filters,
        search: debouncedSearch,
      });
      setLeads(response.data.leads);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch leads');
    } finally {
      setIsLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const refresh = useCallback(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleDelete = useCallback(async (id: string) => {
    await api.deleteLead(id);
    setLeads((prev) => prev.filter((lead) => lead._id !== id));
    refresh();
  }, [refresh]);

  return {
    leads,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    refresh,
    deleteLead: handleDelete,
  };
}
