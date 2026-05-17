import React from 'react';
import type { LeadSource } from '@/types';
import { Globe, Share2, Users, Mail, MousePointer } from 'lucide-react';

interface SourceBadgeProps {
  source: LeadSource;
}

const sourceConfig: Record<LeadSource, { label: string; icon: React.ElementType }> = {
  website: { label: 'Website', icon: Globe },
  social_media: { label: 'Social Media', icon: Share2 },
  referral: { label: 'Referral', icon: Users },
  email: { label: 'Email', icon: Mail },
  direct: { label: 'Direct', icon: MousePointer },
};

const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1.5 text-[#6B7280] text-sm">
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default SourceBadge;
