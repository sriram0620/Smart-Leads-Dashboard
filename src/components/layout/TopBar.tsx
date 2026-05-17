import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/leads')) return 'Leads';
  if (pathname === '/analytics') return 'Analytics';
  if (pathname === '/login') return 'Login';
  return 'LeadFlow';
};

interface TopBarProps {
  onAddLead?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onAddLead }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = getPageTitle(location.pathname);
  const showAddButton = location.pathname !== '/analytics' && location.pathname !== '/login';

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 sticky top-0 z-40">
      <h1 className="text-[32px] font-bold text-[#111111] leading-tight" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {title}
      </h1>

      {showAddButton && (
        <Button
          onClick={() => onAddLead ? onAddLead() : navigate('/leads/add')}
          className="bg-[#FFB300] text-black hover:bg-[#FFA000] hover:shadow-[0_0_20px_rgba(255,179,0,0.15)] rounded-full px-5 py-2 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} className="mr-1.5" />
          Add Lead
        </Button>
      )}
    </header>
  );
};

export default TopBar;
