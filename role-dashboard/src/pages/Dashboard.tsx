import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserPlus, Activity } from 'lucide-react';
import { api } from '@/api/client';
import { DashboardStats } from '@/types';
import { UserGrowthChart } from '@/components/charts/UserGrowthChart';
import { RoleDistributionChart } from '@/components/charts/RoleDistributionChart';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-100' },
    { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, bgColor: 'bg-green-50', textColor: 'text-green-600', borderColor: 'border-green-100' },
    { label: 'New This Month', value: stats.newUsersThisMonth, icon: UserPlus, bgColor: 'bg-purple-50', textColor: 'text-purple-600', borderColor: 'border-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2 text-base">Overview of your system and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`bg-white rounded-xl border border-gray-200 ${stat.borderColor} p-6 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Growth</h3>
          <p className="text-sm text-gray-500 mb-4">Monthly user activity trends</p>
          <UserGrowthChart data={stats.monthlyGrowth} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Role Distribution</h3>
          <p className="text-sm text-gray-500 mb-4">User distribution by role</p>
          <RoleDistributionChart data={stats.roleDistribution} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
        <p className="text-sm text-gray-500 mb-4">Latest system activities</p>
        <div className="space-y-4">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500 mt-0.5">by {activity.user}</p>
              </div>
              <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                {new Date(activity.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};