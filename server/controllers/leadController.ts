import { Response } from 'express';
import Lead from '../models/Lead';
import Activity from '../models/Activity';
import { AuthRequest } from '../middleware/auth';
import { Parser } from 'json2csv';
import { LEAD_STATUSES, LEAD_SOURCES, PAGINATION, SORTABLE_FIELDS } from '../constants';
import type { CreateLeadBody, UpdateLeadBody, AddActivityBody } from '../middleware/validate';
import type { LeadStatusType, LeadSourceType } from '../constants';

// ─── Filter Query Builder ───────────────────────────────────────────────────────

interface LeadQuery {
  $or?: Array<Record<string, { $regex: string; $options: string }>>;
  status?: LeadStatusType;
  source?: LeadSourceType;
}

const buildFilterQuery = (search?: string, status?: string, source?: string): LeadQuery => {
  const query: LeadQuery = {};

  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
      { company: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  if (status && (LEAD_STATUSES as readonly string[]).includes(status)) {
    query.status = status as LeadStatusType;
  }

  if (source && (LEAD_SOURCES as readonly string[]).includes(source)) {
    query.source = source as LeadSourceType;
  }

  return query;
};

// ─── Controllers ────────────────────────────────────────────────────────────────

/**
 * GET /api/leads
 * Fetches paginated, filtered, and sorted leads.
 */
export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(PAGINATION.DEFAULT_PAGE, parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(PAGINATION.MIN_LIMIT, parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT));
    const search = (req.query.search as string)?.trim() || '';
    const status = req.query.status as string;
    const source = req.query.source as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    // Build filter query
    const query = buildFilterQuery(search, status, source);

    // Build sort object (validate sort field)
    const sort: Record<string, 1 | -1> = {};
    const safeSortBy = (SORTABLE_FIELDS as readonly string[]).includes(sortBy) ? sortBy : 'createdAt';
    sort[safeSortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute count + find in parallel for performance
    const [total, leads] = await Promise.all([
      Lead.countDocuments(query),
      Lead.find(query)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('GetLeads error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching leads' });
  }
};

/**
 * POST /api/leads
 * Creates a new lead. Request body pre-validated by Zod middleware.
 */
export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = req.body as CreateLeadBody;

    const lead = await Lead.create({
      ...body,
      createdBy: req.user!.userId,
    });

    // Log creation activity
    await Activity.create({
      leadId: lead._id,
      type: 'created',
      description: `Lead created by ${req.user!.email}`,
      performedBy: req.user!.userId,
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: { lead: populatedLead },
    });
  } catch (error) {
    console.error('CreateLead error:', error);
    res.status(500).json({ success: false, message: 'Server error creating lead' });
  }
};

/**
 * GET /api/leads/:id
 * Returns a single lead with its activity timeline.
 */
export const getLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const activities = await Activity.find({ leadId: lead._id })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { lead, activities },
    });
  } catch (error) {
    console.error('GetLead error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching lead' });
  }
};

/**
 * PUT /api/leads/:id
 * Updates an existing lead. Request body pre-validated by Zod middleware.
 */
export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = req.body as UpdateLeadBody;
    const leadId = req.params.id;

    const existingLead = await Lead.findById(leadId);
    if (!existingLead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const lead = await Lead.findByIdAndUpdate(leadId, body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Log status change activity
    if (body.status && body.status !== existingLead.status) {
      await Activity.create({
        leadId,
        type: 'status_changed',
        description: `Status changed from "${existingLead.status}" to "${body.status}"`,
        performedBy: req.user!.userId,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead },
    });
  } catch (error) {
    console.error('UpdateLead error:', error);
    res.status(500).json({ success: false, message: 'Server error updating lead' });
  }
};

/**
 * DELETE /api/leads/:id
 * Deletes a lead and its associated activities.
 * Protected by roleMiddleware(['admin']) in routes.
 */
export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    // Delete related activities, then the lead
    await Activity.deleteMany({ leadId: req.params.id });
    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('DeleteLead error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting lead' });
  }
};

/**
 * POST /api/leads/:id/activity
 * Adds an activity entry to a lead's timeline.
 * Request body pre-validated by Zod middleware.
 */
export const addActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, description } = req.body as AddActivityBody;
    const leadId = req.params.id;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const activity = await Activity.create({
      leadId,
      type,
      description,
      performedBy: req.user!.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      data: { activity },
    });
  } catch (error) {
    console.error('AddActivity error:', error);
    res.status(500).json({ success: false, message: 'Server error adding activity' });
  }
};

/**
 * GET /api/leads/export
 * Exports filtered leads as a CSV file download.
 */
export const exportCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = (req.query.search as string)?.trim() || '';
    const status = req.query.status as string;
    const source = req.query.source as string;

    const query = buildFilterQuery(search, status, source);

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .lean();

    interface CsvLead {
      assignedTo?: { name: string } | null;
      createdAt: Date | string;
    }

    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
      { label: 'Company', value: 'company' },
      { label: 'Job Title', value: 'jobTitle' },
      { label: 'Status', value: 'status' },
      { label: 'Source', value: 'source' },
      { label: 'Notes', value: 'notes' },
      { label: 'Assigned To', value: (lead: CsvLead) => lead.assignedTo?.name || 'Unassigned' },
      { label: 'Created Date', value: (lead: CsvLead) => new Date(lead.createdAt).toISOString() },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(leads);

    // Include date in filename for traceability
    const dateStr = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=leads_${dateStr}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('ExportCSV error:', error);
    res.status(500).json({ success: false, message: 'Server error exporting CSV' });
  }
};
