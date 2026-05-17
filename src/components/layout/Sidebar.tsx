import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, LogOut, Shield, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leads', label: 'Leads', icon: Users },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-[260px] bg-[#0A0A0A] flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="relative">
          <span className="text-white text-xl font-bold tracking-tight">LeadFlow</span>
          <span className="absolute -top-0.5 -right-2.5 w-2 h-2 rounded-full bg-[#FFB300]"></span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-white transition-colors"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-[#FFB300] bg-[#1A1A1A] border-l-[3px] border-[#FFB300]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <item.icon size={20} className={active ? 'text-[#FFB300]' : ''} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-[#2A2A2A]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-[#FFB300] flex items-center justify-center text-[#0A0A0A] font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <div className="flex items-center gap-1">
              {user?.role === 'admin' && <Shield size={10} className="text-[#FFB300]" />}
              <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 mt-1 w-full text-gray-400 hover:text-white hover:bg-[#1A1A1A] rounded-lg text-sm font-medium transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
