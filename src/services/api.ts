import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { AuthResponse, LeadsResponse, LeadResponse, AnalyticsSummary, LeadFilters, Lead, Activity } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(name: string, email: string, password: string, role?: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/register', { name, email, password, role });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async getMe(): Promise<{ success: boolean; data: { user: { id: string; name: string; email: string; role: string } } }> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Leads
  async getLeads(filters: LeadFilters = {}): Promise<LeadsResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await this.client.get(`/leads?${params.toString()}`);
    return response.data;
  }

  async getLead(id: string): Promise<LeadResponse> {
    const response = await this.client.get(`/leads/${id}`);
    return response.data;
  }

  async createLead(leadData: Partial<Lead>): Promise<{ success: boolean; message: string; data: { lead: Lead } }> {
    const response = await this.client.post('/leads', leadData);
    return response.data;
  }

  async updateLead(id: string, leadData: Partial<Lead>): Promise<{ success: boolean; message: string; data: { lead: Lead } }> {
    const response = await this.client.put(`/leads/${id}`, leadData);
    return response.data;
  }

  async deleteLead(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete(`/leads/${id}`);
    return response.data;
  }

  async addActivity(id: string, type: string, description: string): Promise<{ success: boolean; message: string; data: { activity: Activity } }> {
    const response = await this.client.post(`/leads/${id}/activity`, { type, description });
    return response.data;
  }

  // Analytics
  async getSummary(): Promise<{ success: boolean; data: AnalyticsSummary }> {
    const response = await this.client.get('/analytics/summary');
    return response.data;
  }

  // Export CSV
  exportCSV(filters: LeadFilters = {}): string {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    return `${API_URL}/leads/export?${params.toString()}`;
  }
}

export const api = new ApiService();
export default api;
