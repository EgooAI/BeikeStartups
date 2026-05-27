'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi, recruitmentApi, applicationApi, eventApi, resourceApi, adminApi, roleApi } from '@/lib/api';
import Link from 'next/link';
import {
  UserOutlined,
  ProjectOutlined,
  SafetyOutlined,
  CalendarOutlined,
  BuildOutlined,
  TeamOutlined,
  RightOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    pendingApplications: 0,
    pendingVerifications: 0,
    totalEvents: 0,
    totalRecruitments: 0,
    totalResources: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const results = await Promise.allSettled([
        adminApi.listUsers(),
        projectApi.list(),
        applicationApi.list(),
        roleApi.listRequests(),
        eventApi.list(),
        recruitmentApi.list(),
        resourceApi.list(),
      ]);

      const newStats = { ...stats };

      if (results[0].status === 'fulfilled' && results[0].value.data) {
        const data = results[0].value.data as any;
        newStats.totalUsers = data.items?.length || data.length || 0;
      }
      if (results[1].status === 'fulfilled' && results[1].value.data) {
        const data = results[1].value.data as any;
        newStats.totalProjects = data.items?.length || 0;
      }
      if (results[2].status === 'fulfilled' && results[2].value.data) {
        const data = results[2].value.data as any;
        const apps = Array.isArray(data) ? data : data.items || [];
        newStats.pendingApplications = apps.filter((a: any) => a.status === 'pending').length;
      }
      if (results[3].status === 'fulfilled' && results[3].value.data) {
        const data = results[3].value.data as any;
        const requests = Array.isArray(data) ? data : data.items || [];
        newStats.pendingVerifications = requests.filter((r: any) => r.status === 'pending').length;
      }
      if (results[4].status === 'fulfilled' && results[4].value.data) {
        const data = results[4].value.data as any;
        newStats.totalEvents = data.items?.length || 0;
      }
      if (results[5].status === 'fulfilled' && results[5].value.data) {
        const data = results[5].value.data as any;
        newStats.totalRecruitments = data.items?.length || 0;
      }
      if (results[6].status === 'fulfilled' && results[6].value.data) {
        const data = results[6].value.data as any;
        newStats.totalResources = data.items?.length || 0;
      }

      setStats(newStats);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: '用户总数', value: stats.totalUsers, icon: <UserOutlined />, color: 'bg-blue-500', href: '/admin/users' },
    { label: '项目总数', value: stats.totalProjects, icon: <ProjectOutlined />, color: 'bg-purple-500', href: '/admin/projects' },
    { label: '待审申请', value: stats.pendingApplications, icon: <ClockCircleOutlined />, color: 'bg-amber-500', href: '/admin/verifications' },
    { label: '待审认证', value: stats.pendingVerifications, icon: <SafetyOutlined />, color: 'bg-red-500', href: '/admin/verifications' },
    { label: '活动数量', value: stats.totalEvents, icon: <CalendarOutlined />, color: 'bg-green-500', href: '/admin/events' },
    { label: '招募数量', value: stats.totalRecruitments, icon: <TeamOutlined />, color: 'bg-orange-500', href: '/admin/verifications' },
    { label: '资源数量', value: stats.totalResources, icon: <BuildOutlined />, color: 'bg-teal-500', href: '/admin/resources' },
  ];

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a2a5c]">管理仪表板</h1>
        <p className="text-gray-500 mt-1">欢迎回来，{user?.nickname || user?.username}。以下是平台运营概览。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            className="bg-white rounded-xl shadow-custom border border-gray-100 p-5 hover:shadow-custom-lg transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-[#0a2a5c]">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center text-white shadow-sm`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400 group-hover:text-[#0a2a5c] transition-colors flex items-center">
              查看详情 <RightOutlined className="ml-1 text-xs" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-custom border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#0a2a5c] mb-4">快捷操作</h2>
          <div className="space-y-3">
            <Link
              href="/admin/verifications"
              className="flex items-center justify-between p-4 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <SafetyOutlined />
                <span className="font-medium">审核身份认证</span>
              </div>
              {stats.pendingVerifications > 0 && (
                <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded-full font-medium">
                  {stats.pendingVerifications} 条待审
                </span>
              )}
            </Link>
            <Link
              href="/admin/verifications"
              className="flex items-center justify-between p-4 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ProjectOutlined />
                <span className="font-medium">审核项目上架</span>
              </div>
              {stats.pendingApplications > 0 && (
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                  {stats.pendingApplications} 条待审
                </span>
              )}
            </Link>
            <Link
              href="/admin/events"
              className="flex items-center justify-between p-4 rounded-lg bg-green-50 text-green-800 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <CalendarOutlined />
                <span className="font-medium">发布新活动</span>
              </div>
              <ArrowRightOutlined className="text-xs" />
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center justify-between p-4 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <UserOutlined />
                <span className="font-medium">管理用户</span>
              </div>
              <ArrowRightOutlined className="text-xs" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-custom border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#0a2a5c] mb-4">平台概况</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">注册用户</span>
              <span className="font-semibold text-[#0a2a5c]">{stats.totalUsers} 人</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">认证项目</span>
              <span className="font-semibold text-[#0a2a5c]">{stats.totalProjects} 个</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">招募信息</span>
              <span className="font-semibold text-[#0a2a5c]">{stats.totalRecruitments} 条</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">创业活动</span>
              <span className="font-semibold text-[#0a2a5c]">{stats.totalEvents} 场</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">资源合作</span>
              <span className="font-semibold text-[#0a2a5c]">{stats.totalResources} 条</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}