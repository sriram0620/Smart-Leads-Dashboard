import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LEAD_STATUSES, LEAD_SOURCES, ACTIVITY_TYPES, VALIDATION } from '../constants';

/**
 * Generic Zod validation middleware factory.
 * Validates req.body against the provided schema.
 */
export const validateBody = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
};

// ─── Auth Schemas ───────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(VALIDATION.USER_NAME_MIN, `Name must be at least ${VALIDATION.USER_NAME_MIN} characters`)
    .max(VALIDATION.USER_NAME_MAX, `Name cannot exceed ${VALIDATION.USER_NAME_MAX} characters`),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email'),
  password: z
    .string({ error: 'Password is required' })
    .min(VALIDATION.PASSWORD_MIN, `Password must be at least ${VALIDATION.PASSWORD_MIN} characters`),
  role: z.enum(['admin', 'sales']).optional().default('sales'),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email'),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required'),
});

// ─── Lead Schemas ───────────────────────────────────────────────────────────────

export const createLeadSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(VALIDATION.NAME_MIN, `Name must be at least ${VALIDATION.NAME_MIN} characters`)
    .max(VALIDATION.NAME_MAX, `Name cannot exceed ${VALIDATION.NAME_MAX} characters`),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email'),
  phone: z.string().trim().optional().default(''),
  company: z.string().trim().optional().default(''),
  jobTitle: z.string().trim().optional().default(''),
  status: z.enum(LEAD_STATUSES).optional().default('new'),
  source: z.enum(LEAD_SOURCES).optional().default('website'),
  notes: z.string().optional().default(''),
  assignedTo: z.string().nullable().optional().default(null),
});

export const updateLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(VALIDATION.NAME_MIN, `Name must be at least ${VALIDATION.NAME_MIN} characters`)
    .max(VALIDATION.NAME_MAX, `Name cannot exceed ${VALIDATION.NAME_MAX} characters`)
    .optional(),
  email: z.string().trim().toLowerCase().email('Please provide a valid email').optional(),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  jobTitle: z.string().trim().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().nullable().optional(),
});

// ─── Activity Schema ────────────────────────────────────────────────────────────

const activityTypeValues = ACTIVITY_TYPES.filter((t) => t !== 'created') as [string, ...string[]];

export const addActivitySchema = z.object({
  type: z.enum(activityTypeValues, { error: 'Activity type is required' }),
  description: z
    .string({ error: 'Description is required' })
    .trim()
    .min(1, 'Description is required'),
});

// ─── Type Exports ───────────────────────────────────────────────────────────────

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type CreateLeadBody = z.infer<typeof createLeadSchema>;
export type UpdateLeadBody = z.infer<typeof updateLeadSchema>;
export type AddActivityBody = z.infer<typeof addActivitySchema>;
