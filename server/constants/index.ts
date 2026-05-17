/**
 * Shared constants for the Smart Leads Dashboard backend.
 * Single source of truth for enums, config values, and validation rules.
 */

// ─── Lead Status ────────────────────────────────────────────────────────────────
export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'lost'] as const;
export type LeadStatusType = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatusType, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  lost: 'Lost',
};

// ─── Lead Source ────────────────────────────────────────────────────────────────
export const LEAD_SOURCES = ['website', 'instagram', 'referral'] as const;
export type LeadSourceType = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSourceType, string> = {
  website: 'Website',
  instagram: 'Instagram',
  referral: 'Referral',
};

// ─── User Roles ─────────────────────────────────────────────────────────────────
export const USER_ROLES = ['admin', 'sales'] as const;
export type UserRoleType = (typeof USER_ROLES)[number];

// ─── Activity Types ─────────────────────────────────────────────────────────────
export const ACTIVITY_TYPES = ['created', 'email_sent', 'call_made', 'note_added', 'status_changed'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

// ─── Pagination ─────────────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// ─── Validation Rules ───────────────────────────────────────────────────────────
export const VALIDATION = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  USER_NAME_MIN: 3,
  USER_NAME_MAX: 50,
  PASSWORD_MIN: 6,
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
} as const;

// ─── Sortable Fields ────────────────────────────────────────────────────────────
export const SORTABLE_FIELDS = ['createdAt', 'name', 'email', 'status', 'source'] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;
