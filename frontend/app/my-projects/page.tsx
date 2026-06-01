'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';
import { message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  EyeOutlined,
  InboxOutlined,
} from '@ant-design/icons';

export default function TeamProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProjects = async () => {
    try {
      const res = await projectApi.list({ status: '' });
      if (res.data) {
        const data = res.data as { items: Project[] };
        setProjects(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      requestAnimationFrame(() => {
        loadProjects();
      });
    }
  }, [user, authLoading]);

  const handleRequestOnline = async (projectId: number) => {
    try {
      await projectApi.requestOnline(projectId);
      message.success('已提交上架申请，请等待管理员审核');
      loadProjects();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '申请上架失败';
      message.error(errorMessage);
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      await projectApi.delete(projectId);
      loadProjects();
      message.success('项目已删除');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '删除失败';
      message.error(errorMessage);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      pending_online: '待上架',
      online: '已上架',
      rejected_online: '上架被拒',
      pending_offline: '待下架',
      offline: '已下架',
      rejected_offline: '下架被拒',
      invalid: '已作废',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'bg-white/[0.03] text-gray-400',
      pending_online: 'bg-[#ffb800]/10 text-[#ffb800]',
      online: 'bg-[#00ff88]/10 text-[#00ff88]',
      rejected_online: 'bg-red-500/10 text-red-400',
      pending_offline: 'bg-[#ffb800]/10 text-[#ffb800]',
      offline: 'bg-white/[0.03] text-gray-400',
      rejected_offline: 'bg-red-500/10 text-red-400',
      invalid: 'bg-red-500/10 text-red-400',
    };
    return colorMap[status] || 'bg-white/[0.03] text-gray-400';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
          <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          返回主页
        </Link>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">团队项目</h1>
            <p className="text-gray-400 mt-1">管理您团队的所有项目</p>
          </div>
          {user?.role !== 'student' && (
            <button
              onClick={() => router.push('/projects/create')}
              className="px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl shadow-sm hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex items-center"
            >
              <PlusOutlined className="mr-2" />创建项目
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="holo-card p-12 text-center">
            <div className="w-20 h-20 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/[0.06]">
              <InboxOutlined className="text-3xl text-gray-500" />
            </div>
            <p className="text-gray-400 mb-4">暂无项目</p>
            {user?.role !== 'student' && (
              <button
                onClick={() => router.push('/projects/create')}
                className="text-[#00f0ff] hover:text-[#00c8ff] font-medium"
              >
                创建第一个项目 →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="holo-card p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-black tracking-tight text-white">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <EyeOutlined className="mr-1" />
                        {project.view_count} 次浏览
                      </span>
                      <span>创建于 {formatDate(project.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {project.status === 'draft' && (
                      <button
                        onClick={() => handleRequestOnline(project.id)}
                        className="px-4 py-2 bg-[#ffb800] text-[#050510] font-bold rounded-xl shadow-sm hover:shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 text-sm flex items-center"
                      >
                        <SendOutlined className="mr-1" />申请上架
                      </button>
                    )}
                    {project.status === 'pending_online' && (
                      <span className="px-4 py-2 bg-[#ffb800]/10 text-[#ffb800] rounded-xl text-sm flex items-center">
                        等待审核
                      </span>
                    )}
                    <button
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="px-4 py-2 border border-white/[0.06] rounded-xl hover:border-[#00f0ff]/30 hover:bg-white/[0.03] text-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => router.push(`/projects/${project.id}/edit`)}
                      className="px-4 py-2 border border-white/[0.06] rounded-xl hover:border-[#00f0ff]/30 hover:bg-white/[0.03] text-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm"
                    >
                      <EditOutlined />
                    </button>
                    {(project.status === 'draft' || project.status === 'rejected_online') && (
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-4 py-2 border border-white/[0.06] rounded-xl hover:border-red-500/30 hover:text-red-400 hover:bg-white/[0.03] text-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm"
                      >
                        <DeleteOutlined />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
