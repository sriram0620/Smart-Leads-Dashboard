// ─── User ───────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales';
}

// ─── Lead Enums ─────────────────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';
export type LeadSource = 'website' | 'instagram' | 'referral';

export const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'lost', label: 'Lost' },
];

export const LEAD_SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'referral', label: 'Referral' },
];

// ─── Lead ───────────────────────────────────────────────────────────────────────

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Activity ───────────────────────────────────────────────────────────────────

export interface Activity {
  _id: string;
  leadId: string;
  type: 'created' | 'email_sent' | 'call_made' | 'note_added' | 'status_changed';
  description: string;
  performedBy?: {
    _id: string;
    name: string;
  } | null;
  createdAt: string;
}

// ─── Pagination ─────────────────────────────────────────────────────────────────

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── API Responses ──────────────────────────────────────────────────────────────

export interface LeadsResponse {
  success: boolean;
  data: {
    leads: Lead[];
    pagination: PaginationData;
  };
}

export interface LeadResponse {
  success: boolean;
  data: {
    lead: Lead;
    activities: Activity[];
  };
}

export interface AnalyticsSummary {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  lostLeads: number;
  conversionRate: number;
  recentLeads: number;
  leadsBySource: { source: string; label: string; count: number }[];
  leadsByStatus: { status: string; label: string; count: number }[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// ─── Filters ────────────────────────────────────────────────────────────────────

export interface LeadFilters {
  search?: string;
  status?: string;
  source?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ─── API Error ──────────────────────────────────────────────────────────────────

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
