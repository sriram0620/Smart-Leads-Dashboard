import React from 'react';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No leads found',
  description = 'Get started by adding your first lead',
  actionLabel = 'Add Lead',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
        <SearchX size={32} className="text-[#6B7280]" />
      </div>
      <h3 className="text-lg font-semibold text-[#111111] mb-2">{title}</h3>
      <p className="text-sm text-[#6B7280] mb-6 text-center max-w-sm">{description}</p>
      {onAction && (
        <Button
          onClick={onAction}
          className="bg-[#FFB300] text-black hover:bg-[#FFA000] rounded-full px-5 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
