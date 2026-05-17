import { Response } from 'express';
import Lead from '../models/Lead';
import { AuthRequest } from '../middleware/auth';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '../constants';
import type { LeadStatusType, LeadSourceType } from '../constants';

/**
 * GET /api/analytics/summary
 * Returns dashboard analytics: counts, rates, breakdowns by status and source.
 */
export const getSummary = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Run all count queries in parallel for performance
    const [totalLeads, newLeads, contactedLeads, qualifiedLeads, lostLeads] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'new' }),
      Lead.countDocuments({ status: 'contacted' }),
      Lead.countDocuments({ status: 'qualified' }),
      Lead.countDocuments({ status: 'lost' }),
    ]);

    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

    // Aggregations for chart data
    const [leadsBySource, leadsByStatus] = await Promise.all([
      Lead.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    // Recent leads count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLeads = await Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        contactedLeads,
        qualifiedLeads,
        lostLeads,
        conversionRate,
        recentLeads,
        leadsBySource: leadsBySource.map((item) => ({
          source: item._id as LeadSourceType,
          label: LEAD_SOURCE_LABELS[item._id as LeadSourceType] || item._id,
          count: item.count as number,
        })),
        leadsByStatus: leadsByStatus.map((item) => ({
          status: item._id as LeadStatusType,
          label: LEAD_STATUS_LABELS[item._id as LeadStatusType] || item._id,
          count: item.count as number,
        })),
      },
    });
  } catch (error) {
    console.error('GetSummary error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
};
