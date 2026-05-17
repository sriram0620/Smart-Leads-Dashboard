import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { LeadStatus, LeadSource } from '@/types';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  status: LeadStatus;
  source: LeadSource;
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  status?: string;
  source?: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  status: 'new',
  source: 'website',
  notes: '',
};

const LeadForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const fetchLead = async () => {
        setIsLoading(true);
        try {
          const response = await api.getLead(id);
          const lead = response.data.lead;
          setFormData({
            name: lead.name,
            email: lead.email,
            phone: lead.phone || '',
            company: lead.company || '',
            jobTitle: lead.jobTitle || '',
            status: lead.status,
            source: lead.source,
            notes: lead.notes || '',
          });
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to fetch lead');
          navigate('/leads');
        } finally {
          setIsLoading(false);
        }
      };
      fetchLead();
    }
  }, [isEdit, id, navigate]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email.trim() || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && id) {
        await api.updateLead(id, formData);
        toast.success('Lead updated successfully');
        navigate(`/leads/${id}`);
      } else {
        const response = await api.createLead(formData);
        toast.success('Lead created successfully');
        navigate(`/leads/${response.data.lead._id}`);
      }
    } catch (error: any) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        const formErrors: FormErrors = {};
        serverErrors.forEach((err: { field: string; message: string }) => {
          formErrors[err.field as keyof FormErrors] = err.message;
        });
        setErrors(formErrors);
      }
      toast.error(error.response?.data?.message || 'Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFB300]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(isEdit && id ? `/leads/${id}` : '/leads')}
          className="h-9 w-9 p-0 text-[#6B7280] hover:text-[#111111] hover:bg-[#F5F5F5]"
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold text-[#111111]">
          {isEdit ? 'Edit Lead' : 'Add New Lead'}
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
        style={{
          animation: 'fadeScale 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          opacity: 0,
        }}
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-[#111111]">
              Name <span className="text-[#EF4444]">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              className={`mt-1.5 h-10 ${errors.name ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : 'border-[#E5E7EB] focus-visible:ring-[#FFB300]'}`}
            />
            {errors.name && <p className="text-xs text-[#EF4444] mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-[#111111]">
              Email <span className="text-[#EF4444]">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
              className={`mt-1.5 h-10 ${errors.email ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : 'border-[#E5E7EB] focus-visible:ring-[#FFB300]'}`}
            />
            {errors.email && <p className="text-xs text-[#EF4444] mt-1">{errors.email}</p>}
          </div>

          {/* Phone & Company Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-[#111111]">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1.5 h-10 border-[#E5E7EB] focus-visible:ring-[#FFB300]"
              />
            </div>
            <div>
              <Label htmlFor="company" className="text-sm font-medium text-[#111111]">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Acme Inc"
                className="mt-1.5 h-10 border-[#E5E7EB] focus-visible:ring-[#FFB300]"
              />
            </div>
          </div>

          {/* Job Title */}
          <div>
            <Label htmlFor="jobTitle" className="text-sm font-medium text-[#111111]">Job Title</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder="Product Manager"
              className="mt-1.5 h-10 border-[#E5E7EB] focus-visible:ring-[#FFB300]"
            />
          </div>

          {/* Status & Source Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[#111111]">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger className="mt-1.5 h-10 border-[#E5E7EB] focus:ring-[#FFB300]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-[#111111]">Source</Label>
              <Select value={formData.source} onValueChange={(value) => handleChange('source', value as LeadSource)}>
                <SelectTrigger className="mt-1.5 h-10 border-[#E5E7EB] focus:ring-[#FFB300]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-[#111111]">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any additional notes..."
              rows={4}
              className="mt-1.5 border-[#E5E7EB] focus-visible:ring-[#FFB300] resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-[#E5E7EB]">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isEdit && id ? `/leads/${id}` : '/leads')}
            className="border-[#E5E7EB] hover:bg-[#F5F5F5]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#FFB300] text-black hover:bg-[#FFA000] rounded-full px-6 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              isEdit ? 'Update Lead' : 'Save Lead'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
