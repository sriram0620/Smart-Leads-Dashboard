import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { Users, UserCheck, UserPlus, UserX, TrendingUp, Target, ArrowUpRight } from 'lucide-react';
import type { AnalyticsSummary, LeadStatus } from '@/types';

const COLORS = ['#FFB300', '#3B82F6', '#8B5CF6', '#10B981', '#6B7280'];
const STATUS_COLORS: Record<string, string> = { new: '#3B82F6', contacted: '#8B5CF6', qualified: '#10B981', lost: '#6B7280' };

interface StatCardProps { label: string; value: number | string; icon: React.ElementType; color: string; isLoading: boolean; suffix?: string; }

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, isLoading, suffix }) => (
  <div className="bg-white dark:bg-[#111111] rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}><Icon size={20} style={{ color }} /></div>
      <ArrowUpRight size={16} className="text-[#10B981]" />
    </div>
    {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold text-[#111111] dark:text-white">{typeof value === 'number' ? `${value.toLocaleString()}${suffix || ''}` : value}</p>}
    <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-1">{label}</p>
  </div>
);

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try { const res = await api.getSummary(); setAnalytics(res.data); }
      catch (error) { console.error('Error fetching analytics:', error); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Leads', value: analytics?.totalLeads || 0, icon: Users, color: '#FFB300' },
    { label: 'New Leads', value: analytics?.newLeads || 0, icon: UserPlus, color: '#3B82F6' },
    { label: 'Contacted', value: analytics?.contactedLeads || 0, icon: Target, color: '#8B5CF6' },
    { label: 'Qualified', value: analytics?.qualifiedLeads || 0, icon: UserCheck, color: '#10B981' },
    { label: 'Lost', value: analytics?.lostLeads || 0, icon: UserX, color: '#EF4444' },
    { label: 'Conversion Rate', value: analytics?.conversionRate || 0, icon: TrendingUp, color: '#10B981', suffix: '%' },
  ];

  const sourceData = analytics?.leadsBySource.map((item) => ({ name: item.label || item.source, count: item.count })) || [];

  const trendData = [
    { month: 'Jan', leads: 12, qualified: 3 }, { month: 'Feb', leads: 18, qualified: 5 },
    { month: 'Mar', leads: 25, qualified: 8 }, { month: 'Apr', leads: 32, qualified: 10 },
    { month: 'May', leads: 28, qualified: 12 }, { month: 'Jun', leads: 35, qualified: 15 },
  ];

  const tooltipStyle = { background: '#111111', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px' };
  const cc = 'bg-white dark:bg-[#111111] rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} isLoading={isLoading} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cc}>
          <h2 className="text-lg font-semibold text-[#111111] dark:text-white mb-6">Lead Trends</h2>
          {isLoading ? <Skeleton className="h-[280px] w-full" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FFB300" stopOpacity={0.2} /><stop offset="95%" stopColor="#FFB300" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="leads" stroke="#FFB300" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} />
                <Area type="monotone" dataKey="qualified" stroke="#10B981" fillOpacity={1} fill="url(#colorQualified)" strokeWidth={2} />
                <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs text-[#6B7280] dark:text-gray-400">{v === 'leads' ? 'New Leads' : 'Qualified'}</span>} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={cc}>
          <h2 className="text-lg font-semibold text-[#111111] dark:text-white mb-6">Source Distribution</h2>
          {isLoading ? <Skeleton className="h-[280px] w-full" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="count" nameKey="name">
                  {sourceData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs text-[#6B7280] dark:text-gray-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={cc}>
        <h2 className="text-lg font-semibold text-[#111111] dark:text-white mb-4">Status Breakdown</h2>
        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="space-y-3">
            {analytics?.leadsByStatus.map((item) => {
              const pct = analytics.totalLeads > 0 ? Math.round((item.count / analytics.totalLeads) * 100) : 0;
              return (
                <div key={item.status} className="flex items-center gap-4">
                  <div className="w-24"><StatusBadge status={item.status as LeadStatus} /></div>
                  <div className="flex-1"><div className="h-2 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[item.status] || '#6B7280' }} /></div></div>
                  <div className="w-20 text-right"><span className="text-sm font-medium text-[#111111] dark:text-white">{item.count}</span><span className="text-xs text-[#6B7280] dark:text-gray-400 ml-1">({pct}%)</span></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
