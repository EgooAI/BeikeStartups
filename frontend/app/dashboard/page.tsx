'use client';

import { useEffect, useState, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectApi, teamApi, recruitmentApi, applicationApi, responseApi, eventApi, resourceApi, connectionApi } from '@/lib/api';
import { Project, Team, TeamMember, TeamStatus, Recruitment, Application } from '@/types';
import { message } from 'antd';
import Link from 'next/link';
import {
  RocketOutlined,
  TeamOutlined,
  UserOutlined,
  FundOutlined,
  ExperimentOutlined,
  BuildOutlined,
  ProjectOutlined,
  FileTextOutlined,
  CalendarOutlined,
  HeartOutlined,
  MessageOutlined,
  SettingOutlined,
  RightOutlined,
  ArrowRightOutlined,
  SafetyOutlined,
  SolutionOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CrownOutlined,
  LinkOutlined,
  IdcardOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const roleConfig: Record<string, { label: string; color: string; icon: ComponentType<{ className?: string }>; bgLight: string; borderColor: string }> = {
  student: { label: '同学', color: 'from-blue-400 to-blue-600', icon: UserOutlined, bgLight: 'from-blue-50 to-blue-100/50', borderColor: 'border-blue-100' },
  team_member: { label: '团队成员', color: 'from-amber-400 to-amber-600', icon: TeamOutlined, bgLight: 'from-amber-50 to-amber-100/50', borderColor: 'border-amber-100' },
  team_owner: { label: '团队负责人', color: 'from-orange-400 to-orange-600', icon: RocketOutlined, bgLight: 'from-orange-50 to-orange-100/50', borderColor: 'border-orange-100' },
  investor: { label: '投资人', color: 'from-purple-400 to-purple-600', icon: FundOutlined, bgLight: 'from-purple-50 to-purple-100/50', borderColor: 'border-purple-100' },
  mentor: { label: '校外导师', color: 'from-green-400 to-green-600', icon: ExperimentOutlined, bgLight: 'from-green-50 to-green-100/50', borderColor: 'border-green-100' },
  partner: { label: '资源方', color: 'from-teal-400 to-teal-600', icon: BuildOutlined, bgLight: 'from-teal-50 to-teal-100/50', borderColor: 'border-teal-100' },
  admin: { label: '管理员', color: 'from-red-400 to-red-600', icon: SafetyOutlined, bgLight: 'from-red-50 to-red-100/50', borderColor: 'border-red-100' },
  super_admin: { label: '超级管理员', color: 'from-yellow-400 to-yellow-600', icon: SafetyOutlined, bgLight: 'from-yellow-50 to-yellow-100/50', borderColor: 'border-yellow-100' },
  // 团队内部角色（TeamMember.role）
  owner: { label: '负责人', color: 'from-amber-400 to-amber-600', icon: CrownOutlined, bgLight: 'from-amber-50 to-amber-100/50', borderColor: 'border-amber-100' },
  member: { label: '成员', color: 'from-blue-400 to-blue-600', icon: UserOutlined, bgLight: 'from-blue-50 to-blue-100/50', borderColor: 'border-blue-100' },
};

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [connectedProjects, setConnectedProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<TeamStatus>({} as TeamStatus);
  const [loading, setLoading] = useState(true);
  const [myTeam, setMyTeam] = useState<Team>({} as Team);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showDisbandModal, setShowDisbandModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  function normalizeData<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as { items: unknown }).items)) return (data as { items: T[] }).items;
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data)) return (data as { data: T[] }).data;
    return [];
  }

  async function loadAllData() {
    try {
      const promises = [
        projectApi.list(),
        teamApi.list(),
        applicationApi.list(),
      ];

      if (user?.role === 'team_owner') {
        promises.push(recruitmentApi.list(undefined, true));
      } else {
        promises.push(recruitmentApi.list());
      }

      if (user?.role === 'investor' || user?.role === 'mentor' || user?.role === 'partner') {
        promises.push(connectionApi.getMyConnectedProjects());
      }

      let teamMembersIndex = -1;
      if (user?.role === 'team_owner' || user?.role === 'team_member') {
        teamMembersIndex = promises.length;
        promises.push(teamApi.getMyMembers());
      }

      const results = await Promise.allSettled(promises);
      const [projRes, teamRes, appRes, recRes, connRes] = results as PromiseFulfilledResult<{ data: unknown }>[];

      if (projRes.status === 'fulfilled' && projRes.value.data) {
        setProjects(normalizeData(projRes.value.data));
      }
      if (teamRes.status === 'fulfilled' && teamRes.value.data) {
        setTeams(normalizeData(teamRes.value.data));
      }
      if (recRes.status === 'fulfilled' && recRes.value.data) {
        setRecruitments(normalizeData(recRes.value.data));
      }
      if (appRes.status === 'fulfilled' && appRes.value.data) {
        setApplications(normalizeData(appRes.value.data));
      }
      if (connRes?.status === 'fulfilled' && connRes.value.data) {
        setConnectedProjects(normalizeData(connRes.value.data));
      }
      if (teamMembersIndex >= 0 && results[teamMembersIndex].status === 'fulfilled') {
        const teamResData = (results[teamMembersIndex] as PromiseFulfilledResult<{ data: { team: Team; members: TeamMember[] } }>).value?.data;
        if (teamResData) {
          setMyTeam(teamResData.team);
          setTeamMembers(teamResData.members || []);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      requestAnimationFrame(() => {
        loadAllData();
      });
    }
  }, [user, authLoading]);

  async function handleDisbandTeam() {
    if (!myTeam) return;
    try {
      await teamApi.delete(myTeam.id);
      setShowDisbandModal(false);
      router.push('/dashboard');
      message.success('团队已解散');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '解散团队失败');
    }
  }

  async function handleLeaveTeam() {
    if (!myTeam) return;
    try {
      await teamApi.leave(myTeam.id);
      setShowLeaveModal(false);
      window.location.replace('/dashboard');
      message.success('已退出团队');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '退出团队失败');
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#f7f3ec] to-[#faf7f2]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-accent/30 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">正在加载中...</p>
      </div>
    );
  }

  if (!user) return null;

  const roleInfo = roleConfig[user.role] || roleConfig.student;
  const RoleIcon = roleInfo.icon;
  const isInvestorRole = user?.role === 'investor' || user?.role === 'mentor' || user?.role === 'partner';

  const activeRecruitments = recruitments.filter((r) => r.status === 'active');

  return (
    <div className="min-h-screen bg-[#f7f3ec]/50">
      {/* ═══════════════════════════════════════════════════════
            Header — 顶部欢迎区
          ═══════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-[#fefcf8] via-[#faf7f2] to-[#f5f0e8] border-b border-[#e8dfd0] overflow-hidden">
        {/* 背景纹理 */}
        <div className="absolute inset-0 bg-dot-matrix opacity-40" />
        <div className="absolute top-0 right-0 w-[20rem] h-[20rem] bg-amber-100/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[16rem] h-[16rem] bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* 头像/图标 */}
              <div className="relative">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${roleInfo.color} blur-xl opacity-40`} />
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center text-white text-2xl shadow-lg`}>
                  <RoleIcon />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
                  欢迎回来，{user.nickname || user.username}
                </h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${roleInfo.color} text-white shadow-sm`}>
                    <IdcardOutlined className="text-[10px]" />
                    {roleInfo.label}
                  </span>
                  <span className="text-sm text-gray-400">{user.email}</span>
                </div>
              </div>
            </div>
            {!isInvestorRole && (
              <div className="flex items-center gap-3">
                <Link
                  href="/projects/create"
                  className="group inline-flex items-center px-5 py-2.5 bg-accent-gradient text-primary font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-0.5 text-sm"
                >
                  <RocketOutlined className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                  发布项目
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ═══════════════════════════════════════════════════════
              Quick Stats — 快速统计
            ═══════════════════════════════════════════════════════ */}
        {!isInvestorRole && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
            <div className="stat-dashboard-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1 font-medium">项目总数</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">{projects.length}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ProjectOutlined className="text-blue-500 text-lg" />
                </div>
              </div>
            </div>
            <div className="stat-dashboard-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1 font-medium">团队数量</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">{teams.length}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TeamOutlined className="text-amber-500 text-lg" />
                </div>
              </div>
            </div>
            <div className="stat-dashboard-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1 font-medium">招募中</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">{activeRecruitments.length}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <SolutionOutlined className="text-purple-500 text-lg" />
                </div>
              </div>
            </div>
            <div className="stat-dashboard-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1 font-medium">申请记录</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">{applications.length}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileTextOutlined className="text-emerald-500 text-lg" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ═══════════════════════════════════════════════════════
                Main Content — 左侧主内容区
              ═══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* 团队项目 */}
            {(user?.role === 'team_owner' || user?.role === 'team_member') && (
              <div className="dashboard-panel overflow-hidden">
                <div className="px-6 py-5 border-b border-[#e8dfd0] flex items-center justify-between">
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <ProjectOutlined className="text-blue-500" />
                    </span>
                    团队项目
                  </h2>
                  <Link href="/my-projects" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                    查看全部 <RightOutlined className="text-xs" />
                  </Link>
                </div>
                <div className="p-4 sm:p-6">
                  {projects.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f5f0e8] flex items-center justify-center">
                        <RocketOutlined className="text-2xl text-[#d9cebb]" />
                      </div>
                      <p className="text-gray-400 text-sm font-medium">暂无项目</p>
                      <Link href="/projects/create" className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline mt-2">
                        发布第一个项目 <ArrowRightOutlined className="text-xs" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {projects.slice(0, 5).map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[#faf7f2] transition-all duration-200 group border border-transparent hover:border-[#e8dfd0]"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all duration-300">
                              <RocketOutlined className="text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary group-hover:text-accent transition-colors truncate">
                                {project.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {project.tags || '未分类'} · {project.view_count} 次浏览
                              </p>
                            </div>
                          </div>
                          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ml-3 ${project.status === 'online' ? 'bg-emerald-50 text-emerald-600' :
                            project.status === 'pending_online' ? 'bg-amber-50 text-amber-600' :
                              'bg-[#f5f0e8] text-gray-500'
                            }`}>
                            {project.status === 'online' ? '已上架' :
                              project.status === 'pending_online' ? '待审核' :
                                project.status === 'draft' ? '草稿' : project.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 对接项目 - 投资人/导师/资源方 */}
            {isInvestorRole && (
              <div className="dashboard-panel overflow-hidden">
                <div className="px-6 py-5 border-b border-[#e8dfd0]">
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <LinkOutlined className="text-purple-500" />
                    </span>
                    我的对接项目
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  {connectedProjects.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f5f0e8] flex items-center justify-center">
                        <LinkOutlined className="text-2xl text-[#d9cebb]" />
                      </div>
                      <p className="text-gray-400 text-sm font-medium">暂无对接项目</p>
                      <Link href="/projects" className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline mt-2">
                        浏览项目库 <ArrowRightOutlined className="text-xs" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {connectedProjects.slice(0, 5).map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[#faf7f2] transition-all duration-200 group border border-transparent hover:border-[#e8dfd0]"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all duration-300">
                              <LinkOutlined className="text-purple-500 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary group-hover:text-accent transition-colors truncate">
                                {project.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {project.tags || '未分类'} · {project.view_count} 次浏览
                              </p>
                            </div>
                          </div>
                          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ml-3 ${project.status === 'online' ? 'bg-emerald-50 text-emerald-600' :
                            project.status === 'pending_online' ? 'bg-amber-50 text-amber-600' :
                              'bg-[#f5f0e8] text-gray-500'
                            }`}>
                            {project.status === 'online' ? '已上架' :
                              project.status === 'pending_online' ? '待审核' :
                                project.status === 'draft' ? '草稿' : project.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 创业申请 - 学生 */}
            {user.role === 'student' && (
              <div className="dashboard-panel overflow-hidden">
                <div className="px-6 py-5 border-b border-[#e8dfd0] flex items-center justify-between">
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <FileTextOutlined className="text-emerald-500" />
                    </span>
                    创业申请
                  </h2>
                  <Link href="/applications" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                    查看全部 <RightOutlined className="text-xs" />
                  </Link>
                </div>
                <div className="p-4 sm:p-6">
                  {applications.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f5f0e8] flex items-center justify-center">
                        <FileTextOutlined className="text-2xl text-[#d9cebb]" />
                      </div>
                      <p className="text-gray-400 text-sm font-medium">暂无申请记录</p>
                      <Link href="/applications/create" className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline mt-2">
                        创建创业申请 <ArrowRightOutlined className="text-xs" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {applications.slice(0, 5).map((app) => (
                        <Link
                          key={app.id}
                          href={`/applications/${app.id}`}
                          className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[#faf7f2] transition-all duration-200 group border border-transparent hover:border-[#e8dfd0]"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all duration-300 ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-500' :
                              app.status === 'rejected' ? 'bg-red-50 text-red-500' :
                                app.status === 'pending' ? 'bg-amber-50 text-amber-500' :
                                  'bg-[#f5f0e8] text-gray-400'
                              }`}>
                              {app.status === 'approved' ? <CheckCircleOutlined className="group-hover:scale-110 transition-transform duration-300" /> :
                                app.status === 'rejected' ? <ExclamationCircleOutlined className="group-hover:scale-110 transition-transform duration-300" /> :
                                  app.status === 'pending' ? <ClockCircleOutlined className="group-hover:scale-110 transition-transform duration-300" /> :
                                    <FileTextOutlined className="group-hover:scale-110 transition-transform duration-300" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary truncate">{app.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(app.created_at).toLocaleDateString('zh-CN')}
                              </p>
                            </div>
                          </div>
                          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ml-3 ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                            app.status === 'rejected' ? 'bg-red-50 text-red-500' :
                              app.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                'bg-[#f5f0e8] text-gray-500'
                            }`}>
                            {app.status === 'draft' ? '草稿' :
                              app.status === 'pending' ? '审核中' :
                                app.status === 'approved' ? '已通过' :
                                  app.status === 'rejected' ? '已拒绝' : app.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 招募管理 */}
            {(user.role === 'team_owner' || user.role === 'admin') && (
              <div className="dashboard-panel overflow-hidden">
                <div className="px-6 py-5 border-b border-[#e8dfd0] flex items-center justify-between">
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <SolutionOutlined className="text-purple-500" />
                    </span>
                    招募管理
                  </h2>
                  <Link href="/recruitments" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                    查看全部 <RightOutlined className="text-xs" />
                  </Link>
                </div>
                <div className="p-4 sm:p-6">
                  {recruitments.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f5f0e8] flex items-center justify-center">
                        <SolutionOutlined className="text-2xl text-[#d9cebb]" />
                      </div>
                      <p className="text-gray-400 text-sm font-medium">暂无招募信息</p>
                      <Link href="/recruitments/create" className="inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline mt-2">
                        发布招募 <ArrowRightOutlined className="text-xs" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recruitments.slice(0, 5).map((rec) => (
                        <Link
                          key={rec.id}
                          href={`/recruitments/${rec.id}`}
                          className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[#faf7f2] transition-all duration-200 group border border-transparent hover:border-[#e8dfd0]"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all duration-300">
                              <TeamOutlined className="text-purple-500 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary truncate">{rec.position}</p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{rec.title}</p>
                            </div>
                          </div>
                          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ml-3 ${rec.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                            rec.status === 'solved' ? 'bg-blue-50 text-blue-600' :
                              'bg-[#f5f0e8] text-gray-500'
                            }`}>
                            {rec.status === 'active' ? '招募中' :
                              rec.status === 'solved' ? '已解决' : '已关闭'}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════
                Sidebar — 右侧边栏
              ═══════════════════════════════════════════════════════ */}
          <div className="space-y-5 sm:space-y-6">
            {/* 学生身份卡 */}
            {user.role === 'student' && (
              <div className={`relative overflow-hidden rounded-2xl shadow-sm border p-6 bg-gradient-to-br ${roleInfo.bgLight} ${roleInfo.borderColor}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-md">
                      <UserOutlined />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-800">同学身份</h3>
                      <p className="text-xs text-blue-500 font-medium">默认身份</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700/80 leading-relaxed mb-5">
                    你可以浏览项目、加入团队、报名活动。提交认证材料后可升级为创业团队。
                  </p>
                  <Link
                    href="/applications/create"
                    className="inline-flex items-center px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    申请成为创业团队 <ArrowRightOutlined className="ml-1.5 text-xs" />
                  </Link>
                </div>
              </div>
            )}

            {/* 团队负责人身份卡 */}
            {user.role === 'team_owner' && (
              <div className={`relative overflow-hidden rounded-2xl shadow-sm border p-6 bg-gradient-to-br ${roleInfo.bgLight} ${roleInfo.borderColor}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md">
                      <RocketOutlined />
                    </div>
                    <div>
                      <h3 className="font-bold text-orange-800">创业团队</h3>
                      <p className="text-xs text-orange-500 font-medium">种子计划</p>
                    </div>
                  </div>
                  <p className="text-sm text-orange-700/80 leading-relaxed mb-5">
                    发布项目、招募成员、对接导师与投资人，让你的创业项目获得更多资源。
                  </p>
                  <div className="space-y-2">
                    <Link
                      href="/projects/create"
                      className="flex items-center justify-between px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl text-sm font-medium text-orange-700 hover:bg-white hover:shadow-sm transition-all duration-300"
                    >
                      发布新项目 <RightOutlined className="text-xs text-orange-400" />
                    </Link>
                    <Link
                      href="/recruitments/create"
                      className="flex items-center justify-between px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl text-sm font-medium text-orange-700 hover:bg-white hover:shadow-sm transition-all duration-300"
                    >
                      发布招募 <RightOutlined className="text-xs text-orange-400" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 我的团队 */}
            {(user.role === 'team_owner' || user.role === 'team_member') && (
              <div className="dashboard-panel overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e8dfd0] flex items-center justify-between">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                      <TeamOutlined className="text-amber-500 text-sm" />
                    </span>
                    我的团队
                  </h3>
                  {user.role === 'team_owner' && myTeam && (
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/teams/${myTeam.id}/edit`}
                        className="flex items-center text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                      >
                        <SettingOutlined className="mr-1" />编辑
                      </Link>
                      <button
                        onClick={() => setShowDisbandModal(true)}
                        className="flex items-center text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                      >
                        <ExclamationCircleOutlined className="mr-1" />解散
                      </button>
                    </div>
                  )}
                  {user.role === 'team_member' && myTeam && (
                    <button
                      onClick={() => setShowLeaveModal(true)}
                      className="flex items-center text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      <ExclamationCircleOutlined className="mr-1" />退出
                    </button>
                  )}
                </div>
                <div className="p-5">
                  {myTeam ? (
                    <>
                      <div className="mb-4 pb-4 border-b border-[#f5f0e8]">
                        <p className="text-xs text-gray-400 mb-1 font-medium">团队名称</p>
                        <p className="text-base font-bold text-primary">{myTeam.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-3 font-medium">团队成员 ({teamMembers.length}人)</p>
                        <div className="space-y-2.5">
                          {teamMembers.slice().sort((a: TeamMember, b: TeamMember) => {
                            const aIsOwner = (a as unknown as { id: number }).id === myTeam?.owner_id;
                            const bIsOwner = (b as unknown as { id: number }).id === myTeam?.owner_id;
                            if (aIsOwner) return -1;
                            if (bIsOwner) return 1;
                            return 0;
                          }).map((member: TeamMember) => {
                            // API 返回的 members 实际是 User[] 对象，nickname/username 直接在顶层
                            const memberUser = member as unknown as { nickname?: string; username?: string; role?: string; id?: number; avatar?: string };
                            const displayName = memberUser.nickname || memberUser.username || `用户#${member.user_id}`;
                            const avatarChar = (memberUser.nickname || memberUser.username || '?')[0];
                            const memberRole = roleConfig[memberUser.role || ''] || roleConfig.member;
                            const isOwner = member.role === 'owner' || memberUser.id === myTeam?.owner_id;
                            return (
                              <div key={member.id} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${memberRole.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                                  {avatarChar}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                                  <p className="text-xs text-gray-400">{memberRole.label}</p>
                                </div>
                                {isOwner && (
                                  <CrownOutlined className="text-amber-400 text-xs flex-shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 text-sm py-4">暂无团队信息</p>
                  )}
                </div>
              </div>
            )}

            {/* 投资人/导师/资源方身份卡 */}
            {(user.role === 'investor' || user.role === 'mentor' || user.role === 'partner') && (
              <div className={`relative overflow-hidden rounded-2xl shadow-sm border p-6 bg-gradient-to-br ${roleInfo.bgLight} ${roleInfo.borderColor}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${user.role === 'investor' ? 'bg-purple-500' :
                      user.role === 'mentor' ? 'bg-green-500' : 'bg-teal-500'
                      }`}>
                      {user.role === 'investor' ? <FundOutlined /> :
                        user.role === 'mentor' ? <ExperimentOutlined /> : <BuildOutlined />}
                    </div>
                    <div>
                      <h3 className={`font-bold ${user.role === 'investor' ? 'text-purple-800' :
                        user.role === 'mentor' ? 'text-green-800' : 'text-teal-800'
                        }`}>
                        {user.role === 'investor' ? '投资人' : user.role === 'mentor' ? '校外导师' : '资源方'}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">已认证身份</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">
                    {user.role === 'investor' ? '浏览认证项目，申请查看BP，参与项目路演与投融资对接。' :
                      user.role === 'mentor' ? '查看项目，提供项目建议，参与线上/线下辅导。' :
                        '发布资源合作机会，查看适合合作的项目，对接创业团队。'}
                  </p>
                  <Link
                    href="/projects"
                    className="inline-flex items-center px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-light transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    浏览项目 <ArrowRightOutlined className="ml-1.5 text-xs" />
                  </Link>
                </div>
              </div>
            )}

            {/* 快速导航 */}
            <div className="dashboard-panel p-5">
              <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ThunderboltOutlined className="text-blue-500 text-sm" />
                </span>
                快速导航
              </h3>
              <div className="space-y-1">
                {[
                  { href: '/projects', icon: <ProjectOutlined />, label: '项目库', color: 'text-blue-500', bg: 'bg-blue-50' },
                  { href: '/recruitments', icon: <TeamOutlined />, label: '招募广场', color: 'text-amber-500', bg: 'bg-amber-50' },
                  { href: '/resources', icon: <BuildOutlined />, label: '创投资源', color: 'text-purple-500', bg: 'bg-purple-50' },
                  { href: '/events', icon: <CalendarOutlined />, label: '活动路演', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-[#faf7f2] hover:text-primary transition-all duration-200 group"
                  >
                    <span className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* 账号设置 */}
            <div className="dashboard-panel p-5">
              <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                  <SettingOutlined className="text-gray-500 text-sm" />
                </span>
                账号设置
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: '邮箱', value: user.email },
                  ...(user.nickname ? [{ label: '昵称', value: user.nickname }] : []),
                  ...(user.phone ? [{ label: '手机', value: user.phone }] : []),
                  { label: '注册时间', value: new Date(user.created_at).toLocaleDateString('zh-CN') },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5">
                    <span className="text-gray-400 font-medium">{item.label}</span>
                    <span className="text-gray-700 font-semibold text-right max-w-[60%] truncate">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
            Modals — 弹窗
          ═══════════════════════════════════════════════════════ */}
      {showDisbandModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fefcf8] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-[#e8dfd0]">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4 mx-auto">
              <ExclamationCircleOutlined className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">确认解散团队</h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed mb-8">
              解散团队后，团队所有成员将恢复为学生身份，团队的所有项目、招募等信息也将被删除。此操作不可恢复。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisbandModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#e8dfd0] text-gray-600 font-medium hover:bg-[#faf7f2] transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleDisbandTeam}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm shadow-sm"
              >
                确认解散
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fefcf8] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-[#e8dfd0]">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4 mx-auto">
              <ExclamationCircleOutlined className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">确认退出团队</h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed mb-8">
              退出团队后，您的身份将恢复为同学，将无法再访问该团队的项目。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#e8dfd0] text-gray-600 font-medium hover:bg-[#faf7f2] transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleLeaveTeam}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm shadow-sm"
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
