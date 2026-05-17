import { Response } from 'express';
import Lead from '../models/Lead';
import { AuthRequest } from '../middleware/auth';

export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });
    const inProgressLeads = await Lead.countDocuments({ status: 'in_progress' });
    const lostLeads = await Lead.countDocuments({ status: 'lost' });

    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // Leads by source
    const leadsBySource = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Leads by status
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
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
        convertedLeads,
        inProgressLeads,
        lostLeads,
        conversionRate,
        recentLeads,
        leadsBySource: leadsBySource.map((item) => ({
          source: item._id,
          count: item.count,
        })),
        leadsByStatus: leadsByStatus.map((item) => ({
          status: item._id,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
};
