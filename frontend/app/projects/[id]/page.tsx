'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectApi, recruitmentApi } from '@/lib/api';
import { Project, ProjectStage, Recruitment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { message } from 'antd';
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
  ExclamationCircleOutlined,
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
      message.success('项目阶段已更新');
    } catch (err) {
      console.error('Failed to update stage:', err);
      message.error('更新阶段失败');
    }
  };

  const handleCancelEditStage = () => {
    setEditingStage(false);
    setNewStage('idea');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ec]/50 flex items-center justify-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#e8dfd0] border-t-[#0a2a5c] animate-spin" />
          <div className="absolute inset-[4px] rounded-full border-[3px] border-[#e8dfd0] border-b-[#0a2a5c] animate-[spin_0.8s_linear_reverse_infinite]" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#f7f3ec]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ExclamationCircleOutlined className="text-4xl text-[#8b7e6a]" />
          </div>
          <p className="text-[#8b7e6a] text-lg mb-4">项目不存在</p>
          <Link href="/projects" className="text-[#0a2a5c] hover:underline font-medium">返回项目库</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec]/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#8b7e6a] hover:text-[#0a2a5c] transition-colors mb-6"
        >
          <ArrowLeftOutlined className="mr-2" /> 返回
        </button>

        <div className="bg-[#fefcf8] border border-[#e8dfd0] rounded-2xl shadow-sm overflow-hidden">
          {/* Cover */}
          <div className="h-64 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] relative flex items-center justify-center">
            {project.cover_image ? (
              <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <RocketOutlined className="text-5xl text-white/40" />
                </div>
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {editingStage ? (
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as ProjectStage)}
                    className="text-sm bg-transparent border-none focus:outline-none text-[#0a2a5c]"
                  >
                    {STAGE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveStage}
                    className="text-green-600 hover:text-green-700 font-bold"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancelEditStage}
                    className="text-red-400 hover:text-red-500 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span className={`px-4 py-1.5 ${STAGE_COLORS[project.stage] || 'bg-[#f59e0b]'} text-white text-sm rounded-full font-medium shadow-sm`}>
                  {STAGE_OPTIONS.find(s => s.value === project.stage)?.label || '未知阶段'}
                </span>
              )}
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#0a2a5c] mb-2">{project.title}</h1>
                <p className="text-[#8b7e6a] text-lg">{project.description}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-[#e8dfd0] rounded-xl text-[#8b7e6a] hover:bg-[#faf7f2] hover:border-red-200 hover:text-red-500 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <HeartOutlined />
                </button>
                <button className="px-4 py-2 border border-[#e8dfd0] rounded-xl text-[#8b7e6a] hover:bg-[#faf7f2] hover:border-[#0a2a5c]/20 hover:text-[#0a2a5c] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <ShareAltOutlined />
                </button>
              </div>
            </div>

            {/* Tags */}
            {project.tags && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.split(',').map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-[#f5f0e8] text-[#8b7e6a] rounded-xl text-sm font-medium">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Project Content */}
            {project.content && (
              <div className="prose max-w-none mb-8">
                <h2 className="text-xl font-extrabold tracking-tight text-[#0a2a5c] mb-4">项目介绍</h2>
                <div className="text-[#5c4f3c] leading-relaxed whitespace-pre-wrap">{project.content}</div>
              </div>
            )}

            {/* Project Stage */}
            <div className="p-6 bg-[#faf7f2] rounded-xl border border-[#e8dfd0] mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold tracking-tight text-[#0a2a5c]">项目阶段</h2>
                {canEditStage && !editingStage && (
                  <button
                    onClick={handleStartEditStage}
                    className="px-3 py-1.5 bg-[#0a2a5c] text-white text-sm rounded-xl hover:bg-[#0a2a5c]/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1"
                  >
                    <EditOutlined className="text-xs" /> 修改阶段
                  </button>
                )}
              </div>

              {editingStage ? (
                <div className="flex items-center gap-3 bg-[#fefcf8] p-4 rounded-xl border border-[#0a2a5c]/20">
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as ProjectStage)}
                    className="flex-1 px-3 py-2 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] focus:outline-none text-sm"
                  >
                    {STAGE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveStage}
                    className="px-4 py-2 bg-[#0a2a5c] text-white text-sm rounded-xl hover:bg-[#0a2a5c]/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelEditStage}
                    className="px-4 py-2 border border-[#e8dfd0] text-[#5c4f3c] text-sm rounded-xl hover:bg-[#faf7f2] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 flex-wrap">
                  {STAGE_OPTIONS.map(option => (
                    <div
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm ${
                        project.stage === option.value
                          ? `${STAGE_COLORS[option.value]} text-white shadow-md scale-105`
                          : 'bg-[#fefcf8] text-[#8b7e6a] border border-[#e8dfd0]'
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#faf7f2] rounded-xl border border-[#e8dfd0] mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#f5f0e8] rounded-xl flex items-center justify-center">
                  <TeamOutlined className="text-lg text-[#0a2a5c]" />
                </div>
                <div>
                  <p className="text-sm text-[#a89880]">所属团队</p>
                  <p className="font-medium text-[#0a2a5c]">{project.team?.name || '待定'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#f5f0e8] rounded-xl flex items-center justify-center">
                  <EyeOutlined className="text-lg text-[#0a2a5c]" />
                </div>
                <div>
                  <p className="text-sm text-[#a89880]">浏览次数</p>
                  <p className="font-medium text-[#0a2a5c]">{project.view_count}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#f5f0e8] rounded-xl flex items-center justify-center">
                  <CalendarOutlined className="text-lg text-[#0a2a5c]" />
                </div>
                <div>
                  <p className="text-sm text-[#a89880]">发布时间</p>
                  <p className="font-medium text-[#0a2a5c]">
                    {new Date(project.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Recruitment Section */}
            {recruitments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-extrabold tracking-tight text-[#0a2a5c] mb-4">招募需求</h2>
                <div className="space-y-4">
                  {recruitments.map((rec) => (
                    <div key={rec.id} className="p-5 border border-[#e8dfd0] rounded-xl hover:border-[#d4c8b0] hover:bg-[#faf7f2] transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-extrabold tracking-tight text-[#0a2a5c]">{rec.position}</h3>
                          <p className="text-sm text-[#8b7e6a] mt-1">{rec.description}</p>
                          {rec.requirements && (
                            <p className="text-sm text-[#a89880] mt-2">要求: {rec.requirements}</p>
                          )}
                        </div>
                        {user?.role === 'student' && (
                          <Link
                            href={`/responses/create?recruitment_id=${rec.id}`}
                            className="px-5 py-2 bg-[#f59e0b] text-white text-sm rounded-xl hover:bg-[#f59e0b]/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 border-t border-[#e8dfd0] pt-6">
              {user ? (
                <>
                  {user.role === 'student' && (
                    <Link
                      href={user ? `/responses/create?recruitment_id=${recruitments[0]?.id || ''}` : '/login'}
                      className="px-6 py-3 bg-[#f59e0b] text-white rounded-xl hover:bg-[#f59e0b]/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-medium"
                    >
                      <UserOutlined className="mr-2" />申请加入团队
                    </Link>
                  )}

                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-6 py-3 bg-[#f59e0b] text-white rounded-xl hover:bg-[#f59e0b]/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-medium"
                  >
                    登录后申请加入
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-3 border border-[#e8dfd0] text-[#5c4f3c] rounded-xl hover:bg-[#faf7f2] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-medium"
                  >
                    注册账号
                  </Link>
                </>
              )}
            </div>

            {/* Resource Connection for non-student roles */}
            {user?.role !== 'student' && user?.role !== 'team_owner' && (
              <div className="mt-6 p-5 bg-[#faf7f2] rounded-xl border border-[#e8dfd0]">
                <h3 className="font-extrabold tracking-tight text-[#0a2a5c] mb-3">资源对接</h3>
                <p className="text-sm text-[#8b7e6a] mb-4">
                  投资人可申请查看BP，导师可申请成为项目导师，资源方可提供资源合作。
                </p>
                <div className="flex flex-wrap gap-3">
                  {user?.role === 'investor' && (
                    <Link
                      href={`/projects/${project.id}/connect`}
                      className="px-4 py-2 bg-[#f59e0b] text-white text-sm rounded-xl hover:bg-[#f59e0b]/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                    >
                      <FileTextOutlined className="mr-2" />申请对接
                    </Link>
                  )}
                  {user?.role === 'mentor' && (
                    <Link
                      href={`/projects/${project.id}/connect`}
                      className="px-4 py-2 bg-[#f59e0b] text-white text-sm rounded-xl hover:bg-[#f59e0b]/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                    >
                      <BookOutlined className="mr-2" />申请对接
                    </Link>
                  )}
                  {user?.role === 'partner' && (
                    <Link
                      href={`/projects/${project.id}/connect`}
                      className="px-4 py-2 bg-[#f59e0b] text-white text-sm rounded-xl hover:bg-[#f59e0b]/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center"
                    >
                      <PauseOutlined className="mr-2" />申请对接
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Connection Requests Management */}
            <ProjectConnectionRequests projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
