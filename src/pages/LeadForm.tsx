import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS } from '@/types';
import type { LeadStatus, LeadSource } from '@/types';
import type { AxiosError } from 'axios';

interface FormData { name: string; email: string; phone: string; company: string; jobTitle: string; status: LeadStatus; source: LeadSource; notes: string; }
interface FormErrors { name?: string; email?: string; }
interface ApiErr { message?: string; errors?: Array<{ field: string; message: string }>; }

const init: FormData = { name: '', email: '', phone: '', company: '', jobTitle: '', status: 'new', source: 'website', notes: '' };

const LeadForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [formData, setFormData] = useState<FormData>(init);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const fetch = async () => {
        setIsLoading(true);
        try {
          const res = await api.getLead(id);
          const l = res.data.lead;
          setFormData({ name: l.name, email: l.email, phone: l.phone || '', company: l.company || '', jobTitle: l.jobTitle || '', status: l.status, source: l.source, notes: l.notes || '' });
        } catch (err: unknown) {
          toast.error((err as AxiosError<ApiErr>).response?.data?.message || 'Failed to fetch lead');
          navigate('/leads');
        } finally { setIsLoading(false); }
      };
      fetch();
    }
  }, [isEdit, id, navigate]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!formData.email.trim() || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) e.email = 'Valid email is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the form errors'); return; }
    setIsSubmitting(true);
    try {
      if (isEdit && id) {
        await api.updateLead(id, formData);
        toast.success('Lead updated successfully');
        navigate(`/leads/${id}`);
      } else {
        const res = await api.createLead(formData);
        toast.success('Lead created successfully');
        navigate(`/leads/${res.data.lead._id}`);
      }
    } catch (err: unknown) {
      const axErr = err as AxiosError<ApiErr>;
      const srvErrs = axErr.response?.data?.errors;
      if (srvErrs) { const fe: FormErrors = {}; srvErrs.forEach((x) => { fe[x.field as keyof FormErrors] = x.message; }); setErrors(fe); }
      toast.error(axErr.response?.data?.message || 'Failed to save lead');
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#FFB300]" /></div>;

  const inputCls = (err?: string) => `mt-1.5 h-10 dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white ${err ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : 'border-[#E5E7EB] focus-visible:ring-[#FFB300]'}`;
  const lblCls = 'text-sm font-medium text-[#111111] dark:text-white';
  const selCls = 'mt-1.5 h-10 border-[#E5E7EB] dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white focus:ring-[#FFB300]';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(isEdit && id ? `/leads/${id}` : '/leads')} className="h-9 w-9 p-0 text-[#6B7280] hover:text-[#111111] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"><ArrowLeft size={18} /></Button>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-white">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111111] rounded-xl p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]" style={{ animation: 'fadeScale 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards', opacity: 0 }}>
        <div className="space-y-5">
          <div>
            <Label htmlFor="name" className={lblCls}>Name <span className="text-[#EF4444]">*</span></Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="John Doe" className={inputCls(errors.name)} />
            {errors.name && <p className="text-xs text-[#EF4444] mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email" className={lblCls}>Email <span className="text-[#EF4444]">*</span></Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="john@example.com" className={inputCls(errors.email)} />
            {errors.email && <p className="text-xs text-[#EF4444] mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="phone" className={lblCls}>Phone</Label><Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+91 98765 43210" className={inputCls()} /></div>
            <div><Label htmlFor="company" className={lblCls}>Company</Label><Input id="company" value={formData.company} onChange={(e) => handleChange('company', e.target.value)} placeholder="Acme Inc" className={inputCls()} /></div>
          </div>

          <div><Label htmlFor="jobTitle" className={lblCls}>Job Title</Label><Input id="jobTitle" value={formData.jobTitle} onChange={(e) => handleChange('jobTitle', e.target.value)} placeholder="Product Manager" className={inputCls()} /></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className={lblCls}>Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger className={selCls}><SelectValue /></SelectTrigger>
                <SelectContent>{LEAD_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className={lblCls}>Source</Label>
              <Select value={formData.source} onValueChange={(v) => handleChange('source', v as LeadSource)}>
                <SelectTrigger className={selCls}><SelectValue /></SelectTrigger>
                <SelectContent>{LEAD_SOURCE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className={lblCls}>Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Add any additional notes..." rows={4} className="mt-1.5 border-[#E5E7EB] dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white focus-visible:ring-[#FFB300] resize-none" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
          <Button type="button" variant="outline" onClick={() => navigate(isEdit && id ? `/leads/${id}` : '/leads')} className="border-[#E5E7EB] dark:border-[#2A2A2A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]">Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#FFB300] text-black hover:bg-[#FFA000] rounded-full px-6 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70">
            {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" />Saving...</> : isEdit ? 'Update Lead' : 'Save Lead'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
