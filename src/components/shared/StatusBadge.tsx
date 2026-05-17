import React from 'react';
import type { LeadStatus } from '@/types';

interface StatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<LeadStatus, { label: string; bg: string; text: string }> = {
  new: { label: 'New', bg: 'bg-[rgba(59,130,246,0.1)]', text: 'text-[#3B82F6]' },
  in_progress: { label: 'In Progress', bg: 'bg-[rgba(139,92,246,0.1)]', text: 'text-[#8B5CF6]' },
  converted: { label: 'Converted', bg: 'bg-[rgba(16,184,129,0.1)]', text: 'text-[#10B981]' },
  lost: { label: 'Lost', bg: 'bg-[rgba(107,114,128,0.1)]', text: 'text-[#6B7280]' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = statusConfig[status];
  const sizeClasses = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.bg} ${config.text} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
