export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales';
}

export type LeadStatus = 'new' | 'in_progress' | 'converted' | 'lost';
export type LeadSource = 'website' | 'social_media' | 'referral' | 'email' | 'direct';

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

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

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
  convertedLeads: number;
  inProgressLeads: number;
  lostLeads: number;
  conversionRate: number;
  recentLeads: number;
  leadsBySource: { source: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface LeadFilters {
  search?: string;
  status?: string;
  source?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
