import { Response } from 'express';
import Lead from '../models/Lead';
import Activity from '../models/Activity';
import { AuthRequest } from '../middleware/auth';
import { Parser } from 'json2csv';

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = (req.query.search as string)?.trim() || '';
    const status = req.query.status as string;
    const source = req.query.source as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    // Build query
    const query: Record<string, any> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && ['new', 'in_progress', 'converted', 'lost'].includes(status)) {
      query.status = status;
    }

    if (source && ['website', 'social_media', 'referral', 'email', 'direct'].includes(source)) {
      query.source = source;
    }

    // Sort
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

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
    res.status(500).json({ success: false, message: 'Server error fetching leads' });
  }
};

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, company, jobTitle, status, source, notes, assignedTo } = req.body;

    // Validation
    const errors: Array<{ field: string; message: string }> = [];
    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Name must be 2-100 characters' });
    }
    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }

    if (errors.length > 0) {
      res.status(400).json({ success: false, message: 'Validation failed', errors });
      return;
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      company: company || '',
      jobTitle: jobTitle || '',
      status: status || 'new',
      source: source || 'website',
      notes: notes || '',
      assignedTo: assignedTo || null,
      createdBy: req.user!.userId,
    });

    // Create activity
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
    res.status(500).json({ success: false, message: 'Server error creating lead' });
  }
};

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
    res.status(500).json({ success: false, message: 'Server error fetching lead' });
  }
};

export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, company, jobTitle, status, source, notes, assignedTo } = req.body;
    const leadId = req.params.id;

    const existingLead = await Lead.findById(leadId);
    if (!existingLead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    // Build update object
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (status !== undefined) updateData.status = status;
    if (source !== undefined) updateData.source = source;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;

    const lead = await Lead.findByIdAndUpdate(leadId, updateData, { new: true })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Create status changed activity
    if (status && status !== existingLead.status) {
      await Activity.create({
        leadId: leadId,
        type: 'status_changed',
        description: `Status changed from "${existingLead.status}" to "${status}"`,
        performedBy: req.user!.userId,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating lead' });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    // Delete related activities
    await Activity.deleteMany({ leadId: req.params.id });
    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting lead' });
  }
};

export const addActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, description } = req.body;
    const leadId = req.params.id;

    const errors: Array<{ field: string; message: string }> = [];
    if (!type || !['email_sent', 'call_made', 'note_added', 'status_changed'].includes(type)) {
      errors.push({ field: 'type', message: 'Valid activity type is required' });
    }
    if (!description || description.trim().length === 0) {
      errors.push({ field: 'description', message: 'Description is required' });
    }

    if (errors.length > 0) {
      res.status(400).json({ success: false, message: 'Validation failed', errors });
      return;
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const activity = await Activity.create({
      leadId,
      type,
      description: description.trim(),
      performedBy: req.user!.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      data: { activity },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error adding activity' });
  }
};

export const exportCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = (req.query.search as string)?.trim() || '';
    const status = req.query.status as string;
    const source = req.query.source as string;

    // Build query (same as getLeads)
    const query: Record<string, any> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && ['new', 'in_progress', 'converted', 'lost'].includes(status)) {
      query.status = status;
    }
    if (source && ['website', 'social_media', 'referral', 'email', 'direct'].includes(source)) {
      query.source = source;
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
      { label: 'Company', value: 'company' },
      { label: 'Job Title', value: 'jobTitle' },
      { label: 'Status', value: 'status' },
      { label: 'Source', value: 'source' },
      { label: 'Notes', value: 'notes' },
      { label: 'Assigned To', value: (lead: any) => lead.assignedTo?.name || 'Unassigned' },
      { label: 'Created Date', value: (lead: any) => new Date(lead.createdAt).toISOString() },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(leads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error exporting CSV' });
  }
};
