import express from 'express';
import {
  getLeads,
  createLead,
  getLead,
  updateLead,
  deleteLead,
  addActivity,
  exportCSV,
} from '../controllers/leadController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import {
  validateBody,
  createLeadSchema,
  updateLeadSchema,
  addActivitySchema,
} from '../middleware/validate';

const router = express.Router();

// All lead routes require authentication
router.use(authMiddleware);

// CSV export must come before /:id to avoid route conflict
router.get('/export', exportCSV);

// CRUD routes
router.get('/', getLeads);
router.post('/', validateBody(createLeadSchema), createLead);
router.get('/:id', getLead);
router.put('/:id', validateBody(updateLeadSchema), updateLead);

// Delete is admin-only (RBAC enforcement)
router.delete('/:id', roleMiddleware(['admin']), deleteLead);

// Activity routes
router.post('/:id/activity', validateBody(addActivitySchema), addActivity);

export default router;
