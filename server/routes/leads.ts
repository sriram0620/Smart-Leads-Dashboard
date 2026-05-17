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
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/export', exportCSV);
router.get('/', getLeads);
router.post('/', createLead);
router.get('/:id', getLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/activity', addActivity);

export default router;
