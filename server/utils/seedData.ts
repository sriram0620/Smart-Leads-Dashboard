import User from '../models/User';
import Lead from '../models/Lead';
import Activity from '../models/Activity';
import type { LeadStatusType, LeadSourceType } from '../constants';

interface SeedLead {
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  status: LeadStatusType;
  source: LeadSourceType;
}

const sampleLeads: SeedLead[] = [
  { name: 'Rajesh Sharma', email: 'rajesh@techsolutions.in', phone: '+91 98765 43210', company: 'TechSolutions Pvt Ltd', jobTitle: 'CTO', status: 'new', source: 'website' },
  { name: 'Priya Patel', email: 'priya@innovate.co.in', phone: '+91 98765 43211', company: 'InnovateCo', jobTitle: 'VP Engineering', status: 'contacted', source: 'referral' },
  { name: 'Amit Kumar', email: 'amit@digitalcrafts.com', phone: '+91 98765 43212', company: 'Digital Crafts', jobTitle: 'Product Manager', status: 'qualified', source: 'instagram' },
  { name: 'Sneha Gupta', email: 'sneha@webwizards.in', phone: '+91 98765 43213', company: 'Web Wizards', jobTitle: 'CEO', status: 'new', source: 'website' },
  { name: 'Vikram Singh', email: 'vikram@cloudfirst.io', phone: '+91 98765 43214', company: 'CloudFirst', jobTitle: 'DevOps Lead', status: 'contacted', source: 'website' },
  { name: 'Ananya Reddy', email: 'ananya@startuphub.in', phone: '+91 98765 43215', company: 'StartupHub', jobTitle: 'Founder', status: 'qualified', source: 'referral' },
  { name: 'Rohan Mehta', email: 'rohan@dataviz.co', phone: '+91 98765 43216', company: 'DataViz Co', jobTitle: 'Data Scientist', status: 'lost', source: 'instagram' },
  { name: 'Kavita Iyer', email: 'kavita@applab.in', phone: '+91 98765 43217', company: 'AppLab', jobTitle: 'UX Designer', status: 'new', source: 'instagram' },
  { name: 'Deepak Joshi', email: 'deepak@netcore.com', phone: '+91 98765 43218', company: 'NetCore', jobTitle: 'Engineering Manager', status: 'contacted', source: 'website' },
  { name: 'Meera Nair', email: 'meera@softsys.in', phone: '+91 98765 43219', company: 'SoftSys', jobTitle: 'QA Lead', status: 'qualified', source: 'referral' },
  { name: 'Arun Verma', email: 'arun@codebase.io', phone: '+91 98765 43220', company: 'CodeBase', jobTitle: 'Full Stack Dev', status: 'new', source: 'referral' },
  { name: 'Divya Menon', email: 'divya@pixelperfect.co', phone: '+91 98765 43221', company: 'Pixel Perfect', jobTitle: 'Design Lead', status: 'contacted', source: 'instagram' },
  { name: 'Suresh Babu', email: 'suresh@enterprisetech.in', phone: '+91 98765 43222', company: 'EnterpriseTech', jobTitle: 'IT Director', status: 'qualified', source: 'website' },
  { name: 'Lakshmi Rao', email: 'lakshmi@aisolutions.com', phone: '+91 98765 43223', company: 'AI Solutions', jobTitle: 'ML Engineer', status: 'lost', source: 'instagram' },
  { name: 'Karthik Subramanian', email: 'karthik@devopspro.in', phone: '+91 98765 43224', company: 'DevOps Pro', jobTitle: 'SRE', status: 'new', source: 'website' },
  { name: 'Pooja Desai', email: 'pooja@mobilefirst.co', phone: '+91 98765 43225', company: 'MobileFirst', jobTitle: 'Mobile Dev', status: 'contacted', source: 'referral' },
  { name: 'Harish Kulkarni', email: 'harish@securenet.in', phone: '+91 98765 43226', company: 'SecureNet', jobTitle: 'Security Analyst', status: 'qualified', source: 'website' },
  { name: 'Sonia Malhotra', email: 'sonia@cloudnine.io', phone: '+91 98765 43227', company: 'CloudNine', jobTitle: 'Solutions Architect', status: 'new', source: 'referral' },
  { name: 'Manoj Tiwari', email: 'manoj@bigdata.in', phone: '+91 98765 43228', company: 'BigData Inc', jobTitle: 'Data Engineer', status: 'contacted', source: 'instagram' },
  { name: 'Ritu Agarwal', email: 'ritu@fintech.co', phone: '+91 98765 43229', company: 'FinTech Co', jobTitle: 'Backend Dev', status: 'qualified', source: 'website' },
];

const activityTemplates: Record<LeadStatusType, string[]> = {
  new: ['Lead created from website form', 'Inbound inquiry received', 'Auto-captured from landing page'],
  contacted: ['Initial call completed', 'Proposal sent to client', 'Demo scheduled for next week', 'Follow-up email sent', 'Meeting with stakeholders arranged'],
  qualified: ['Requirements gathered', 'Deal pipeline advanced', 'Budget approved', 'Onboarding initiated'],
  lost: ['No response after 3 follow-ups', 'Budget constraints', 'Went with competitor', 'Project postponed indefinitely'],
};

export const seedDatabase = async (): Promise<void> => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('📦 Database already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding database...');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@leadflow.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create sales users
    const salesUsers = await User.create([
      { name: 'Rahul Yadav', email: 'rahul@leadflow.com', password: 'sales123', role: 'sales' },
      { name: 'Neha Gupta', email: 'neha@leadflow.com', password: 'sales123', role: 'sales' },
      { name: 'Ajay Sharma', email: 'ajay@leadflow.com', password: 'sales123', role: 'sales' },
    ]);

    const allUsers = [admin, ...salesUsers];

    // Create leads with varied creation dates for realistic data
    const leads = await Lead.create(
      sampleLeads.map((lead, index) => ({
        ...lead,
        createdBy: admin._id,
        assignedTo: salesUsers[index % salesUsers.length]._id,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      }))
    );

    // Create activities for each lead
    for (const lead of leads) {
      const templates = activityTemplates[lead.status];
      const activities = templates.map((desc, idx) => ({
        leadId: lead._id,
        type: idx === 0 ? ('created' as const) : ('note_added' as const),
        description: desc,
        performedBy: allUsers[Math.floor(Math.random() * allUsers.length)]._id,
        createdAt: new Date(lead.createdAt.getTime() + idx * 24 * 60 * 60 * 1000),
      }));

      await Activity.create(activities);
    }

    console.log('✅ Database seeded successfully!');
    console.log(`   Created: ${allUsers.length} users, ${leads.length} leads`);
    console.log('   Default login: admin@leadflow.com / admin123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
