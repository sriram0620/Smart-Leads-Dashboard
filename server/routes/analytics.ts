import express from 'express';
import { getSummary } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);
router.get('/summary', getSummary);

export default router;
