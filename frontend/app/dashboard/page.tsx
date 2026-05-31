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
} from '@ant-design/icons';

const roleConfig: Record<string, { label: string; color: string; icon: ComponentType<{ className?: string }> }> = {
  student: { label: '同学', color: 'from-blue-400 to-blue-600', icon: UserOutlined },
  team_member: { label: '团队成员', color: 'from-amber-400 to-amber-600', icon: TeamOutlined },
  team_owner: { label: '团队负责人', color: 'from-orange-400 to-orange-600', icon: RocketOutlined },
  investor: { label: '投资人', color: 'from-purple-400 to-purple-600', icon: FundOutlined },
  mentor: { label: '校外导师', color: 'from-green-400 to-green-600', icon: ExperimentOutlined },
  partner: { label: '资源方', color: 'from-teal-400 to-teal-600', icon: BuildOutlined },
  admin: { label: '管理员', color: 'from-red-400 to-red-600', icon: SafetyOutlined },
  super_admin: { label: '超级管理员', color: 'from-yellow-400 to-yellow-600', icon: SafetyOutlined },
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const roleInfo = roleConfig[user.role] || roleConfig.student;
  const RoleIcon = roleInfo.icon;
  const isInvestorRole = user?.role === 'investor' || user?.role === 'mentor' || user?.role === 'partner';

  const activeRecruitments = recruitments.filter((r) => r.status === 'active');

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center text-white text-2xl shadow-lg`}>
                <RoleIcon />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0a2a5c]">
                  欢迎回来，{user.nickname || user.username}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${roleInfo.color} text-white`}>
                    {roleInfo.label}
                  </span>
                  <span className="text-sm text-gray-400">{user.email}</span>
                </div>
              </div>
            </div>
            {!isInvestorRole && (
              <div className="flex items-center space-x-3">
                <Link
                  href="/projects/create"
                  className="inline-flex items-center px-4 py-2 bg-[#f59e0b] text-white rounded-xl hover:bg-[#f59e0b]/90 transition-colors text-sm font-medium shadow-sm"
                >
                  <RocketOutlined className="mr-1.5" /> 发布项目
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats - 投资人/导师/资源方不显示 */}
        {!isInvestorRole && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-custom p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">项目总数</p>
                  <p className="text-2xl font-bold text-[#0a2a5c]">{projects.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#0a2a5c]/5 flex items-center justify-center text-[#0a2a5c]">
                  <ProjectOutlined />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-custom p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">团队数量</p>
                  <p className="text-2xl font-bold text-[#0a2a5c]">{teams.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#0a2a5c]/5 flex items-center justify-center text-[#0a2a5c]">
                  <TeamOutlined />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-custom p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">招募中</p>
                  <p className="text-2xl font-bold text-[#0a2a5c]">{activeRecruitments.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#0a2a5c]/5 flex items-center justify-center text-[#0a2a5c]">
                  <SolutionOutlined />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Projects Section - 只有团队角色显示 */}
            {(user?.role === 'team_owner' || user?.role === 'team_member') && (
              <div className="bg-white rounded-xl shadow-custom border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#0a2a5c]">
                    <ProjectOutlined className="mr-2" />团队项目
                  </h2>
                  <Link href="/my-projects" className="text-sm text-[#f59e0b] hover:text-[#f59e0b]/80 transition-colors">
                    查看全部 <RightOutlined className="text-xs ml-1" />
                  </Link>
                </div>
                <div className="p-6">
                  {projects.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <RocketOutlined className="text-4xl mb-3 block" />
                      <p className="text-sm">暂无项目</p>
                      <Link href="/projects/create" className="text-[#f59e0b] text-sm hover:underline mt-2 inline-block">
                        发布第一个项目 →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.slice(0, 5).map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-lg bg-[#0a2a5c]/5 flex items-center justify-center text-[#0a2a5c] group-hover:bg-[#0a2a5c]/10 transition-colors">
                              <RocketOutlined />
                            </div>
                            <div>
                              <p className="font-medium text-[#0a2a5c] group-hover:text-[#f59e0b] transition-colors">
                                {project.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {project.tags || '未分类'} · {project.view_count} 次浏览
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${project.status === 'online' ? 'bg-green-50 text-green-600' :
                            project.status === 'pending_online' ? 'bg-amber-50 text-amber-600' :
                              'bg-gray-100 text-gray-500'
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

            {/* Connected Projects Section - 仅投资人/导师/资源方显示 */}
            {isInvestorRole && (
              <div className="bg-white rounded-xl shadow-custom border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-[#0a2a5c]">
                    <LinkOutlined className="mr-2" />我的对接项目
                  </h2>
                </div>
                <div className="p-6">
                  {connectedProjects.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <LinkOutlined className="text-4xl mb-3 block" />
                      <p className="text-sm">暂无对接项目</p>
                      <Link href="/projects" className="text-[#f59e0b] text-sm hover:underline mt-2 inline-block">
                        浏览项目库 →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {connectedProjects.slice(0, 5).map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
                              <LinkOutlined />
                            </div>
                            <div>
                              <p className="font-medium text-[#0a2a5c] group-hover:text-[#f59e0b] transition-colors">
                                {project.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {project.tags || '未分类'} · {project.view_count} 次浏览
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${project.status === 'online' ? 'bg-green-50 text-green-600' :
                            project.status === 'pending_online' ? 'bg-amber-50 text-amber-600' :
                              'bg-gray-100 text-gray-500'
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

            {/* Applications Section - 只有学生显示 */}
            {user.role === 'student' && (
              <div className="bg-white rounded-xl shadow-custom border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#0a2a5c]">
                    <FileTextOutlined className="mr-2" />创业申请
                  </h2>
                  <Link href="/applications" className="text-sm text-[#f59e0b] hover:text-[#f59e0b]/80 transition-colors">
                    查看全部 <RightOutlined className="text-xs ml-1" />
                  </Link>
                </div>
                <div className="p-6">
                  {applications.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <FileTextOutlined className="text-4xl mb-3 block" />
                      <p className="text-sm">暂无申请记录</p>
                      <Link href="/applications/create" className="text-[#f59e0b] text-sm hover:underline mt-2 inline-block">
                        创建创业申请 →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.slice(0, 5).map((app) => (
                        <Link
                          key={app.id}
                          href={`/applications/${app.id}`}
                          className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${app.status === 'approved' ? 'bg-green-50 text-green-600' :
                              app.status === 'rejected' ? 'bg-red-50 text-red-500' :
                                app.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                  'bg-gray-50 text-gray-400'
                              }`}>
                              {app.status === 'approved' ? <CheckCircleOutlined /> :
                                app.status === 'rejected' ? <ExclamationCircleOutlined /> :
                                  app.status === 'pending' ? <ClockCircleOutlined /> :
                                    <FileTextOutlined />}
                            </div>
                            <div>
                              <p className="font-medium text-[#0a2a5c]">{app.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(app.created_at).toLocaleDateString('zh-CN')}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${app.status === 'approved' ? 'bg-green-50 text-green-600' :
                            app.status === 'rejected' ? 'bg-red-50 text-red-500' :
                              app.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                'bg-gray-100 text-gray-500'
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

            {/* Recruitments Section */}
            {(user.role === 'team_owner' || user.role === 'admin') && (
              <div className="bg-white rounded-xl shadow-custom border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#0a2a5c]">
                    <SolutionOutlined className="mr-2" />招募管理
                  </h2>
                  <Link href="/recruitments" className="text-sm text-[#f59e0b] hover:text-[#f59e0b]/80 transition-colors">
                    查看全部 <RightOutlined className="text-xs ml-1" />
                  </Link>
                </div>
                <div className="p-6">
                  {recruitments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <SolutionOutlined className="text-4xl mb-3 block" />
                      <p className="text-sm">暂无招募信息</p>
                      <Link href="/recruitments/create" className="text-[#f59e0b] text-sm hover:underline mt-2 inline-block">
                        发布招募 →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recruitments.slice(0, 5).map((rec) => (
                        <Link
                          key={rec.id}
                          href={`/recruitments/${rec.id}`}
                          className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-lg bg-[#0a2a5c]/5 flex items-center justify-center text-[#0a2a5c] group-hover:bg-[#0a2a5c]/10 transition-colors">
                              <TeamOutlined />
                            </div>
                            <div>
                              <p className="font-medium text-[#0a2a5c]">{rec.position}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{rec.title}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${rec.status === 'active' ? 'bg-green-50 text-green-600' :
                            rec.status === 'solved' ? 'bg-blue-50 text-blue-600' :
                              'bg-gray-100 text-gray-500'
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role-specific Info */}
            {user.role === 'student' && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl shadow-custom border border-blue-100 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <UserOutlined />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">同学身份</h3>
                    <p className="text-xs text-blue-600">默认身份</p>
                  </div>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  你可以浏览项目、加入团队、报名活动。提交认证材料后可升级为创业团队。
                </p>
                <Link
                  href="/applications/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  申请成为创业团队 <ArrowRightOutlined className="ml-1 text-xs" />
                </Link>
              </div>
            )}

            {user.role === 'team_owner' && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl shadow-custom border border-orange-100 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                    <RocketOutlined />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-800">创业团队</h3>
                    <p className="text-xs text-orange-600">种子计划</p>
                  </div>
                </div>
                <p className="text-sm text-orange-700 mb-4">
                  发布项目、招募成员、对接导师与投资人，让你的创业项目获得更多资源。
                </p>
                <div className="space-y-2">
                  <Link
                    href="/projects/create"
                    className="flex items-center justify-between px-4 py-2 bg-white rounded-lg text-sm text-orange-700 hover:bg-orange-50 transition-colors"
                  >
                    发布新项目 <RightOutlined className="text-xs" />
                  </Link>
                  <Link
                    href="/recruitments/create"
                    className="flex items-center justify-between px-4 py-2 bg-white rounded-lg text-sm text-orange-700 hover:bg-orange-50 transition-colors"
                  >
                    发布招募 <RightOutlined className="text-xs" />
                  </Link>
                </div>
              </div>
            )}

            {/* 我的团队模块 - 仅团队所有者和团队成员可见 */}
            {(user.role === 'team_owner' || user.role === 'team_member') && (
              <div className="bg-white rounded-xl shadow-custom border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#0a2a5c] flex items-center">
                    <TeamOutlined className="mr-2" />我的团队
                  </h3>
                  {user.role === 'team_owner' && myTeam && (
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/teams/${myTeam.id}/edit`}
                        className="flex items-center text-sm text-[#f59e0b] hover:text-[#f59e0b]/80 transition-colors"
                      >
                        <SettingOutlined className="mr-1" />修改团队信息
                      </Link>
                      <button
                        onClick={() => setShowDisbandModal(true)}
                        className="flex items-center text-sm text-red-500 hover:text-red-600 transition-colors"
                      >
                        <ExclamationCircleOutlined className="mr-1" />解散团队
                      </button>
                    </div>
                  )}
                  {user.role === 'team_member' && myTeam && (
                    <button
                      onClick={() => setShowLeaveModal(true)}
                      className="flex items-center text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      <ExclamationCircleOutlined className="mr-1" />退出团队
                    </button>
                  )}
                </div>
                <div className="p-6">
                  {myTeam ? (
                    <>
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">团队名称</p>
                        <p className="text-lg font-semibold text-[#0a2a5c]">{myTeam.name}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">团队成员 ({teamMembers.length}人)</p>
                        <div className="space-y-2">
                          {teamMembers.slice().sort((a: TeamMember, b: TeamMember) => {
                            // 团队负责人排在第一位
                            if (a.role === 'owner') return -1;
                            if (b.role === 'owner') return 1;
                            return 0;
                          }).map((member: TeamMember) => {
                            const displayName = member.user?.nickname || member.user?.username || '未知用户';
                            return (
                              <div key={member.id} className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleConfig[member.role]?.color || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white text-sm`}>
                                  {displayName?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800">{displayName}</p>
                                  <p className="text-xs text-gray-500">{roleConfig[member.role]?.label || member.role}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#0a2a5c] border-t-transparent" />
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4">暂无团队信息</p>
                  )}
                </div>
              </div>
            )}

            {(user.role === 'investor' || user.role === 'mentor' || user.role === 'partner') && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl shadow-custom border border-purple-100 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${user.role === 'investor' ? 'bg-purple-500' :
                    user.role === 'mentor' ? 'bg-green-500' : 'bg-teal-500'
                    }`}>
                    {user.role === 'investor' ? <FundOutlined /> :
                      user.role === 'mentor' ? <ExperimentOutlined /> : <BuildOutlined />}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${user.role === 'investor' ? 'text-purple-800' :
                      user.role === 'mentor' ? 'text-green-800' : 'text-teal-800'
                      }`}>
                      {user.role === 'investor' ? '投资人' : user.role === 'mentor' ? '校外导师' : '资源方'}
                    </h3>
                    <p className="text-xs text-gray-500">已认证身份</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {user.role === 'investor' ? '浏览认证项目，申请查看BP，参与项目路演与投融资对接。' :
                    user.role === 'mentor' ? '查看项目，提供项目建议，参与线上/线下辅导。' :
                      '发布资源合作机会，查看适合合作的项目，对接创业团队。'}
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center px-4 py-2 bg-[#0a2a5c] text-white rounded-lg hover:bg-[#0a2a5c]/90 transition-colors text-sm font-medium"
                >
                  浏览项目 <ArrowRightOutlined className="ml-1 text-xs" />
                </Link>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-custom border border-gray-100 p-6">
              <h3 className="font-semibold text-[#0a2a5c] mb-4">快速导航</h3>
              <div className="space-y-2">
                <Link href="/projects" className="flex items-center space-x-3 p-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <ProjectOutlined className="text-[#0a2a5c]" /> <span>项目库</span>
                </Link>
                <Link href="/recruitments" className="flex items-center space-x-3 p-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <TeamOutlined className="text-[#0a2a5c]" /> <span>招募广场</span>
                </Link>
                <Link href="/resources" className="flex items-center space-x-3 p-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <BuildOutlined className="text-[#0a2a5c]" /> <span>创投资源</span>
                </Link>
                <Link href="/events" className="flex items-center space-x-3 p-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <CalendarOutlined className="text-[#0a2a5c]" /> <span>活动路演</span>
                </Link>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-custom border border-gray-100 p-6">
              <h3 className="font-semibold text-[#0a2a5c] mb-4">账号设置</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">邮箱</span>
                  <span className="text-gray-700">{user.email}</span>
                </div>
                {user.nickname && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">昵称</span>
                    <span className="text-gray-700">{user.nickname}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">手机</span>
                    <span className="text-gray-700">{user.phone}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">注册时间</span>
                  <span className="text-gray-700">{new Date(user.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 解散团队确认弹窗 */}
      {showDisbandModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">确认解散团队</h3>
            <p className="text-gray-600 mb-6">
              解散团队后，团队所有成员将恢复为学生身份，团队的所有项目、招募等信息也将被删除。此操作不可恢复，确定要解散吗？
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDisbandModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDisbandTeam}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                确认解散
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 退出团队确认弹窗 */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">确认退出团队</h3>
            <p className="text-gray-600 mb-6">
              退出团队后，您的身份将恢复为同学，将无法再访问该团队的项目。确定要退出吗？
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleLeaveTeam}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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