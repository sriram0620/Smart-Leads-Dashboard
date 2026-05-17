import React from 'react';
import type { LeadSource } from '@/types';
import { Globe, Instagram, Users } from 'lucide-react';

interface SourceBadgeProps {
  source: LeadSource;
}

const sourceConfig: Record<LeadSource, { label: string; icon: React.ElementType }> = {
  website: { label: 'Website', icon: Globe },
  instagram: { label: 'Instagram', icon: Instagram },
  referral: { label: 'Referral', icon: Users },
};

const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  const config = sourceConfig[source];
  if (!config) return <span className="text-sm text-[#6B7280] dark:text-gray-400">{source}</span>;

  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1.5 text-[#6B7280] dark:text-gray-400 text-sm">
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default SourceBadge;
