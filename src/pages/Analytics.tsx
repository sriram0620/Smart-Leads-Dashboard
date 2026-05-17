import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  TrendingUp,
  Target,
  ArrowUpRight,
} from 'lucide-react';
import type { AnalyticsSummary } from '@/types';

const COLORS = ['#FFB300', '#3B82F6', '#8B5CF6', '#10B981', '#6B7280'];
const STATUS_COLORS = { new: '#3B82F6', in_progress: '#8B5CF6', converted: '#10B981', lost: '#6B7280' };

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, isLoading, suffix }) => (
  <div className="bg-white rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <ArrowUpRight size={16} className="text-[#10B981]" />
    </div>
    {isLoading ? (
      <Skeleton className="h-8 w-16" />
    ) : (
      <p className="text-2xl font-bold text-[#111111]">
        {typeof value === 'number' ? `${value.toLocaleString()}${suffix || ''}` : value}
      </p>
    )}
    <p className="text-xs text-[#6B7280] mt-1">{label}</p>
  </div>
);

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getSummary();
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Leads', value: analytics?.totalLeads || 0, icon: Users, color: '#FFB300' },
    { label: 'New Leads', value: analytics?.newLeads || 0, icon: UserPlus, color: '#3B82F6' },
    { label: 'In Progress', value: analytics?.inProgressLeads || 0, icon: Target, color: '#8B5CF6' },
    { label: 'Converted', value: analytics?.convertedLeads || 0, icon: UserCheck, color: '#10B981' },
    { label: 'Lost', value: analytics?.lostLeads || 0, icon: UserX, color: '#EF4444' },
    { label: 'Conversion Rate', value: analytics?.conversionRate || 0, icon: TrendingUp, color: '#10B981', suffix: '%' },
  ];

  const sourceData = analytics?.leadsBySource.map((item) => ({
    name: item.source === 'social_media' ? 'Social Media' : item.source.charAt(0).toUpperCase() + item.source.slice(1),
    count: item.count,
  })) || [];

  // Mock trend data
  const trendData = [
    { month: 'Jan', leads: 12, converted: 3 },
    { month: 'Feb', leads: 18, converted: 5 },
    { month: 'Mar', leads: 25, converted: 8 },
    { month: 'Apr', leads: 32, converted: 10 },
    { month: 'May', leads: 28, converted: 12 },
    { month: 'Jun', leads: 35, converted: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Trends */}
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-[#111111] mb-6">Lead Trends</h2>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB300" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FFB300" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#111111',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
                <Area type="monotone" dataKey="leads" stroke="#FFB300" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} />
                <Area type="monotone" dataKey="converted" stroke="#10B981" fillOpacity={1} fill="url(#colorConverted)" strokeWidth={2} />
                <Legend iconType="circle" iconSize={8} formatter={(value: string) => <span className="text-xs text-[#6B7280]">{value === 'leads' ? 'New Leads' : 'Converted'}</span>} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Source Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-[#111111] mb-6">Source Distribution</h2>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                >
                  {sourceData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#111111',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
                <Legend iconType="circle" iconSize={8} formatter={(value: string) => <span className="text-xs text-[#6B7280]">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status Breakdown Table */}
      <div className="bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-[#111111] mb-4">Status Breakdown</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {analytics?.leadsByStatus.map((item) => {
              const percentage = analytics.totalLeads > 0
                ? Math.round((item.count / analytics.totalLeads) * 100)
                : 0;
              return (
                <div key={item.status} className="flex items-center gap-4">
                  <div className="w-24">
                    <StatusBadge status={item.status as 'new' | 'in_progress' | 'converted' | 'lost'} />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || '#6B7280',
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-medium text-[#111111]">{item.count}</span>
                    <span className="text-xs text-[#6B7280] ml-1">({percentage}%)</span>
                  </div>
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
