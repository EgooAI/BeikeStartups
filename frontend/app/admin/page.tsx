'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi, recruitmentApi, applicationApi, eventApi, resourceApi, adminApi, roleApi, teamApi } from '@/lib/api';
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
    totalTeams: 0,
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
        teamApi.list(),
      ]);

      const newStats = { ...stats };

      if (results[0].status === 'fulfilled' && results[0].value.data) {
        const data = results[0].value.data as { items?: unknown[]; length?: number };
        newStats.totalUsers = data.items?.length || data.length || 0;
      }
      if (results[1].status === 'fulfilled' && results[1].value.data) {
        const data = results[1].value.data as { items?: unknown[]; length?: number };
        newStats.totalProjects = data.items?.length || data.length || 0;
      }
      if (results[2].status === 'fulfilled' && results[2].value.data) {
        const data = results[2].value.data as { items?: unknown[]; length?: number };
        const apps = Array.isArray(data) ? data : data.items || [];
        newStats.pendingApplications = apps.filter((a: { status: string }) => a.status === 'pending').length;
      }
      if (results[3].status === 'fulfilled' && results[3].value.data) {
        const data = results[3].value.data as { items?: unknown[]; length?: number };
        const requests = Array.isArray(data) ? data : data.items || [];
        newStats.pendingVerifications = requests.filter((r: { status: string }) => r.status === 'pending').length;
      }
      if (results[4].status === 'fulfilled' && results[4].value.data) {
        const data = results[4].value.data as { items?: unknown[]; length?: number };
        newStats.totalEvents = data.items?.length || 0;
      }
      if (results[5].status === 'fulfilled' && results[5].value.data) {
        const data = results[5].value.data as { items?: unknown[]; length?: number };
        newStats.totalRecruitments = data.items?.length || 0;
      }
      if (results[6].status === 'fulfilled' && results[6].value.data) {
        const data = results[6].value.data as { items?: unknown[]; length?: number };
        newStats.totalResources = data.items?.length || 0;
      }
      if (results[7].status === 'fulfilled' && results[7].value.data) {
        const data = results[7].value.data as { items?: unknown[]; length?: number };
        newStats.totalTeams = data.items?.length || 0;
      }

      setStats(newStats);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: '用户总数', value: stats.totalUsers, icon: <UserOutlined />, color: 'from-[#00f0ff] to-[#00c8ff]', href: '/admin/users' },
    { label: '项目总数', value: stats.totalProjects, icon: <ProjectOutlined />, color: 'from-[#b347ea] to-[#d05eff]', href: '/admin/projects' },
    { label: '待审申请', value: stats.pendingApplications, icon: <ClockCircleOutlined />, color: 'from-[#ffb800] to-[#ff9500]', href: '/admin/verifications' },
    { label: '待审认证', value: stats.pendingVerifications, icon: <SafetyOutlined />, color: 'from-red-500 to-red-400', href: '/admin/verifications' },
    { label: '活动数量', value: stats.totalEvents, icon: <CalendarOutlined />, color: 'from-[#00ff88] to-[#00cc66]', href: '/admin/events' },
    { label: '招募数量', value: stats.totalRecruitments, icon: <TeamOutlined />, color: 'from-orange-500 to-orange-400', href: '/admin/verifications' },
    { label: '资源数量', value: stats.totalResources, icon: <BuildOutlined />, color: 'from-teal-500 to-teal-400', href: '/admin/resources' },
    { label: '团队数量', value: stats.totalTeams, icon: <TeamOutlined />, color: 'from-[#00f0ff] to-[#b347ea]', href: '/admin/teams' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-start pt-20 bg-[#050510]">
        <div className="relative flex justify-center items-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/[0.06] border-t-[#00f0ff] animate-spin" />
          <div className="absolute w-7 h-7 rounded-full border-4 border-white/[0.04] border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">管理仪表板</h1>
        <p className="text-gray-400 mt-1">欢迎回来，{user?.nickname || user?.username}。以下是平台运营概览。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{card.label}</p>
                <p className="text-3xl font-black tracking-tight text-white">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-[#050510]`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500 group-hover:text-[#00f0ff] transition-colors flex items-center">
              查看详情 <RightOutlined className="ml-1 text-xs" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-lg font-black tracking-tight text-white mb-4">快捷操作</h2>
          <div className="space-y-3">
            <Link
              href="/admin/verifications"
              className="flex items-center justify-between p-4 rounded-xl bg-[#ffb800]/10 text-[#ffb800] hover:bg-[#ffb800]/20 transition-all duration-300 hover:-translate-y-0.5 border border-[#ffb800]/10"
            >
              <div className="flex items-center space-x-3">
                <SafetyOutlined />
                <span className="font-medium">审核身份认证</span>
              </div>
              {stats.pendingVerifications > 0 && (
                <span className="px-2 py-1 bg-[#ffb800] text-[#050510] text-xs rounded-full font-bold">
                  {stats.pendingVerifications} 条待审
                </span>
              )}
            </Link>
            <Link
              href="/admin/verifications"
              className="flex items-center justify-between p-4 rounded-xl bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20 transition-all duration-300 hover:-translate-y-0.5 border border-[#00f0ff]/10"
            >
              <div className="flex items-center space-x-3">
                <ProjectOutlined />
                <span className="font-medium">审核项目上架</span>
              </div>
              {stats.pendingApplications > 0 && (
                <span className="px-2 py-1 bg-[#00f0ff] text-[#050510] text-xs rounded-full font-bold">
                  {stats.pendingApplications} 条待审
                </span>
              )}
            </Link>
            <Link
              href="/admin/events"
              className="flex items-center justify-between p-4 rounded-xl bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all duration-300 hover:-translate-y-0.5 border border-[#00ff88]/10"
            >
              <div className="flex items-center space-x-3">
                <CalendarOutlined />
                <span className="font-medium">发布新活动</span>
              </div>
              <ArrowRightOutlined className="text-xs" />
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center justify-between p-4 rounded-xl bg-[#b347ea]/10 text-[#b347ea] hover:bg-[#b347ea]/20 transition-all duration-300 hover:-translate-y-0.5 border border-[#b347ea]/10"
            >
              <div className="flex items-center space-x-3">
                <UserOutlined />
                <span className="font-medium">管理用户</span>
              </div>
              <ArrowRightOutlined className="text-xs" />
            </Link>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-lg font-black tracking-tight text-white mb-4">平台概况</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
              <span className="text-sm text-gray-400">注册用户</span>
              <span className="font-semibold text-white">{stats.totalUsers} 人</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
              <span className="text-sm text-gray-400">认证项目</span>
              <span className="font-semibold text-white">{stats.totalProjects} 个</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
              <span className="text-sm text-gray-400">招募信息</span>
              <span className="font-semibold text-white">{stats.totalRecruitments} 条</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
              <span className="text-sm text-gray-400">创业活动</span>
              <span className="font-semibold text-white">{stats.totalEvents} 场</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
              <span className="text-sm text-gray-400">资源合作</span>
              <span className="font-semibold text-white">{stats.totalResources} 条</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
              <span className="text-sm text-gray-400">创业团队</span>
              <span className="font-semibold text-white">{stats.totalTeams} 个</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
