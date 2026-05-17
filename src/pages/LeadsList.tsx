import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '@/hooks/useLeads';
import { useDebounce } from '@/hooks/useDebounce';
import StatusBadge from '@/components/shared/StatusBadge';
import SourceBadge from '@/components/shared/SourceBadge';
import EmptyState from '@/components/shared/EmptyState';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Search,
  Download,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

const LeadsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leads, pagination, isLoading, filters, setFilters, deleteLead } = useLeads();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);

  // Sync debounced search to filters
  React.useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch, setFilters]);

  const hasActiveFilters = filters.status || filters.source || filters.search;

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value, page: 1 }));
  };

  const handleSourceChange = (value: string) => {
    setFilters((prev) => ({ ...prev, source: value === 'all' ? '' : value, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('|');
    setFilters((prev) => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLead(leadToDelete);
      toast.success('Lead deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete lead');
    } finally {
      setLeadToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const url = api.exportCSV({
      search: filters.search,
      status: filters.status,
      source: filters.source,
    });
    window.open(url, '_blank');
    toast.success('CSV export started');
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div
        className="bg-white rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
        style={{
          animation: 'slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          opacity: 0,
        }}
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative w-[260px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <Input
              placeholder="Search by name, email, company..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-10 border-[#E5E7EB] focus:border-[#FFB300] focus:ring-[#FFB300]"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111111]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px] h-10 border-[#E5E7EB]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          {/* Source Filter */}
          <Select value={filters.source || 'all'} onValueChange={handleSourceChange}>
            <SelectTrigger className="w-[150px] h-10 border-[#E5E7EB]">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="social_media">Social Media</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={`${filters.sortBy}|${filters.sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[160px] h-10 border-[#E5E7EB]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt|desc">Latest First</SelectItem>
              <SelectItem value="createdAt|asc">Oldest First</SelectItem>
              <SelectItem value="name|asc">Name A-Z</SelectItem>
              <SelectItem value="name|desc">Name Z-A</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-3 ml-auto">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-[#6B7280] hover:text-[#111111] h-10"
              >
                Clear Filters
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="border-[#FFB300] text-[#FFB300] hover:bg-[#FFB300] hover:text-black h-10 transition-all duration-200"
            >
              <Download size={16} className="mr-1.5" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div
        className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden"
        style={{
          animation: 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards',
          opacity: 0,
        }}
      >
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description={hasActiveFilters ? 'Try adjusting your filters' : 'Get started by adding your first lead'}
            actionLabel="Add Lead"
            onAction={() => navigate('/leads/add')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-[#F9FAFB]">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Source</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Assigned To</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Created</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => (
                    <tr
                      key={lead._id}
                      className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150 cursor-pointer"
                      onClick={() => navigate(`/leads/${lead._id}`)}
                      style={{
                        animation: 'slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                        opacity: 0,
                        animationDelay: `${0.15 + index * 40}ms`,
                      }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-[#111111]">{lead.name}</p>
                          {lead.company && <p className="text-xs text-[#6B7280]">{lead.company}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{lead.email}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4">
                        <SourceBadge source={lead.source} />
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {lead.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/leads/${lead._id}/edit`)}
                            className="h-8 w-8 p-0 text-[#6B7280] hover:text-[#111111] hover:bg-[#F5F5F5]"
                          >
                            <Pencil size={15} />
                          </Button>
                          {user?.role === 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLeadToDelete(lead._id)}
                              className="h-8 w-8 p-0 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2]"
                            >
                              <Trash2 size={15} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
                <p className="text-sm text-[#6B7280]">
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="h-8 w-8 p-0 text-[#6B7280] hover:text-[#111111] disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={`h-8 w-8 p-0 text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'bg-[#FFB300] text-black hover:bg-[#FFA000]'
                              : 'text-[#6B7280] hover:text-[#111111]'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                      return <span key={pageNum} className="text-[#6B7280] px-1">...</span>;
                    }
                    return null;
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="h-8 w-8 p-0 text-[#6B7280] hover:text-[#111111] disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#EF4444]">
              <Trash2 size={20} />
              Delete Lead
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone and all associated activities will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-[#EF4444] text-white hover:bg-[#DC2626]"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LeadsList;
