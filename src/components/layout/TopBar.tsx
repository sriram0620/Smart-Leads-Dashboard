import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Menu, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/leads')) return 'Leads';
  if (pathname === '/analytics') return 'Analytics';
  return 'LeadFlow';
};

interface TopBarProps {
  onAddLead?: () => void;
  onMenuToggle?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onAddLead, onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const title = getPageTitle(location.pathname);
  const showAddButton = location.pathname !== '/analytics' && location.pathname !== '/login';

  return (
    <header className="h-16 bg-white dark:bg-[#111111] border-b border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-[#6B7280] hover:text-[#111111] dark:text-gray-400 dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <h1
          className="text-xl md:text-[32px] font-bold text-[#111111] dark:text-white leading-tight"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9 p-0 text-[#6B7280] hover:text-[#111111] dark:text-gray-400 dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        {showAddButton && (
          <Button
            onClick={() => onAddLead ? onAddLead() : navigate('/leads/add')}
            className="bg-[#FFB300] text-black hover:bg-[#FFA000] hover:shadow-[0_0_20px_rgba(255,179,0,0.15)] rounded-full px-3 md:px-5 py-2 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} className="mr-0 md:mr-1.5" />
            <span className="hidden md:inline">Add Lead</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
