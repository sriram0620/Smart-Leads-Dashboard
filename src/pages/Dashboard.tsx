import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import StatusBadge from '@/components/shared/StatusBadge';
import SourceBadge from '@/components/shared/SourceBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Users, UserCheck, UserPlus, TrendingUp, ArrowRight } from 'lucide-react';
import type { Lead, AnalyticsSummary } from '@/types';
import { format } from 'date-fns';

const COLORS = ['#FFB300', '#3B82F6', '#8B5CF6', '#10B981', '#6B7280'];
const STATUS_COLORS: Record<string, string> = {
  new: '#3B82F6',
  contacted: '#8B5CF6',
  qualified: '#10B981',
  lost: '#6B7280',
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  change?: string;
  isLoading: boolean;
  suffix?: string;
}

const AnimatedNumber: React.FC<{ value: number; duration?: number; suffix?: string }> = ({ value, duration = 800, suffix = '' }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) { setDisplay(0); return; }
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{display.toLocaleString()}{suffix}</span>;
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, change, isLoading, suffix }) => (
  <div
    className="bg-white dark:bg-[#111111] rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-shadow duration-300"
    style={{
      animation: 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      opacity: 0,
    }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-medium text-[#6B7280] dark:text-gray-400 uppercase tracking-wide">{label}</span>
      <Icon size={20} className="text-[#6B7280] dark:text-gray-500" />
    </div>
    {isLoading ? (
      <Skeleton className="h-12 w-24" />
    ) : (
      <>
        <div className="text-[48px] font-bold text-[#111111] dark:text-white leading-none mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {typeof value === 'number' ? <AnimatedNumber value={value} suffix={suffix} /> : value}
        </div>
        {change && (
          <div className="flex items-center gap-1 text-xs font-medium text-[#10B981]">
            <TrendingUp size={14} />
            {change}
          </div>
        )}
      </>
    )}
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, leadsRes] = await Promise.all([
          api.getSummary(),
          api.getLeads({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        ]);
        setAnalytics(analyticsRes.data);
        setRecentLeads(leadsRes.data.leads);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Leads', value: analytics?.totalLeads || 0, icon: Users, change: `${analytics?.recentLeads || 0} in last 30 days` },
    { label: 'Contacted', value: analytics?.contactedLeads || 0, icon: UserPlus },
    { label: 'Qualified', value: analytics?.qualifiedLeads || 0, icon: UserCheck },
    { label: 'Conversion Rate', value: analytics?.conversionRate || 0, icon: TrendingUp, suffix: '%' },
  ];

  const sourceData = analytics?.leadsBySource.map((item) => ({
    name: item.label || item.source,
    count: item.count,
  })) || [];

  const statusData = analytics?.leadsByStatus.map((item) => ({
    name: item.label || item.status,
    value: item.count,
    fill: STATUS_COLORS[item.status] || '#6B7280',
  })) || [];

  const tooltipStyle = {
    background: '#111111',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div key={stat.label} style={{ animationDelay: `${index * 100}ms` }}>
            <StatCard {...stat} isLoading={isLoading} />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart */}
        <div
          className="lg:col-span-3 bg-white dark:bg-[#111111] rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
          style={{
            animation: 'fadeScale 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards',
            opacity: 0,
          }}
        >
          <h2 className="text-lg font-semibold text-[#111111] dark:text-white mb-6">Lead Sources</h2>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sourceData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#FFB300" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data available" description="Add leads to see source analytics" />
          )}
        </div>

        {/* Pie Chart */}
        <div
          className="lg:col-span-2 bg-white dark:bg-[#111111] rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
          style={{
            animation: 'fadeScale 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.6s forwards',
            opacity: 0,
          }}
        >
          <h2 className="text-lg font-semibold text-[#111111] dark:text-white mb-6">Lead Status Overview</h2>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-[#6B7280] dark:text-gray-400">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data available" description="Add leads to see status overview" />
          )}
        </div>
      </div>

      {/* Recent Leads Table */}
      <div
        className="bg-white dark:bg-[#111111] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] overflow-hidden"
        style={{
          animation: 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.7s forwards',
          opacity: 0,
        }}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
          <h2 className="text-lg font-semibold text-[#111111] dark:text-white">Recent Leads</h2>
          <button
            onClick={() => navigate('/leads')}
            className="text-sm font-medium text-[#FFB300] hover:text-[#FFA000] flex items-center gap-1 transition-colors"
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : recentLeads.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB] dark:bg-[#0A0A0A]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Company</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Source</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead, index) => (
                  <tr
                    key={lead._id}
                    className="border-b border-[#E5E7EB] dark:border-[#2A2A2A] hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] cursor-pointer transition-colors duration-150"
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    style={{
                      animation: 'slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                      opacity: 0,
                      animationDelay: `${0.8 + index * 50}ms`,
                    }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#111111] dark:text-white">{lead.name}</p>
                        <p className="text-xs text-[#6B7280] dark:text-gray-400">{lead.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280] dark:text-gray-400 hidden sm:table-cell">{lead.company || '-'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <SourceBadge source={lead.source} />
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280] dark:text-gray-400 hidden lg:table-cell">
                      {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
