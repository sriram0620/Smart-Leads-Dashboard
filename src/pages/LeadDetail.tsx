import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import StatusBadge from '@/components/shared/StatusBadge';
import SourceBadge from '@/components/shared/SourceBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, CheckCircle, User, Mail, Phone, Building2, Briefcase, Calendar, UserCircle, Clock, CircleDot } from 'lucide-react';
import type { Lead, Activity } from '@/types';
import type { AxiosError } from 'axios';
import { format } from 'date-fns';

interface ApiErr { message?: string }

const actIcons: Record<string, React.ElementType> = { created: CircleDot, email_sent: Mail, call_made: Phone, note_added: Clock, status_changed: CheckCircle };
const actColors: Record<string, string> = { created: '#3B82F6', email_sent: '#8B5CF6', call_made: '#10B981', note_added: '#6B7280', status_changed: '#FFB300' };

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      try {
        const res = await api.getLead(id);
        setLead(res.data.lead);
        setActivities(res.data.activities);
      } catch (err: unknown) {
        toast.error((err as AxiosError<ApiErr>).response?.data?.message || 'Failed to fetch lead');
        navigate('/leads');
      } finally { setIsLoading(false); }
    };
    fetchLead();
  }, [id, navigate]);

  const handleMarkQualified = async () => {
    if (!lead) return;
    try {
      await api.updateLead(lead._id, { status: 'qualified' });
      setLead({ ...lead, status: 'qualified' });
      toast.success('Lead marked as qualified');
    } catch (err: unknown) {
      toast.error((err as AxiosError<ApiErr>).response?.data?.message || 'Failed to update');
    }
  };

  if (isLoading) return (<div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Skeleton className="h-[300px]" /><Skeleton className="h-[300px]" /></div></div>);
  if (!lead) return null;

  const dc = 'dark:bg-[#111111] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]';
  const cardCls = `bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${dc}`;
  const lbl = 'text-xs font-medium text-[#6B7280] dark:text-gray-400 uppercase tracking-wide';
  const val = 'text-sm text-[#111111] dark:text-white';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/leads')} className="h-9 w-9 p-0 text-[#6B7280] hover:text-[#111111] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"><ArrowLeft size={18} /></Button>
          <div><h1 className="text-2xl font-bold text-[#111111] dark:text-white">{lead.name}</h1><p className="text-sm text-[#6B7280] dark:text-gray-400">{lead.email}</p></div>
        </div>
        <div className="flex items-center gap-3">
          {lead.status !== 'qualified' && <Button onClick={handleMarkQualified} className="bg-[#FFB300] text-black hover:bg-[#FFA000] rounded-full font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"><CheckCircle size={16} className="mr-1.5" />Mark as Qualified</Button>}
          <Button variant="outline" onClick={() => navigate(`/leads/${lead._id}/edit`)} className="border-[#E5E7EB] dark:border-[#2A2A2A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"><Pencil size={16} className="mr-1.5" />Edit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardCls} style={{ animation: 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards', opacity: 0 }}>
          <h2 className="text-lg font-semibold text-[#111111] dark:text-white mb-5">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3"><User size={18} className="text-[#6B7280] mt-0.5" /><div><p className={lbl}>Name</p><p className={`${val} font-medium`}>{lead.name}</p></div></div>
            <div className="flex items-start gap-3"><Mail size={18} className="text-[#6B7280] mt-0.5" /><div><p className={lbl}>Email</p><p className={val}>{lead.email}</p></div></div>
            {lead.phone && <div className="flex items-start gap-3"><Phone size={18} className="text-[#6B7280] mt-0.5" /><div><p className={lbl}>Phone</p><p className={val}>{lead.phone}</p></div></div>}
            {lead.company && <div className="flex items-start gap-3"><Building2 size={18} className="text-[#6B7280] mt-0.5" /><div><p className={lbl}>Company</p><p className={val}>{lead.company}</p></div></div>}
            {lead.jobTitle && <div className="flex items-start gap-3"><Briefcase size={18} className="text-[#6B7280] mt-0.5" /><div><p className={lbl}>Job Title</p><p className={val}>{lead.jobTitle}</p></div></div>}
          </div>
        </div>

        <div className={cardCls} style={{ animation: 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards', opacity: 0 }}>
          <h2 className="text-lg font-semibold text-[#111111] dark:text-white mb-5">Lead Details</h2>
          <div className="space-y-4">
            <div><p className={`${lbl} mb-2`}>Status</p><StatusBadge status={lead.status} size="md" /></div>
            <div><p className={`${lbl} mb-2`}>Source</p><SourceBadge source={lead.source} /></div>
            <div className="flex items-start gap-3"><Calendar size={18} className="text-[#6B7280] mt-0.5" /><div><p className={lbl}>Created</p><p className={val}>{format(new Date(lead.createdAt), 'MMMM dd, yyyy')}</p></div></div>
            <div className="flex items-start gap-3"><Clock size={18} className="text-[#6B7280] mt-0.5" /><div><p className={lbl}>Last Updated</p><p className={val}>{format(new Date(lead.updatedAt), 'MMMM dd, yyyy HH:mm')}</p></div></div>
            <div className="flex items-start gap-3"><UserCircle size={18} className="text-[#6B7280] mt-0.5" /><div><p className={lbl}>Assigned To</p><p className={val}>{lead.assignedTo?.name || 'Unassigned'}</p></div></div>
            {lead.notes && <div><p className={`${lbl} mb-1`}>Notes</p><p className={`text-sm text-[#111111] dark:text-white bg-[#F9FAFB] dark:bg-[#1A1A1A] rounded-lg p-3`}>{lead.notes}</p></div>}
          </div>
        </div>
      </div>

      <div className={cardCls} style={{ animation: 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards', opacity: 0 }}>
        <h2 className="text-lg font-semibold text-[#111111] dark:text-white mb-5">Activity Timeline</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-[#6B7280] dark:text-gray-400 py-4">No activities recorded yet.</p>
        ) : (
          <div className="relative pl-4">
            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-[#E5E7EB] dark:bg-[#2A2A2A]"></div>
            <div className="space-y-6">
              {activities.map((activity, index) => {
                const Icon = actIcons[activity.type] || CircleDot;
                const color = actColors[activity.type] || '#6B7280';
                return (
                  <div key={activity._id} className="flex items-start gap-4 relative" style={{ animation: 'slideInLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards', opacity: 0, animationDelay: `${0.3 + index * 120}ms` }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10" style={{ backgroundColor: `${color}20` }}><Icon size={14} style={{ color }} /></div>
                    <div className="flex-1 pt-1"><p className={val}>{activity.description}</p><p className="text-xs text-[#6B7280] dark:text-gray-400 mt-1">{format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}{activity.performedBy && ` by ${activity.performedBy.name}`}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetail;
