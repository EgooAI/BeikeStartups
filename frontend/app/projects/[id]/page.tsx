'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectApi, recruitmentApi } from '@/lib/api';
import { Project, Recruitment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  RocketOutlined,
  TeamOutlined,
  EyeOutlined,
  HeartOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);

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
            <div className="absolute top-4 left-4">
              <span className="px-4 py-1.5 bg-[#f59e0b] text-white text-sm rounded-full font-medium">
                种子计划
              </span>
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
                        <Link
                          href={user ? `/responses/create?recruitment_id=${rec.id}` : '/login'}
                          className="px-5 py-2 bg-[#f59e0b] text-white text-sm rounded-lg hover:bg-[#f59e0b]/90 transition-colors whitespace-nowrap"
                        >
                          申请加入
                        </Link>
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
                  <Link
                    href={user ? `/responses/create?recruitment_id=${recruitments[0]?.id || ''}` : '/login'}
                    className="px-6 py-3 bg-[#f59e0b] text-white rounded-xl hover:bg-[#f59e0b]/90 transition-colors font-medium"
                  >
                    <UserOutlined className="mr-2" />申请加入团队
                  </Link>
                  <button className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:border-[#0a2a5c]/20 transition-colors font-medium">
                    <HeartOutlined className="mr-2" />关注项目
                  </button>
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

            {/* Role-specific actions */}
            <div className="mt-6 p-5 bg-amber-50 rounded-xl border border-amber-100">
              <h3 className="font-semibold text-amber-800 mb-3">资源对接</h3>
              <p className="text-sm text-amber-600 mb-4">
                投资人可申请查看BP，导师可申请成为项目导师，资源方可提供资源合作。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={user ? `/projects/${project.id}/bp-request` : '/login'}
                  className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
                >
                  申请查看BP
                </Link>
                <Link
                  href={user ? `/projects/${project.id}/connect` : '/login'}
                  className="px-4 py-2 bg-white text-amber-700 text-sm rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
                >
                  预约项目路演
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}