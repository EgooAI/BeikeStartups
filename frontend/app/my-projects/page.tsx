'use client';

import { useEffect, useState } from 'react';
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
      draft: 'bg-[#f5f0e8] text-[#8b7e6a]',
      pending_online: 'bg-yellow-100 text-yellow-600',
      online: 'bg-green-100 text-green-600',
      rejected_online: 'bg-red-100 text-red-600',
      pending_offline: 'bg-yellow-100 text-yellow-600',
      offline: 'bg-[#f5f0e8] text-[#8b7e6a]',
      rejected_offline: 'bg-red-100 text-red-600',
      invalid: 'bg-red-100 text-red-600',
    };
    return colorMap[status] || 'bg-[#f5f0e8] text-[#8b7e6a]';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ec]/50 flex items-center justify-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#e8dfd0] border-t-[#0a2a5c] animate-spin" />
          <div className="absolute inset-[4px] rounded-full border-[3px] border-[#e8dfd0] border-b-[#0a2a5c] animate-[spin_0.8s_linear_reverse_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0a2a5c]">我的项目</h1>
            <p className="text-[#8b7e6a] mt-1">管理您团队的所有项目</p>
          </div>
          {user?.role !== 'student' && (
            <button
              onClick={() => router.push('/projects/create')}
              className="px-6 py-3 bg-[#0a2a5c] text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-medium flex items-center"
            >
              <PlusOutlined className="mr-2" />创建项目
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="bg-[#fefcf8] border border-[#e8dfd0] rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <InboxOutlined className="text-3xl text-[#8b7e6a]" />
            </div>
            <p className="text-[#8b7e6a] mb-4">暂无项目</p>
            {user?.role !== 'student' && (
              <button
                onClick={() => router.push('/projects/create')}
                className="text-[#0a2a5c] hover:text-[#0a2a5c]/80 font-medium"
              >
                创建第一个项目 →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-[#fefcf8] border border-[#e8dfd0] rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-extrabold tracking-tight text-[#0a2a5c]">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    <p className="text-[#8b7e6a] text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-4 text-xs text-[#a89880]">
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
                        className="px-4 py-2 bg-[#f59e0b] text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm flex items-center"
                      >
                        <SendOutlined className="mr-1" />申请上架
                      </button>
                    )}
                    {project.status === 'pending_online' && (
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-600 rounded-xl text-sm flex items-center">
                        等待审核
                      </span>
                    )}
                    <button
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="px-4 py-2 border border-[#e8dfd0] rounded-xl hover:border-[#0a2a5c]/20 hover:bg-[#faf7f2] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => router.push(`/projects/${project.id}/edit`)}
                      className="px-4 py-2 border border-[#e8dfd0] rounded-xl hover:border-[#0a2a5c]/20 hover:bg-[#faf7f2] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm"
                    >
                      <EditOutlined />
                    </button>
                    {(project.status === 'draft' || project.status === 'rejected_online') && (
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-4 py-2 border border-[#e8dfd0] rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-[#faf7f2] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm"
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
