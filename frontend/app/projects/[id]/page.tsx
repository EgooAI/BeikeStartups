'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectApi, recruitmentApi } from '@/lib/api';
import { Project, ProjectStage, Recruitment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ProjectConnectionRequests from '@/components/ProjectConnectionRequests';
import {
  RocketOutlined,
  TeamOutlined,
  EyeOutlined,
  HeartOutlined,
  CalendarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
  FileTextOutlined,
  BookOutlined,
  PauseOutlined,
  EditOutlined,
} from '@ant-design/icons';

const STAGE_OPTIONS: { value: ProjectStage; label: string }[] = [
  { value: 'idea', label: '创意阶段' },
  { value: 'seed', label: '种子计划' },
  { value: 'prototype', label: '原型开发' },
  { value: 'launched', label: '产品上线' },
  { value: 'revenue', label: '营收验证' },
];

const STAGE_COLORS: Record<ProjectStage, string> = {
  idea: 'bg-purple-500',
  seed: 'bg-blue-500',
  prototype: 'bg-[#0a2a5c]',
  launched: 'bg-[#f59e0b]',
  revenue: 'bg-green-500',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStage, setEditingStage] = useState(false);
  const [newStage, setNewStage] = useState<ProjectStage>('idea');

  const canEditStage = user && (user.role === 'admin' || user.role === 'super_admin' || (project?.team && project.team.owner_id === user.id));

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  async function fetchProject() {
    try {
      const res = await projectApi.get(Number(params.id));
      if (res.data) {
        setProject(res.data as Project);
      }
      const recRes = await recruitmentApi.list('active');
      if (recRes.data) {
        const data = recRes.data as any;
        const teamRecs = (data.items || []).filter(
          (r: Recruitment) => r.team_id === (res.data as any)?.team_id
        );
        setRecruitments(teamRecs);
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStartEditStage = () => {
    setNewStage(project?.stage || 'idea');
    setEditingStage(true);
  };

  const handleSaveStage = async () => {
    if (!project?.id || !newStage) return;
    try {
      await projectApi.update(project.id, { stage: newStage });
      setProject(prev => prev ? { ...prev, stage: newStage } : null);
      setEditingStage(false);
    } catch (err) {
      console.error('Failed to update stage:', err);
      alert('更新阶段失败');
    }
  };

  const handleCancelEditStage = () => {
    setEditingStage(false);
    setNewStage('idea');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RocketOutlined className="text-6xl text-gray-300 mb-4 block" />
          <p className="text-gray-500">项目不存在</p>
          <Link href="/projects" className="text-[#0a2a5c] hover:underline mt-4 inline-block">返回项目库</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-[#0a2a5c] transition-colors mb-6"
        >
          <ArrowLeftOutlined className="mr-2" /> 返回
        </button>

        <div className="bg-white rounded-2xl shadow-custom overflow-hidden">
          {/* Cover */}
          <div className="h-64 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] relative flex items-center justify-center">
            {project.cover_image ? (
              <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover" />
            ) : (
              <RocketOutlined className="text-8xl text-white/20" />
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {editingStage ? (
                <div className="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full">
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as ProjectStage)}
                    className="text-sm bg-transparent border-none focus:outline-none"
                  >
                    {STAGE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveStage}
                    className="text-[#0a2a5c] hover:text-[#0a2a5c]/80"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancelEditStage}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span className={`px-4 py-1.5 ${STAGE_COLORS[project.stage] || 'bg-[#f59e0b]'} text-white text-sm rounded-full font-medium`}>
                  {STAGE_OPTIONS.find(s => s.value === project.stage)?.label || '未知阶段'}
                </span>
              )}
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#0a2a5c] mb-2">{project.title}</h1>
                <p className="text-gray-500 text-lg">{project.description}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-200 rounded-xl text-gray-500 hover:border-red-200 hover:text-red-500 transition-colors">
                  <HeartOutlined />
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-xl text-gray-500 hover:border-[#0a2a5c]/20 hover:text-[#0a2a5c] transition-colors">
                  <ShareAltOutlined />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              {project.tags?.split(',').map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                  {tag.trim()}
                </span>
              ))}
            </div>

            {project.content && (
              <div className="prose max-w-none mb-8">
                <h2 className="text-xl font-semibold text-[#0a2a5c] mb-4">项目介绍</h2>
                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">{project.content}</div>
              </div>
            )}

            {/* 项目阶段 - 独立区块，可编辑 */}
            <div className="p-6 bg-gray-50 rounded-xl mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#0a2a5c]">项目阶段</h2>
                {canEditStage && !editingStage && (
                  <button
                    onClick={handleStartEditStage}
                    className="px-3 py-1.5 bg-[#0a2a5c] text-white text-sm rounded-lg hover:bg-[#0a2a5c]/90 transition-colors flex items-center gap-1"
                  >
                    <EditOutlined className="text-xs" /> 修改阶段
                  </button>
                )}
              </div>

              {editingStage ? (
                <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-[#0a2a5c]/20">
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as ProjectStage)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a2a5c] focus:border-transparent text-sm"
                  >
                    {STAGE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveStage}
                    className="px-4 py-2 bg-[#0a2a5c] text-white text-sm rounded-lg hover:bg-[#0a2a5c]/90 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelEditStage}
                    className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {STAGE_OPTIONS.map(option => (
                    <div
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        project.stage === option.value
                          ? `${STAGE_COLORS[option.value]} text-white shadow-md scale-105`
                          : 'bg-white text-gray-500 border border-gray-200'
                      }`}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                      {project.stage === option.value && (
                        <span className="text-xs">●</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl mb-8">
              <div className="flex items-center space-x-3">
                <TeamOutlined className="text-xl text-[#0a2a5c]" />
                <div>
                  <p className="text-sm text-gray-500">所属团队</p>
                  <p className="font-medium text-[#0a2a5c]">{project.team?.name || '待定'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <TeamOutlined className="text-xl text-[#0a2a5c]" />
                <div>
                  <p className="text-sm text-gray-500">所属团队</p>
                  <p className="font-medium text-[#0a2a5c]">{project.team?.name || '待定'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <EyeOutlined className="text-xl text-[#0a2a5c]" />
                <div>
                  <p className="text-sm text-gray-500">浏览次数</p>
                  <p className="font-medium text-[#0a2a5c]">{project.view_count}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CalendarOutlined className="text-xl text-[#0a2a5c]" />
                <div>
                  <p className="text-sm text-gray-500">发布时间</p>
                  <p className="font-medium text-[#0a2a5c]">
                    {new Date(project.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Recruitment Section */}
            {recruitments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#0a2a5c] mb-4">招募需求</h2>
                <div className="space-y-4">
                  {recruitments.map((rec) => (
                    <div key={rec.id} className="p-5 border border-gray-200 rounded-xl hover:border-[#f59e0b]/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-[#0a2a5c]">{rec.position}</h3>
                          <p className="text-sm text-gray-500 mt-1">{rec.description}</p>
                          {rec.requirements && (
                            <p className="text-sm text-gray-400 mt-2">要求: {rec.requirements}</p>
                          )}
                        </div>
                        {user?.role === 'student' && (
                          <Link
                            href={`/responses/create?recruitment_id=${rec.id}`}
                            className="px-5 py-2 bg-[#f59e0b] text-white text-sm rounded-lg hover:bg-[#f59e0b]/90 transition-colors whitespace-nowrap"
                          >
                            申请加入
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons based on user role */}
            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
              {user ? (
                <>
                  {user.role === 'student' && (
                    <Link
                      href={user ? `/responses/create?recruitment_id=${recruitments[0]?.id || ''}` : '/login'}
                      className="px-6 py-3 bg-[#f59e0b] text-white rounded-xl hover:bg-[#f59e0b]/90 transition-colors font-medium"
                    >
                      <UserOutlined className="mr-2" />申请加入团队
                    </Link>
                  )}

                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-6 py-3 bg-[#f59e0b] text-white rounded-xl hover:bg-[#f59e0b]/90 transition-colors font-medium"
                  >
                    登录后申请加入
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:border-[#0a2a5c]/20 transition-colors font-medium"
                  >
                    注册账号
                  </Link>
                </>
              )}
            </div>

            {/* Role-specific actions - hidden for students and team members */}
            {user?.role !== 'student' && user?.role !== 'team_owner' && (
              <div className="mt-6 p-5 bg-amber-50 rounded-xl border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-3">资源对接</h3>
                <p className="text-sm text-amber-600 mb-4">
                  投资人可申请查看BP，导师可申请成为项目导师，资源方可提供资源合作。
                </p>
                <div className="flex flex-wrap gap-3">
                  {user?.role === 'investor' && (
                    <Link
                      href={`/projects/${project.id}/connect`}
                      className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors flex items-center"
                    >
                      <FileTextOutlined className="mr-2" />申请对接
                    </Link>
                  )}
                  {user?.role === 'mentor' && (
                    <Link
                      href={`/projects/${project.id}/connect`}
                      className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors flex items-center"
                    >
                      <BookOutlined className="mr-2" />申请对接
                    </Link>
                  )}
                  {user?.role === 'partner' && (
                    <Link
                      href={`/projects/${project.id}/connect`}
                      className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors flex items-center"
                    >
                      <PauseOutlined className="mr-2" />申请对接
                    </Link>
                  )}
                 
                </div>
              </div>
            )}

            {/* Connection Requests Management - visible only to team members */}
            <ProjectConnectionRequests projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  );
}